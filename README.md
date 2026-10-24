# CortexAI

CortexAI is a full-stack AI chat application built with React on the frontend and multiple Express microservices on the backend. It combines Google sign-in, Redis-backed session management, MongoDB-backed chat history, and a LangGraph-powered multi-agent orchestration layer for different assistant modes.

The app lets users:
- sign in with Google
- create and manage chat conversations
- send prompts to different agents such as Chat, Search, Coding, PDF, PPT, and Vision
- receive AI responses rendered as rich markdown with code blocks and images
- persist conversations and messages in MongoDB

## Architecture overview

```text
Frontend (React + Vite)
    |
    v
Gateway (Express)
  ├── /api/auth      -> Auth Service
  ├── /api/chat      -> Chat Service
  ├── /api/agent    -> Agent Service
  └── /api/me       -> current user from session

Auth Service (Express + Firebase Admin + Redis)
  - Google token verification
  - user creation and session cookie storage

Chat Service (Express + MongoDB)
  - create conversation
  - list conversations
  - save messages
  - fetch message history

Agent Service (Express + LangGraph + LLM providers)
  - routes prompt to selected agent
  - calls LLMs via Groq / Google Gemini
  - supports multi-agent selection and image responses

Shared services
  - Redis: session state and auth cookies
  - MongoDB: user/conversation/message data
```

## Tech stack

### Frontend
- React 19
- Vite
- Redux Toolkit
- Tailwind CSS
- Firebase client SDK
- react-markdown, remark-gfm, and syntax highlighting

### Backend
- Node.js + Express
- MongoDB + Mongoose
- Redis via ioredis
- Firebase Admin SDK
- LangChain + LangGraph
- AI providers: Groq and Google Generative AI

## Repository structure

```text
cortexAI/
├── backend/
│   ├── gateway/                # API gateway and auth middleware
│   │   ├── controllers/
│   │   ├── middleware/
│   │   ├── utils/
│   │   ├── .env
│   │   ├── index.js
│   │   └── package.json
│   │
│   ├── services/
│   │   ├── Auth/               # Firebase-based auth service
│   │   │   ├── config/
│   │   │   ├── controller/
│   │   │   ├── models/
│   │   │   ├── routes/
│   │   │   ├── .env
│   │   │   └── index.js
│   │   │
│   │   ├── chat/               # conversation + message service
│   │   │   ├── controllers/
│   │   │   ├── models/
│   │   │   ├── routes/
│   │   │   ├── .env
│   │   │   └── index.js
│   │   │
│   │   └── agent/              # LangGraph-powered AI agent service
│   │       ├── agents/
│   │       ├── config/
│   │       ├── graph/
│   │       ├── controllers/
│   │       ├── routes/
│   │       ├── .env
│   │       └── index.js
│   │
│   └── shared/
│       └── redis/redis.js
│
├── frontend/
│   ├── src/
│   ├── public/
│   ├── utils/
│   ├── .env
│   ├── package.json
│   └── vite.config.js
│
├── .gitignore
├── README.md
└── .vscode/
```

## Prerequisites

Before running the project, make sure you have:
- Node.js 18+ installed
- npm installed
- MongoDB running locally or accessible via MongoDB Atlas
- Redis running locally or accessible via remote Redis
- Firebase project configured for Google sign-in
- API keys for Groq and Google Generative AI

You also need a Firebase Admin service account JSON file for the Auth service:
- `backend/services/Auth/serviceAccountKey.json`

This file is used by the Firebase Admin SDK to verify Google tokens.

## Environment variables

Create the following `.env` files and fill them with your own values.

### Frontend: `frontend/.env`

```env
VITE_FIREBASE_API_KEY="your-firebase-web-api-key"
VITE_SERVER_URL="http://localhost:8000"
```

### Gateway: `backend/gateway/.env`

```env
PORT=8000
AUTH_SERVICE="http://localhost:8001"
CHAT_SERVICE="http://localhost:8002"
AGENT_SERVICE="http://localhost:8003"
FRONTEND_URL="http://localhost:5173"
REDIS_URL="redis://localhost:6379"
```

### Auth service: `backend/services/Auth/.env`

```env
PORT=8001
MONGODB_URI="mongodb://localhost:27017/cortex-auth"
REDIS_URL="redis://localhost:6379"
```

### Chat service: `backend/services/chat/.env`

```env
PORT=8002
MONGODB_URI="mongodb://localhost:27017/cortex-chat"
```

### Agent service: `backend/services/agent/.env`

```env
PORT=8003
MONGODB_URI="mongodb://localhost:27017/cortex-agent"
GROQ_API_KEY="your-groq-key"
GOOGLE_API_KEY="your-google-generative-ai-key"
CHAT_SERVICE="http://localhost:8002"
REDIS_URL="redis://localhost:6379"
TAVILY_API_KEY="your-tavily-key"
```

Notes:
- If you are using MongoDB Atlas, replace the localhost URI with your connection string.
- Keep the Redis URL consistent across all services that use it.
- The actual keys for your providers should be stored securely and never committed to source control.

## Install dependencies

From the project root, install dependencies for each app:

```bash
cd frontend && npm install
cd ../backend/gateway && npm install
cd ../services/Auth && npm install
cd ../chat && npm install
cd ../agent && npm install
```

If you prefer, run each install in separate terminals or use a process manager such as `concurrently`.

## Run the app

Start the required infrastructure first:
- MongoDB
- Redis
- Firebase project configured for client + admin auth

Then launch services in separate terminals.

### 1) Start Auth service

```bash
cd backend/services/Auth
npm run dev
```

### 2) Start Chat service

```bash
cd backend/services/chat
npm run dev
```

### 3) Start Agent service

```bash
cd backend/services/agent
npm run dev
```

### 4) Start Gateway

```bash
cd backend/gateway
npm run dev
```

### 5) Start Frontend

```bash
cd frontend
npm run dev
```

The frontend should open on:
- http://localhost:5173

The backend gateway listens on:
- http://localhost:8000

## Default service ports

| Service | Port |
|---|---:|
| Frontend | 5173 |
| Gateway | 8000 |
| Auth Service | 8001 |
| Chat Service | 8002 |
| Agent Service | 8003 |

## Main application flow

1. User opens the frontend and enters the Google sign-in flow.
2. The frontend sends the Google ID token to the Auth Service.
3. The Auth Service verifies the token, creates or updates the user, and stores a session in Redis.
4. The gateway protects routes with a session check and attaches the authenticated user to the request.
5. The frontend requests conversations and messages through the Chat Service.
6. When the user sends a message, the frontend posts to the Agent Service via the gateway.
7. The Agent Service routes the request to a selected agent (chat, search, coding, PDF, PPT, or vision).
8. The LLM-generated answer is saved to MongoDB and returned to the client.

## API summary

### Auth routes
- `POST /api/auth/login` — authenticate with Google token
- `GET /api/auth/logout` — clear session cookie

### Gateway-protected endpoints
- `GET /api/me` — return current authenticated user
- `GET /api/chat/get-conversation` — read conversations for current user
- `GET /api/chat/create-conversation` — create a new conversation
- `POST /api/chat/save-message` — save a message to a conversation
- `POST /api/chat/update-conversation` — update conversation title
- `GET /api/chat/get-message/:conversationId` — retrieve messages for a conversation
- `POST /api/agent/chat` — send a prompt to the agent workflow

## Agent modes

The Agent Service supports these routing modes:
- `chat` — general conversation and explanations
- `search` — internet and current-event lookups
- `coding` — code generation and debugging
- `pdf` — PDF/document-related tasks
- `ppt` — PPT/document-generation tasks
- `vision` — image generation or vision-based tasks
- `auto` — router decides based on the prompt

## Frontend features

- Google login modal
- collapsible conversation sidebar
- conversation creation and selection
- rich message rendering with Markdown support
- syntax highlighting for code blocks
- image attachments in chat responses
- modern dark-themed UI

## Development notes

A few implementation details matter during local development:
- The gateway expects cookies from the auth service to be present.
- The gateway uses `FRONTEND_URL` for CORS configuration.
- The Auth service reads Firebase admin credentials from `serviceAccountKey.json`.
- The Agent service uses multiple model providers and should be configured with valid keys before testing.

## Common troubleshooting

### Redis connection errors
- Ensure Redis is installed and running locally.
- Check that the `REDIS_URL` values match your local or remote instance.

### MongoDB connection errors
- Verify the MongoDB URI is valid.
- Check that the database is reachable from the machine running the service.

### Firebase auth errors
- Ensure `serviceAccountKey.json` is present in `backend/services/Auth/`.
- Verify your Firebase project is configured correctly.
- Check that the frontend Firebase web API key matches the project.

### Agent service errors
- Confirm `GROQ_API_KEY` and `GOOGLE_API_KEY` are set.
- Make sure the model provider libraries are installed correctly with `npm install`.

### Frontend cannot reach backend
- Check that `VITE_SERVER_URL` matches the gateway URL.
- Ensure the gateway is running before opening the app.

## Production considerations

This project is structured as a multi-service application and is suitable as a local development foundation. For production, you would typically add:
- environment-based deployment configuration
- CI/CD pipelines
- containerization with Docker
- HTTPS and secure cookie settings
- request validation and rate limiting
- logging, tracing, and monitoring
- secrets management (AWS Secrets Manager, Azure Key Vault, or similar)
- proper auth/session hardening and CORS policies

## License

This project does not currently declare a specific license in the repository. If you plan to distribute or publish it, add a license file and document the intended usage terms.

## Summary

CortexAI is a modern AI chat platform with a microservice backend and a polished React frontend. It demonstrates how to connect user authentication, multi-agent LLM routing, persistent conversation history, and rich UI rendering into a cohesive product flow.

If you want, this README can also be expanded with:
- a screenshot gallery
- a real architecture diagram
- an API contract section with example request/response payloads
- a Docker-based setup for one-command startup

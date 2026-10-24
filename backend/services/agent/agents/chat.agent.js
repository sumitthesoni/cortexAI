import {
  AIMessage,
  HumanMessage,
  SystemMessage,
} from "@langchain/core/messages";
import { getEncoding } from "js-tiktoken";
import { getModel } from "../config/llmModel.js";
import { getMemory } from "../config/memory.js";

const MAX_INPUT_TOKENS = 6000;
const MAX_OUTPUT_TOKENS = 1024;
const MESSAGE_TOKEN_OVERHEAD = 10;
const MAX_SEARCH_RESULTS = 5;
const MAX_SEARCH_SNIPPET_TOKENS = 700;
const encoding = getEncoding("o200k_base");

const countTokens = (text) => encoding.encode(text).length;

export const chatAgent = async (state) => {
  const llm = await getModel("chat");

  const history = await getMemory(state.conversationId);

  const createSystemPrompt = (searchContext) => `You are CortexAI, an intelligent AI assistant.

  ${searchContext ? `Web Search Results:\n${searchContext}\nAnswer the user using the above search results.` : ""}

  if searchContext exists:

  - Use search results to answer.
  - Do not mention internal tools.

  Rules:
  - For simple questions, greetings, and short queries, respond naturally in plain text.
  - For technical, educational, coding, or detailed topics, use clean Markdown. 

Formatting:
- Use # for titles and ## for sections.
- Leave a blank line after headings.
- Use bullet points for lists.
- Use numbered lists for steps.
- Use fenced code blocks with language tags for code.
- Keep paragraphs short and readable.
- Never write headings and content on the same line.
- Never generate large walls of text.`;

  const promptTokens = countTokens(state.prompt);
  let searchContext = "";
  const searchResults = Array.isArray(state.searchResults)
    ? state.searchResults
    : Array.isArray(state.searchResults?.results)
      ? state.searchResults.results
      : [];

  for (const result of searchResults.slice(0, MAX_SEARCH_RESULTS)) {
    if (!result || typeof result !== "object") {
      continue;
    }

    const title = typeof result.title === "string" ? result.title.slice(0, 300) : "";
    const url = typeof result.url === "string" ? result.url.slice(0, 500) : "";
    const content = typeof result.content === "string" ? result.content : "";
    const entryPrefix = `\n- ${title}${url ? ` (${url})` : ""}\n`;
    const prefixTokens =
      countTokens(createSystemPrompt(searchContext + entryPrefix)) +
      promptTokens +
      MESSAGE_TOKEN_OVERHEAD * 2;
    const availableTokens = Math.min(
      MAX_SEARCH_SNIPPET_TOKENS,
      MAX_INPUT_TOKENS - prefixTokens - 50,
    );

    if (availableTokens <= 0) {
      break;
    }

    const snippet = encoding.decode(
      encoding.encode(content).slice(0, availableTokens),
    );
    searchContext += `${entryPrefix}${snippet}`;
  }

  if (
    countTokens(createSystemPrompt(searchContext)) +
      promptTokens +
      MESSAGE_TOKEN_OVERHEAD * 2 >
    MAX_INPUT_TOKENS
  ) {
    throw new Error("The prompt and system instructions exceed the model input budget.");
  }

  const messages = [new SystemMessage(createSystemPrompt(searchContext))];
  let inputTokens =
    countTokens(messages[0].content) +
    promptTokens +
    MESSAGE_TOKEN_OVERHEAD * 2;
  const recentHistory = [];

  for (let index = history.length - 1; index >= 0; index -= 1) {
    const msg = history[index];
    if (typeof msg.content !== "string") {
      continue;
    }

    const historyTokens = countTokens(msg.content) + MESSAGE_TOKEN_OVERHEAD;
    if (inputTokens + historyTokens > MAX_INPUT_TOKENS) {
      break;
    }

    recentHistory.unshift(msg);
    inputTokens += historyTokens;
  }

  recentHistory.forEach((msg) => {
    if (msg.role === "user") {
      messages.push(new HumanMessage(msg.content));
    } else {
      messages.push(new AIMessage(msg.content));
    }
  });

  messages.push(new HumanMessage(state.prompt));
  const response = await llm.invoke(messages, {
    max_completion_tokens: MAX_OUTPUT_TOKENS,
  });
  const answer =
    typeof response.content === "string"
      ? response.content
      : Array.isArray(response.content)
        ? response.content
            .map((block) =>
              typeof block === "string"
                ? block
                : typeof block?.text === "string"
                  ? block.text
                  : "",
            )
            .filter(Boolean)
            .join("\n")
        : "";

  if (!answer.trim()) {
    throw new Error("The assistant returned an empty response.");
  }

  return {
    ...state,
    aiResponse: answer,
  };
};

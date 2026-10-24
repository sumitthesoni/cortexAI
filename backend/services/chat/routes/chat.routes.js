import express from "express";
import {
  createConversation,
  getConversations,
  getMessages,
  saveMessage,
  updateConversation,
} from "../controllers/chat.controller.js";

const router = express.Router();

router.get("/create-conversation", createConversation);
router.get("/get-conversation", getConversations);
router.post("/save-message", saveMessage);
router.post("/update-conversation", updateConversation);
router.get("/get-message/:conversationId", getMessages);

export default router;

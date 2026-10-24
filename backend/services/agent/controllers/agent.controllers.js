import axios from "axios";
import { graph } from "../graph/graph.js";
import { addMessage } from "../config/memory.js";

export const agent = async (req, res) => {
  let stage = "saving user message";

  try {
    const { prompt, conversationId, agent } = req.body;

    await axios.post(`${process.env.CHAT_SERVICE}/save-message`, {
      conversationId: conversationId,
      role: "user",
      content: prompt,
    });

    stage = "running agent graph";
    const result = await graph.invoke({
      prompt,
      conversationId,
      agent,
    });
    const response = result.aiResponse;
    if (typeof response !== "string" || !response.trim()) {
      console.error("Agent graph completed without a text response:", {
        agent: result.agent,
      });
      return res.status(502).json({
        message: "The selected agent did not return a response. Please try Chat or Search.",
      });
    }

    stage = "saving assistant message";
    await addMessage(conversationId, "user", prompt);
    await addMessage(conversationId, "assistant", response);
    await axios.post(`${process.env.CHAT_SERVICE}/save-message`, {
      conversationId,
      role: "assistant",
      content: response,
      images:result.images
    });

    return res.status(200).json({
      answer: result.aiResponse,
      images: result.images,
    });
  } catch (error) {
    const upstreamStatus = error.response?.status ?? error.status;
    const status = upstreamStatus === 504 ? 504 : 500;

    console.error(`Agent request failed while ${stage}:`, {
      message: error.message,
      stack: error.stack,
      code: error.code,
      upstreamStatus,
      upstreamData: error.response?.data,
    });

    return res.status(status).json({
      message: `Agent request failed while ${stage}`,
    });
  }
};

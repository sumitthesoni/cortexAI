import mongoose from "mongoose";

const coversationSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      default: "New Chat",
    },
    userId: {
      type: String,
    },
  },
  { timestamps: true },
);

const Conversation = mongoose.model("Conversation", coversationSchema);

export default Conversation;

import { createSlice } from "@reduxjs/toolkit";

const messageSlice = createSlice({
  name: "message",
  initialState: {
    messagesByConversation: {},
  },
  reducers: {
    setMessages: (state, action) => {
      const { conversationId, messages } = action.payload;
      state.messagesByConversation[conversationId] = messages;
    },
    mergeMessages: (state, action) => {
      const { conversationId, messages } = action.payload;
      const currentMessages = state.messagesByConversation[conversationId] || [];
      const mergedMessages = [...messages];
      const availableMessages = new Map();

      for (const message of messages) {
        const key = JSON.stringify([message.role, message.content]);
        availableMessages.set(key, (availableMessages.get(key) || 0) + 1);
      }

      for (const message of currentMessages) {
        const key = JSON.stringify([message.role, message.content]);
        const availableCount = availableMessages.get(key) || 0;
        if (availableCount > 0) {
          availableMessages.set(key, availableCount - 1);
        } else {
          mergedMessages.push(message);
        }
      }

      state.messagesByConversation[conversationId] = mergedMessages;
    },
    addMessage: (state, action) => {
      const { conversationId, message } = action.payload;
      state.messagesByConversation[conversationId] ??= [];
      state.messagesByConversation[conversationId].push(message);
    },
  },
});

export const { setMessages, mergeMessages, addMessage } = messageSlice.actions;
export default messageSlice.reducer;

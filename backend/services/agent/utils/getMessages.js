import axios from "axios";
export const getMessages = async (conversationId) => {
  const { data } = await axios.get(
    `${process.env.CHAT_SERVICE}/get-message/${conversationId}`,
  );
  return data;
};

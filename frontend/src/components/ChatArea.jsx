import { useEffect, useRef } from "react";
import Nav from "./Nav";
import MessageList from "./MessageList";
import ChatInput from "./chatInput";
import { useDispatch, useSelector } from "react-redux";
import getMessages from "../features/getMessages";
import { mergeMessages } from "../redux/messageSlice";

function ChatArea() {
  const { selectedConversation } = useSelector((state) => state.conversation);
  const selectedConversationId = selectedConversation?._id;
  const selectedConversationTitle = selectedConversation?.title;
  const dispatch = useDispatch();
  const handledConversationId = useRef(null);

  useEffect(() => {
    if (
      !selectedConversationId ||
      handledConversationId.current === selectedConversationId
    ) {
      return;
    }

    handledConversationId.current = selectedConversationId;
    if (selectedConversationTitle === "New Chat") return;

    let isCurrentConversation = true;
    const getMessage = async () => {
      const data = await getMessages(selectedConversationId);
      if (isCurrentConversation) {
        dispatch(
          mergeMessages({
            conversationId: selectedConversationId,
            messages: data,
          }),
        );
      }
    };
    getMessage();

    return () => {
      isCurrentConversation = false;
    };
  }, [selectedConversationId, selectedConversationTitle, dispatch]);
  return (
    <div className="flex-1 flex flex-col min-w-0">
      <Nav />
      <MessageList />
      <ChatInput />
    </div>
  );
}

export default ChatArea;

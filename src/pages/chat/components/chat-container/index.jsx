import { useState } from "react";
import ChatHeader from "./components/chat-header";
import MessageBar from "./components/message-bar";
import MessageContainer from "./components/message-container";

const ChatContainer = () => {
  const [message, setMessage] = useState("");
  return (
    <div className="fixed top-0 h-[100vh] w-[100vw] bg-[#1c1d25] flex flex-col md:static md:flex-1">
      <ChatHeader setMessage={setMessage} />
      <MessageContainer />
      <MessageBar message={message} setMessage={setMessage} />
    </div>
  );
};

export default ChatContainer;

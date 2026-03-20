import React from "react";
import Chat from "../components/chat";

function ChatPage({ user, setUser }) {
  return <Chat user={user} setUser={setUser} />;
}

export default ChatPage;
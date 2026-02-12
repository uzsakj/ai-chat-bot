import React, { useState } from 'react'
import ChatBotStart from './components/ChatBotStart'
import ChatBotApp from './components/ChatBotApp'
import { v4 as uuidv4 } from 'uuid';

const loadStoredChats = () => {
  try {
    return JSON.parse(localStorage.getItem('chats')) || [];
  } catch {
    return [];
  }
};

const App = () => {
  const [isChatting, setIsChatting] = useState(false);
  const [chats, setChats] = useState(loadStoredChats);
  const [activeChat, setActiveChat] = useState(() => {
    const stored = loadStoredChats();
    return stored.length > 0 ? stored[0].id : null;
  });

  const createNewChat = (initialMessageOrMessages) => {
    const messages = Array.isArray(initialMessageOrMessages)
      ? initialMessageOrMessages
      : (initialMessageOrMessages && initialMessageOrMessages.text !== undefined)
        ? [initialMessageOrMessages]
        : [];
    const newChat = {
      id: uuidv4(),
      displayId: `Chat ${new Date().toLocaleDateString('en-GB')} ${new Date().toLocaleTimeString()}`,
      messages,
    };

    const updatedChats = [newChat, ...chats];
    setChats(updatedChats);
    localStorage.setItem('chats', JSON.stringify(updatedChats));
    localStorage.setItem(newChat.id, JSON.stringify(newChat));
    setActiveChat(newChat.id);
  }

  const handleStartChat = () => {
    setIsChatting(true);
    if (chats.length === 0) {
      createNewChat();
    }
  };

  const handlegoBack = () => {
    setIsChatting(false);
  };
  return (
    <div className='container'>
      {isChatting ? (
        <ChatBotApp
          onGoBack={handlegoBack}
          chats={chats}
          setChats={setChats}
          activeChat={activeChat}
          setActiveChat={setActiveChat}
          onNewChat={createNewChat} />
      ) : (
        <ChatBotStart onStartChat={handleStartChat} />
      )}
    </div>
  )
}

export default App

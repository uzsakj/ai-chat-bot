import React, { useState } from 'react'
import ChatBotStart from './components/ChatBotStart'
import ChatBotApp from './components/ChatBotApp'
const App = () => {
  const [isChatting, setIsChatting] = useState(false);

  const handleStartChat = () => {
    setIsChatting(true);
  }

  const handlegoBack = () => {
    setIsChatting(false);
  }
  return (
    <div className='container'>
      {isChatting ? (
        <ChatBotApp onGoBack={handlegoBack} />
      ) : (
        <ChatBotStart onStartChat={handleStartChat} />
      )}
    </div>
  )
}

export default App

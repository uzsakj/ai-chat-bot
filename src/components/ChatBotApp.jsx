import React from 'react'
import './ChatBotApp.css'
import { useState } from 'react';

const ChatBotApp = ({ onGoBack, chats, setChats }) => {
    const [inputValue, setInputValue] = useState('');
    const [messages, setMessages] = useState(chats[0]?.messages || []);

    const handleInputChange = (e) => {
        setInputValue(e.target.value);
    }

    const handleKeyDown = (e) => {
        if (e.key === 'Enter') {
            sendMessage();
        }
    }

    const sendMessage = () => {
        if (inputValue.trim() === '') return;
        const newMessage = {
            type: 'prompt',
            text: inputValue,
            timestamp: new Date().toLocaleTimeString(),
        };

        const updatedMessages = [...messages, newMessage];
        setMessages(updatedMessages);
        setInputValue('');

        const updatedChats = chats.map((chat, index) => {
            if (index === 0) {
                return { ...chat, messages: updatedMessages };
            }
            return chat;
        })

        setChats(updatedChats);
    }

    return (
        <div className='chat-app'>
            <div className="chat-list">
                <div className="chat-list-header">
                    <h1>Chat List</h1>
                    <i className="bx bx-edit-alt new-chat"></i>
                </div>
                {chats.map((chat, index) => (
                    <div className={`chat-list-item ${index === 0 ? 'active' : ''}`} key={index}>
                        <h4>{chat.id}</h4>
                        <i className="bx bx-x-circle"></i>
                    </div>
                ))}
            </div>
            <div className="chat-window">
                <div className="chat-title">
                    <h3>Chat with AI</h3>
                    <i className="bx bx-arrow-back arrow" onClick={onGoBack}></i>
                </div>
                <div className="chat">
                    {messages.map((message, index) => (
                        <div className={`${message.type === 'prompt' ? 'prompt' : 'response'}`} key={index}>
                            {message.text}
                            <span>{message.timestamp}</span>
                        </div>
                    ))}
                </div>
                <div className="typing">Typing...</div>
                <form
                    className='msg-form'
                    onSubmit={(e) => e.preventDefault()}
                    onKeyDown={handleKeyDown}>
                    <i className="fa-solid fa-face-smile emoji"></i>
                    <input
                        type="text"
                        className='msg-input'
                        placeholder='Type a message...'
                        value={inputValue}
                        onChange={handleInputChange}
                    />
                    <i className="fa-solid fa-paper-plane" onClick={sendMessage}></i>
                </form>
            </div>
        </div>
    )
}

export default ChatBotApp
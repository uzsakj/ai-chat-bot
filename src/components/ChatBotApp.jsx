import React from 'react'
import './ChatBotApp.css'
import { useState } from 'react';


const ChatBotApp = ({ onGoBack, chats, setChats, activeChat, setActiveChat, onNewChat }) => {
    const [inputValue, setInputValue] = useState('');
    const activeChatObj = chats.find((chat) => chat.id === activeChat);
    const messages = activeChatObj?.messages ?? [];

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

        if (!activeChat) {
            onNewChat(newMessage);
            setInputValue('');
        } else {
            const updatedMessages = [...messages, newMessage];
            setInputValue('');

            const updatedChats = chats.map((chat) =>
                chat.id === activeChat ? { ...chat, messages: updatedMessages } : chat
            );
            setChats(updatedChats);
        }
    }

    const handleSelectChat = (chatId) => {
        setActiveChat(chatId);
    }

    const handleDeleteChat = (chatId) => {
        const updatedChats = chats.filter((chat) => chat.id !== chatId);
        setChats(updatedChats);
        if (chatId === activeChat) {
            const updatedActiveChat = updatedChats.length > 0 ? updatedChats[0].id : null;
            setActiveChat(updatedActiveChat);
        }
    }

    return (
        <div className='chat-app'>
            <div className="chat-list">
                <div className="chat-list-header">
                    <h1>Chat List</h1>
                    <i className="bx bx-edit-alt new-chat" onClick={() => onNewChat()}></i>
                </div>
                {chats.map((chat) => (
                    <div
                        className={`chat-list-item ${chat.id === activeChat ? 'active' : ''}`}
                        key={chat.id}
                        onClick={() => handleSelectChat(chat.id)}>
                        <h4>{chat.displayId}</h4>
                        <i
                            className="bx bx-x-circle"
                            onClick={(e) => {
                                e.stopPropagation();
                                handleDeleteChat(chat.id);
                            }}></i>
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
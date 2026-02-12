import React from 'react'
import './ChatBotApp.css'
import { useState, useRef, useEffect, useMemo } from 'react';
import { sendMessage as sendToGemini } from '../lib/gemini';

const ChatBotApp = ({ onGoBack, chats, setChats, activeChat, setActiveChat, onNewChat }) => {
    const [inputValue, setInputValue] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    const chatEndRef = useRef(null);
    const activeChatObj = chats.find((chat) => chat.id === activeChat);
    const messages = useMemo(
        () => activeChatObj?.messages ?? [],
        [activeChatObj?.messages]
    );


    useEffect(() => {
        chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const handleInputChange = (e) => {
        setInputValue(e.target.value);
        setError(null);
    }

    const handleKeyDown = (e) => {
        if (e.key === 'Enter') {
            sendMessage();
        }
    }

    const sendMessage = async () => {
        if (inputValue.trim() === '' || isLoading) return;

        const userMessage = {
            type: 'prompt',
            text: inputValue,
            timestamp: new Date().toLocaleTimeString(),
        };
        setInputValue('');
        setError(null);

        if (!activeChat) {
            setIsLoading(true);
            try {
                const responseText = await sendToGemini(userMessage.text, []);
                const responseMessage = {
                    type: 'response',
                    text: responseText,
                    timestamp: new Date().toLocaleTimeString(),
                };
                onNewChat([userMessage, responseMessage]);
            } catch (err) {
                setError(err.message ?? 'Failed to get response from AI');
                onNewChat([userMessage]);
            } finally {
                setIsLoading(false);
            }
        } else {
            const updatedMessages = [...messages, userMessage];
            const updatedChats = chats.map((chat) =>
                chat.id === activeChat ? { ...chat, messages: updatedMessages } : chat
            );
            setChats(updatedChats);
            setIsLoading(true);

            try {
                const responseText = await sendToGemini(userMessage.text, messages);
                const responseMessage = {
                    type: 'response',
                    text: responseText,
                    timestamp: new Date().toLocaleTimeString(),
                };
                const finalMessages = [...updatedMessages, responseMessage];
                setChats((prev) =>
                    prev.map((chat) =>
                        chat.id === activeChat ? { ...chat, messages: finalMessages } : chat
                    )
                );
            } catch (err) {
                setError(err.message ?? 'Failed to get response from AI');
            } finally {
                setIsLoading(false);
            }
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
                    <div ref={chatEndRef}></div>
                </div>
                {isLoading && <div className="typing">Typing...</div>}
                {error && <div className="chat-error">{error}</div>}
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
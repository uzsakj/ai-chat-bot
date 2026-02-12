import React from 'react'
import './ChatBotApp.css'
import { useState, useRef, useEffect, useMemo } from 'react';
import { sendMessage as sendToGemini } from '../lib/gemini';
import Picker from '@emoji-mart/react';
import data from '@emoji-mart/data';

const ChatBotApp = ({ onGoBack, chats, setChats, activeChat, setActiveChat, onNewChat }) => {
    const [inputValue, setInputValue] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    const [showEmojiPicker, setShowEmojiPicker] = useState(false);
    const [showChatList, setShowChatList] = useState(false);

    const chatEndRef = useRef(null);
    const activeChatObj = chats.find((chat) => chat.id === activeChat);
    const messages = useMemo(
        () => activeChatObj?.messages ?? [],
        [activeChatObj?.messages]
    );

    useEffect(() => {
        if (!activeChat) return;
        const stored = JSON.parse(localStorage.getItem(activeChat));
        const storedMessages = stored?.messages ?? [];
        if (storedMessages.length > 0) {
            setChats(prev => prev.map(chat =>
                chat.id === activeChat ? { ...chat, messages: storedMessages } : chat
            ));
        }
    }, [activeChat, setChats]);

    useEffect(() => {
        chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const handleEmojiSelect = (emoji) => {
        setInputValue(prevInputValue => prevInputValue + emoji.native);
        setShowEmojiPicker(false);
    }

    const handleInputChange = (e) => {
        setInputValue(e.target.value);
        setError(null);
    }

    const handleKeyDown = (e) => {
        if (e.key === 'Enter') {
            sendMessage();
        }
    }

    const createMessage = (type, text) => ({
        type,
        text,
        timestamp: new Date().toLocaleTimeString(),
    });

    const updateChatAndPersist = (chatId, messages) => {
        setChats(prev => {
            const updated = prev.map(c => c.id === chatId ? { ...c, messages } : c);
            localStorage.setItem(chatId, JSON.stringify({ messages }));
            localStorage.setItem('chats', JSON.stringify(updated));
            return updated;
        });
    };

    const sendNewChat = async (userMessage) => {
        setIsLoading(true);
        try {
            const responseText = await sendToGemini(userMessage.text, []);
            const responseMessage = createMessage('response', responseText);
            onNewChat([userMessage, responseMessage]);
        } catch (err) {
            setError(err.message ?? 'Failed to get response from AI');
            onNewChat([userMessage]);
        } finally {
            setIsLoading(false);
        }
    };

    const sendExistingChat = async (userMessage) => {
        const messagesWithUser = [...messages, userMessage];
        updateChatAndPersist(activeChat, messagesWithUser);
        setIsLoading(true);

        try {
            const responseText = await sendToGemini(userMessage.text, messages);
            const responseMessage = createMessage('response', responseText);
            const finalMessages = [...messagesWithUser, responseMessage];
            updateChatAndPersist(activeChat, finalMessages);
        } catch (err) {
            setError(err.message ?? 'Failed to get response from AI');
        } finally {
            setIsLoading(false);
        }
    };

    const sendMessage = async () => {
        if (inputValue.trim() === '' || isLoading) return;

        const userMessage = createMessage('prompt', inputValue);
        setInputValue('');
        setError(null);

        if (!activeChat) {
            await sendNewChat(userMessage);
        } else {
            await sendExistingChat(userMessage);
        }
    };

    const handleSelectChat = (chatId) => {
        setActiveChat(chatId);
    }

    const handleDeleteChat = (chatId) => {
        const updatedChats = chats.filter((chat) => chat.id !== chatId);
        setChats(updatedChats);
        localStorage.setItem('chats', JSON.stringify(updatedChats));
        localStorage.removeItem(chatId);

        if (chatId === activeChat) {
            const updatedActiveChat = updatedChats.length > 0 ? updatedChats[0].id : null;
            setActiveChat(updatedActiveChat);
        }
    }

    return (
        <div className='chat-app'>
            <div className={`chat-list ${showChatList ? 'show' : ''}`}>
                <div className="chat-list-header">
                    <h1>Chat List</h1>
                    <i className="bx bx-edit-alt new-chat" onClick={() => onNewChat()}></i>
                    <i className="bx bx-x-circle" onClick={() => setShowChatList(false)}></i>
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
                    <i className="bx bx-menu" onClick={() => setShowChatList(true)}></i>
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
                    {isLoading && <div className="typing">Typing...</div>}
                    {error && <div className="chat-error">{error}</div>}
                    <div ref={chatEndRef}></div>
                </div>

                <form
                    className='msg-form'
                    onSubmit={(e) => e.preventDefault()}
                    onKeyDown={handleKeyDown}>
                    <i className="fa-solid fa-face-smile emoji" onClick={() => setShowEmojiPicker((prev) => !prev)}></i>
                    {showEmojiPicker && (
                        <div className="picker">
                            <Picker onEmojiSelect={handleEmojiSelect} data={data} />
                        </div>
                    )}
                    <input
                        type="text"
                        className='msg-input'
                        placeholder='Type a message...'
                        value={inputValue}
                        onChange={handleInputChange}
                        onFocus={() => setShowEmojiPicker(false)}
                    />
                    <i className="fa-solid fa-paper-plane" onClick={sendMessage}></i>
                </form>
            </div>
        </div>
    )
}

export default ChatBotApp
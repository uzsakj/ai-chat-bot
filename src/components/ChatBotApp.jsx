import React from 'react'
import './ChatBotApp.css'

const ChatBotApp = () => {
    return (
        <div className='chat-app'>
            <div className="chat-list">
                <div className="chat-list-header">
                    <h1>Chat List</h1>
                    <i className="bx bx-edit-alt new-chat"></i>
                </div>
                <div className="chat-list-item active">
                    <h4>Chat 2026/02/11 21:08:00</h4>
                    <i className="bx bx-x-circle"></i>
                </div>
                <div className="chat-list-item">
                    <h4>Chat 2026/02/11 21:08:00</h4>
                    <i className="bx bx-x-circle"></i>
                </div>
                <div className="chat-list-item">
                    <h4>Chat 2026/02/11 21:08:00</h4>
                    <i className="bx bx-x-circle"></i>
                </div>
            </div>
            <div className="chat-window">
                <div className="chat-title">
                    <h3>Chat with AI</h3>
                    <i className="bx bx-arrow-back arrow"></i>
                </div>
                <div className="chat">
                    <div className="prompt"> hello, how are you?
                        <span>2026/02/11 21:08:00</span></div>
                    <div className="response"> hello, im just a computer program?
                        <span>2026/02/11 21:08:00</span></div>
                </div>
                <div className="typing">Typing...</div>
                <form className='msg-form'>
                    <i className="fa-solid fa-face-smile emoji"></i>
                    <input type="text" className='msg-input' placeholder='Type a message...' />
                    <i className="fa-solid fa-paper-plane"></i>
                </form>
            </div>
        </div>
    )
}

export default ChatBotApp
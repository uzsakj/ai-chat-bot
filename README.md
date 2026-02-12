# AI Chatbot

A sleek chat interface powered by Google's Gemini. Have real conversations, keep multiple chats going, and bring your history with you—all in one place.

---

## What it does

This is a conversational AI chatbot that talks through Gemini. It’s built to feel like a chat app: you type, it replies, and it keeps context so the conversation stays coherent. You can start new chats, switch between them, and your messages stick around thanks to local storage.

---

## Technologies

- **React 19** — UI and state
- **Vite** — dev server and builds
- **Google Gemini** — AI backend via `@google/genai`
- **Emoji Mart** — emoji picker in the input
- **localStorage** — chat history persistence

---

## Features

- **Gemini integration** — Uses Gemini’s API for natural, conversational replies
- **Multiple chats** — Create, switch, and delete separate chat sessions
- **Persistent history** — Chats are stored locally so they survive refreshes
- **Responsive layout** — Works on desktop and mobile; chat list slides in as a drawer on smaller screens
- **Emoji support** — Click to add emojis in your messages
- **Typing indicator** — Shows when the AI is thinking
- **Error handling** — Clear feedback when something goes wrong

---

## Getting started

You’ll need a [Gemini API key](https://aistudio.google.com/apikey). Create a `.env` file in the project root:

```
VITE_GEMINI_API_KEY=your_api_key_here
```

Then:

```bash
npm install
npm run dev
```

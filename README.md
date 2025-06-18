# 📡 Social Chat Integration Backend

This is the **backend server** for a multi-platform social chat integration system. It enables users to connect their **Messenger**, **Telegram**, and **Instagram** accounts, view and manage conversations in real-time, and communicate across all channels from a unified dashboard.

> ✅ Built with **Node.js**, **TypeScript**, **Express**, **MongoDB**, **Socket.IO**, and secured with **Google OAuth2**.

---

## 🚀 Features

* 🔐 Google OAuth2 authentication
* 💬 Unified conversation handling from Messenger, Telegram (Instagram pending)
* 🧠 Smart participant detection per platform
* 🗃️ MongoDB-powered message and conversation storage
* 📡 Webhook support for Messenger & Telegram
* 🧵 Real-time updates with Socket.IO
* 🔄 Conversation synchronization and unread count tracking
* 📁 Modular structure with services, controllers, routes, and models

---

## 📁 Project Structure

```bash
src/
├── auth/                  # Google OAuth configuration
├── controllers/           # REST and webhook controllers for each platform
├── models/                # Mongoose schemas for Conversation and Message
├── routes/                # Express routers for auth, Messenger, Telegram...
├── services/              # Logic for handling platform-specific APIs
├── socket.ts              # Real-time Socket.IO setup
├── index.ts               # Main server entry
├── utility/               # Helpers: participant parsing, message formatting
├── types/                 # TypeScript interfaces and types
└── .env                   # Secrets and API keys (excluded from Git)
```

---

## 🔐 Authentication Flow

* Uses `passport-google-oauth20` to authenticate users
* Stores session data in secure, SameSite `express-session` cookies
* Auth state shared securely between backend and frontend (via HTTPS)

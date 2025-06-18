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

---

## ⚙️ Environment Configuration (`.env`)

```dotenv
# General
PORT=5000
BACKEND_URL=https://your-backend-url.com
FRONTEND_URL=https://your-frontend-url.com

# Google OAuth
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_secret
COOKIE_SECRET=your_session_cookie_secret

# Messenger
FB_PAGE_ACCESS_TOKEN=your_page_token
FB_API_URL=https://graph.facebook.com/v16.0
VERIFY_TOKEN=your_webhook_verify_token

# Telegram
TELEGRAM_BOT_TOKEN=your_bot_token
TELEGRAM_SECRET_TOKEN=your_webhook_secret_token
```

> ⚠️ Never commit this file – always use `.gitignore`

---

## 🌐 Webhook Configuration

### Messenger

* Facebook App → Webhooks → `https://<backend-url>/messenger/webhook`
* Verify token must match `VERIFY_TOKEN`
* Page access token must be generated and added to `.env`

### Telegram

* Uses secure webhook via `setWebhook` API
* Your bot must call `TelegramService.setWebhook()` once
* Incoming messages validated via `X-Telegram-Bot-Api-Secret-Token`

---

## 💡 Real-Time Updates with Socket.IO

* `initSocket(httpServer)` initializes bidirectional communication
* Each message update emits a `conversationUpdated` event to connected clients
* Used in frontend to live-refresh conversation UI

---

## 📌 API Overview

### `GET /conversations`

Returns all conversations (sorted by lastUpdated)

### `GET /conversations/:conversationId/messages`

Returns messages for a given conversation ID

### `POST /messenger/send`

Send a message through Messenger

### `POST /telegram/send`

Send a message through Telegram

### `GET /auth/google`

Initiates Google login

### `GET /auth/google/callback`

OAuth2 redirect endpoint

---

## 🛠️ Setup Instructions (Local)

```bash
git clone https://github.com/rolandiartmeladze/social-chat-integration-backend.git
cd social-chat-integration-backend
pnpm install

# Create your .env file
cp .env.example .env

# Start the server
tsc && node dist/index.js
# or for development
tsx src/index.ts
```

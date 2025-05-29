# 📡 Qualification Project - Backend Server

This is the backend part of a full-stack web application built with **Node.js**, **Express.js**, and **TypeScript**. The server is designed to receive and process messages from **Messenger**, **Instagram**, and **Telegram** using **webhooks** and forward them to the frontend.

---

## 🚀 Key Features

- Webhook integration for Messenger, Instagram, and Telegram
- Token-based verification for authorized message handling
- `GET /webhook` endpoint for initial webhook verification
- `POST /webhook` to receive real-time messages from verified platforms
- Support for retrieving conversation data (Messenger and Instagram)
- Telegram bot receives messages and stores them in memory (temporary)
- Echo-response system for testing auto-replies
- Ability to send messages using `POST /send-message` with `conversation_id` and `text`

---

## 📁 Project Structure

backend/
├── src/
│ ├── index.ts # Entry point
│ ├── routes/ # API routes
│ ├── controllers/ # Logic and handlers
│ └── services/ # Platform-specific integrations
├── dist/ # Compiled JS files
├── package.json
└── tsconfig.json

---

## 🛠️ Tech Stack

- Node.js + Express.js
- TypeScript
- CORS
- dotenv
- ts-node + nodemon (for development)

---

## 🧪 Current Status

- The project is in **testing mode**
- **MongoDB** is not yet integrated – messages are temporarily stored in memory
- **Security features** like JWT are planned but not yet implemented
- The server currently handles only **authenticated users’ messages** and conversations

---

## 🔐 Planned Enhancements

- Add JWT-based user authentication
- Integrate MongoDB for message and conversation storage
- Expand webhook support to handle posts, products, and other details
- Advanced auto-reply logic and customizable message templates

---

## ⚙️ Installation & Usage

```bash
# Clone the repository
git clone <repo-url>

# Navigate to backend folder
cd backend

# Install dependencies
npm install

# Run in development mode
npm run dev

# Build the project
npm run build

# Start the server
npm start


```

--- 

## 📄 Environment Variables (.env example)

- PORT=5000
- MESSENGER_VERIFY_TOKEN=your_verification_token
- INSTAGRAM_VERIFY_TOKEN=your_verification_token
- TELEGRAM_VERIFY_TOKEN=your_verification_token
- ACCESS_TOKEN=your_access_token
- INSTAGRAM_PAGE_ID=you_page_id

--- 

## 📌 Notes

- This backend is intended for internal testing and does not yet implement full production-level security.

- Only verified users can send or receive messages through the system.

- Telegram currently supports only message receiving; conversations are not yet supported.


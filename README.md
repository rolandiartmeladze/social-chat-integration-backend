# 📡 Social Chat Integration Backend

This is the **backend server** for a multi-platform social chat integration system. It enables users to connect their **Messenger**, **Telegram**, and **Instagram** accounts, view and manage conversations in real-time, and communicate across all channels from a unified dashboard.

> ✅ Built with **Node.js**, **TypeScript**, **Express**, **MongoDB**, **Socket.IO**, and secured with **Google & Facebook OAuth2**.

---

## 🚀 Features

* 🔐 Google & Facebook OAuth2 authentication
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
├── auth/                  # Google & Facebook OAuth configuration
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

* Uses `passport-google-oauth20` and `passport-facebook` to authenticate users
* Users stored securely in MongoDB with a unique `customId` and `provider`
* Sessions are stored in `express-session` with secure cookies (`SameSite=None`)
* Auth state is shared securely between backend and frontend (HTTPS only)

---

## 🧩 Facebook OAuth Setup (Step-by-Step)

1. **Create App in Facebook Developer Console**

   * Go to [https://developers.facebook.com](https://developers.facebook.com) → Create App (Type: "Consumer")
2. **Enable Facebook Login**

   * Add product "Facebook Login"
   * Go to Settings > Basic → Set:

     * `App Domains`: Must match your frontend/backend domain
     * `Privacy Policy URL`, `Terms of Service`, `App Icon` (required for live mode)
3. **Switch App to Live Mode**

   * Facebook blocks external login unless app is public
4. **Advanced Access for public\_profile**

   * Go to `App Review > Permissions and Features`
   * Switch `public_profile` and `email` to **Advanced Access**
5. **Configure Valid OAuth Redirect URIs**

   * Go to Facebook Login → Settings
   * Add:

     * `https://youdomain.com/auth/facebook/callback`
6. **Use Passport Strategy**

   * Use `passport-facebook` strategy with:

     * `clientID`, `clientSecret`, `callbackURL`
     * `profileFields`: \['id', 'emails', 'name', 'picture.type(large)']
7. **Upsert Logic**

   * Store users in MongoDB using `{ customId, provider }` as unique keys
8. **Session Management**

   * Passport stores `_id` in session and restores it on each request

✅ After setup, your app can authorize any Facebook user — not just the app creator.

---

## ⚙️ Environment Configuration (`.env`)

```dotenv
# General
PORT=8080
BACKEND_URL=https://your-backend-url.com
FRONTEND_URL=https://your-frontend-url.com

# Google OAuth
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret

# Facebook OAuth
FACEBOOK_APP_ID=your_facebook_app_id  # <- generate from developer.facebook.com
FACEBOOK_APP_SECRET=your_facebook_app_secret
FACEBOOK_CALLBACK_URL=https://your-backend-url.com/auth/facebook/callback

# OAuth Session
SESSION_SECRET=your_cookie_session_secret
COOKIE_SECRET=your_cookie_secret

# MongoDB
MONGODB_URI=your_mongodb_uri

# Messenger
FB_API_URL=https://graph.facebook.com/v22.0
FB_PAGE_ACCESS_TOKEN=your_page_access_token
PAGE_ID=your_page_id
VERIFY_TOKEN=your_verify_token

# Telegram
TELEGRAM_BOT_TOKEN=your_telegram_bot_token
TELEGRAM_SECRET_TOKEN=telegram_API
TELEGRAM_WEBHOOK_URL=https://your-backend-url.com/telegram/webhook

# Instagram (Optional / Planned)
INSTAGRAM_APP_ID=your_instagram_app_id
INSTAGRAM_APP_SECRET=your_instagram_app_secret
INSTAGRAM_CLIENT_SECRET=your_instagram_client_secret
INSTAGRAM_PROFILE_TOKEN=your_instagram_token
INSTAGRAM_VERIFY_TOKEN=instagram_API
```

> ⚠️ Never commit `.env` file to GitHub. Always use `.gitignore`

---

## 🌐 Webhook Configuration

### Messenger

* Facebook App → Webhooks → `https://<backend-url>/messenger/webhook`
* Verify token must match `VERIFY_TOKEN`
* Page access token must be added to `.env`

### Telegram

* Bot must call `TelegramService.setWebhook()` on init
* Webhook URL: `https://<backend-url>/telegram/webhook`
* Incoming requests are validated via `X-Telegram-Bot-Api-Secret-Token`

---

## 💡 Real-Time Updates with Socket.IO

* `initSocket(httpServer)` initializes Socket.IO
* Emits `conversationUpdated` to clients when new message arrives
* Used in frontend to auto-refresh chat messages

---

## 📌 API Overview

### `GET /conversations`

Returns all conversations (sorted by `lastUpdated`)

### `GET /conversations/:conversationId/messages`

Returns messages for a given conversation ID

### `POST /messenger/send`

Send a message through Messenger

### `POST /telegram/send`

Send a message through Telegram

### `GET /auth/google`

Initiates Google login

### `GET /auth/facebook`

Initiates Facebook login

### `GET /auth/google/callback`

OAuth2 redirect endpoint for Google

### `GET /auth/facebook/callback`

OAuth2 redirect endpoint for Facebook

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

---

## 🧪 Development Tips

* Use `ts-node` or `tsx` for hot-reloading
* For Webhook testing, use [ngrok](https://ngrok.com/) to expose HTTPS
* Use MongoDB Atlas or local MongoDB server
* Add logging via Winston or custom middleware

---

## 🤖 Powered Platforms

| Platform  | Receive Messages | Send Messages | Webhook Status |
| --------- | ---------------- | ------------- | -------------- |
| Messenger | ✅ Yes            | ✅ Yes         | ✅ Verified     |
| Telegram  | ✅ Yes            | ✅ Yes         | ✅ Verified     |
| Instagram | ⏳ In Progress    | ⏳ Planned     | ⏳ Planned      |

---

## 📄 License

This project is licensed under the [MIT License](LICENSE)

---

## ✨ Acknowledgements

* [Facebook Graph API](https://developers.facebook.com/docs/graph-api/)
* [Telegram Bot API](https://core.telegram.org/bots/api)
* [Passport.js](http://www.passportjs.org/)
* [Socket.IO](https://socket.io/)

---

## 👨‍💻 Maintainer

Built with ❤️ by **Roland Artmeladze**

Feel free to contribute, suggest improvements, or raise issues!

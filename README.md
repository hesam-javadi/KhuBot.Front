# KhuBot

A conversational AI chatbot built for Kharazmi University students and alumni. KhuBot connects to a RAG (Retrieval-Augmented Generation) backend and delivers real-time, context-aware answers through a modern Persian-language web interface.

## ✨ Features

- **RAG Context Selection** — A sidebar lets users switch between multiple knowledge bases (contexts). Each context has its own isolated chat history.
- **Real-time Progress Updates** — While the backend processes a request, live status messages are pushed over a SignalR WebSocket connection and displayed in the chat (e.g. "در حال پیدا کردن موارد مرتبط").
- **Markdown Rendering** — Bot responses are rendered as rich Markdown with syntax-highlighted code blocks via `react-markdown` and `react-syntax-highlighter`.
- **Persian / RTL Support** — The entire UI is right-to-left with the IranSansX font and full Persian error messages.
- **JWT Authentication** — Login issues a JWT stored in a cookie. The token is validated on every request and the user is redirected to `/login` on expiry or 401 responses.
- **Usage Quota Indicator** — A per-user token-usage percentage is fetched from the API and surfaced in the user dropdown.
- **Message Retry** — Failed outgoing messages show an inline retry action.
- **Responsive Design** — Works across desktop and mobile screen sizes.

## 🚀 Tech Stack

### Frontend (`/frontend`)

| Category | Library / Tool |
|---|---|
| Framework | React 19 + TypeScript |
| Build | Vite 6 |
| Routing | React Router 7 |
| Styling | Tailwind CSS 3 |
| Accessible UI | Headless UI 2 |
| Forms | React Hook Form 7 |
| HTTP | Axios |
| Real-time | Microsoft SignalR (`@microsoft/signalr`) |
| Markdown | react-markdown, remark-gfm, rehype-highlight |
| Toast notifications | react-hot-toast |
| i18n | i18next + react-i18next |
| Auth | jwt-decode |

### Root workspace

The root `package.json` holds shared Tailwind / PostCSS tooling and Markdown rendering dependencies used during the build.

## 📦 Project Structure

```
KhuBot/
├── frontend/                   # React application
│   ├── src/
│   │   ├── assets/             # Logo, loading animation, etc.
│   │   ├── components/
│   │   │   └── chat/
│   │   │       ├── ChatList.tsx        # Message list container
│   │   │       ├── ChatMessage.tsx     # Single message bubble (with retry)
│   │   │       ├── ContextSidebar.tsx  # RAG context picker sidebar
│   │   │       ├── MessageInput.tsx    # Compose & send bar
│   │   │       └── UserDropdown.tsx    # User info + logout dropdown
│   │   ├── context/
│   │   │   └── AuthContext.tsx         # Auth state & helpers
│   │   ├── pages/
│   │   │   ├── Chat.tsx                # Main chat page (/:contextId)
│   │   │   └── Login.tsx               # Login page
│   │   ├── services/
│   │   │   └── api.ts                  # Axios client, authService, chatService
│   │   ├── types/
│   │   │   └── index.ts                # Shared TypeScript types & enums
│   │   ├── App.tsx                     # Router & global layout
│   │   ├── index.css                   # Global styles + IranSansX font
│   │   └── markdown.css                # Markdown prose styles
│   └── ...                             # Config files (Vite, TS, ESLint, Tailwind)
└── FRONTEND_GUIDE.md           # Backend API contract reference
```

## 🛠️ Getting Started

### Prerequisites

- Node.js v18 or later
- npm

### Installation

```bash
# 1. Clone the repository
git clone https://github.com/yourusername/KhuBot.git
cd KhuBot

# 2. Install root-level dependencies
npm install

# 3. Install frontend dependencies
cd frontend
npm install
```

### Running in development

```bash
# From the frontend/ directory
npm run dev
```

The dev server starts at `http://localhost:5173`. The app expects the backend API at `https://localhost:7193` (configured in `frontend/src/services/api.ts`).

### Building for production

```bash
# From the frontend/ directory
npm run build
```

Output is written to `frontend/dist/`.

## 🔌 API Overview

The frontend communicates with a REST + SignalR backend. Key endpoints:

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/Auth/Login` | Authenticate and receive a JWT |
| `GET` | `/api/Chat/GetContexts` | List available RAG contexts |
| `GET` | `/api/Chat/GetChatList?contextId=` | Fetch chat history for a context |
| `POST` | `/api/Chat/SendMessage` | Send a message (requires `requestId` + `contextId`) |
| WS | `/hub/chat-state?requestId=` | SignalR hub for real-time processing state |

See [`FRONTEND_GUIDE.md`](./FRONTEND_GUIDE.md) for the full API contract, request/response shapes, and the SignalR notification lifecycle.

## 📄 Routes

| Path | Component | Description |
|---|---|---|
| `/login` | `Login` | Authentication page |
| `/:contextId` | `Chat` | Chat page for the selected RAG context |
| `/` | Redirect | Redirects to `/1` (default context) |

## 🤝 Contributing

Contributions are welcome. Please open an issue or pull request and follow the existing code style.

## 📜 License

This project is available for Kharazmi University students and alumni to learn from and contribute to.

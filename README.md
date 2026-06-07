# Spur Chat — AI Customer Support Agent

AI live chat for **Spur Shop** (fictional e-commerce). Users ask support questions in a web UI; the backend stores conversations, calls OpenAI (`gpt-4o-mini`), and replies using store policies.

Take-home assignment for the Spur Founding Full-Stack Engineer role.

## Live Demo

| App | URL |
|---|---|
| Frontend | https://spur-chat-pi.vercel.app |
| Backend API | https://spur-chat-0trj.onrender.com/api/v1 |

## Tech Stack

Vue 3 · Vite · Tailwind · Pinia · AdonisJS 6 · PostgreSQL · Redis · OpenAI

```
spur-chat/
├── spur-backend/    API, LLM, persistence
└── spur-frontend/   Chat UI
```

## Local Setup

**Prerequisites:** Node 20+, PostgreSQL, Redis, OpenAI API key

```bash
git clone https://github.com/rajveersingh08/spur-chat.git
cd spur-chat

# Backend
cd spur-backend
cp .env.example .env   # set APP_KEY, DB_*, REDIS_*, OPENAI_API_KEY
npm install
npm run migration:run
npm run dev            # http://localhost:3333

# Frontend (new terminal)
cd spur-frontend
npm install
npm run dev            # http://localhost:5173
```

Create a Postgres database named `spur_chat`. Start Redis (`redis-server`). The Vite dev server proxies `/api` to the backend — no frontend env var needed locally.

See `spur-backend/.env.example` for all environment variables.

## API

| Method | Path | Description |
|---|---|---|
| `POST` | `/api/v1/chat/message` | Send message, get AI reply |
| `GET` | `/api/v1/chat/history/:sessionId` | Load conversation history |

```json
POST /api/v1/chat/message
{ "message": "What is your return policy?", "sessionId": "optional-uuid" }
```

## Architecture

```
ChatsController → ChatService → LlmService → OpenAI
                      ↓
              PostgreSQL + Redis (cache, DB fallback)
```

- **ChatService** — creates conversations, saves messages, loads context (Redis → DB fallback), calls LLM
- **LlmService** — system prompt, store knowledge, input validation, error handling
- **Frontend** — Pinia store + Axios; session ID in `localStorage` for reload persistence

Redis is optional — if it fails, the app continues using PostgreSQL only.

## Deployment

| Component | Platform |
|---|---|
| Frontend | Vercel (`spur-frontend/`) |
| Backend | Render (`spur-backend/`) |
| PostgreSQL | Cloud Postgres (`DB_*` on Render) |
| Redis | Upstash (`REDIS_*` on Render, TLS auto-enabled) |

**Render** — Root: `spur-backend` · Build: `npm install && node ace build` · Start: `node build/bin/server.js`

Set `APP_KEY`, `DB_*`, `REDIS_*`, `OPENAI_API_KEY`, and related vars on Render. Run `node ace migration:run` once against production DB.

**Vercel** — Root: `spur-frontend` · Env: `VITE_API_BASE_URL=https://spur-chat-0trj.onrender.com/api/v1` · Redeploy after changing env vars.

CORS is enabled on the backend for cross-origin requests from Vercel.

## Not Implemented

Auth, real Shopify/WhatsApp integrations, streaming responses, automated tests, CMS-driven knowledge.

## License

Private — submitted as a take-home assignment for Spur.

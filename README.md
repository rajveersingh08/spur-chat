# Spur Chat — AI Customer Support Agent

A mini AI live chat agent for **Spur Shop**, a fictional e-commerce store. Users send support questions through a web chat UI; the backend persists the conversation, calls OpenAI, and returns contextual replies grounded in store policies.

Built as a take-home assignment for the Spur Founding Full-Stack Engineer role.

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | Vue 3, TypeScript, Vite, Tailwind CSS, Pinia |
| Backend | AdonisJS 6, TypeScript |
| Database | PostgreSQL |
| Cache | Redis |
| LLM | OpenAI (`gpt-4o-mini`) |

## Project Structure

```
spur-chat/
├── spur-backend/     AdonisJS API, LLM integration, persistence
└── spur-frontend/    Vue 3 chat UI
```

## Prerequisites

Install the following before running locally:

- **Node.js** 20 or later
- **npm**
- **PostgreSQL** 14 or later
- **Redis** 6 or later
- **OpenAI API key** with billing enabled

## Local Setup

### 1. Clone the repository

```bash
git clone https://github.com/rajveersingh08/spur-chat.git
cd spur-chat
```

### 2. Create the PostgreSQL database

Create an empty database named `spur_chat` using your preferred tool (psql, DBeaver, pgAdmin, etc.).

Example using psql:

```bash
psql -U postgres -c "CREATE DATABASE spur_chat;"
```

### 3. Start Redis

```bash
redis-server
```

Verify Redis is running:

```bash
redis-cli ping
```

Expected output: `PONG`

### 4. Configure backend environment variables

```bash
cd spur-backend
cp .env.example .env
```

Edit `.env` and set at minimum:

| Variable | Description |
|---|---|
| `APP_KEY` | Generate with `node ace generate:key` |
| `DB_HOST` | PostgreSQL host (default `127.0.0.1`) |
| `DB_PORT` | PostgreSQL port (default `5432`) |
| `DB_USER` | PostgreSQL username |
| `DB_PASSWORD` | PostgreSQL password |
| `DB_DATABASE` | Database name (`spur_chat`) |
| `REDIS_HOST` | Redis host (default `127.0.0.1`) |
| `REDIS_PORT` | Redis port (default `6379`) |
| `OPENAI_API_KEY` | Your OpenAI API key |

Do not commit `.env` to Git.

### 5. Install backend dependencies and run migrations

```bash
cd spur-backend
npm install
npm run migration:run
```

Optional — seed sample FAQ conversations into the database:

```bash
npm run db:seed
```

### 6. Start the backend

```bash
npm run dev
```

Backend runs at **http://localhost:3333**

### 7. Install and start the frontend

Open a new terminal:

```bash
cd spur-frontend
npm install
npm run dev
```

Frontend runs at **http://localhost:5173**

The Vite dev server proxies `/api` requests to the backend on port 3333.

### 8. Open the app

Visit **http://localhost:5173**, click **Start Chatting**, and send a message.

## Environment Variables

### Backend (`spur-backend/.env`)

| Variable | Required | Default | Description |
|---|---|---|---|
| `NODE_ENV` | Yes | `development` | Application environment |
| `PORT` | Yes | `3333` | HTTP port |
| `HOST` | Yes | `0.0.0.0` | Bind address |
| `APP_KEY` | Yes | — | AdonisJS encryption key |
| `LOG_LEVEL` | Yes | `info` | Log verbosity |
| `DB_HOST` | Yes | — | PostgreSQL host |
| `DB_PORT` | Yes | — | PostgreSQL port |
| `DB_USER` | Yes | — | PostgreSQL user |
| `DB_PASSWORD` | No | — | PostgreSQL password |
| `DB_DATABASE` | Yes | — | Database name |
| `REDIS_HOST` | Yes | — | Redis host |
| `REDIS_PORT` | Yes | — | Redis port |
| `REDIS_PASSWORD` | No | — | Redis password |
| `REDIS_CACHE_TTL_SECONDS` | Yes | `3600` | Conversation cache TTL |
| `OPENAI_API_KEY` | Yes | — | OpenAI API key |
| `CONVERSATION_HISTORY_WINDOW` | Yes | `20` | Max messages sent to the LLM per request |

## API Endpoints

### POST `/api/v1/chat/message`

Send a user message and receive an AI reply.

**Request body:**

```json
{
  "message": "What is your return policy?",
  "sessionId": "optional-uuid-for-existing-conversation"
}
```

**Response:**

```json
{
  "sessionId": "uuid",
  "userMessage": {
    "id": "uuid",
    "sender": "user",
    "text": "What is your return policy?",
    "createdAt": "2026-06-06T12:00:00.000Z"
  },
  "aiMessage": {
    "id": "uuid",
    "sender": "ai",
    "text": "...",
    "createdAt": "2026-06-06T12:00:01.000Z"
  }
}
```

### GET `/api/v1/chat/history/:sessionId`

Fetch the full message history for a conversation. Used by the frontend on page reload.

**Response:**

```json
{
  "sessionId": "uuid",
  "messages": [
    {
      "id": "uuid",
      "sender": "user",
      "text": "...",
      "createdAt": "..."
    }
  ]
}
```

## Architecture Overview

### Backend layers

```
HTTP Request
    ↓
ChatsController        Validates input (VineJS), shapes HTTP responses
    ↓
ChatService            Orchestrates conversation lifecycle
    ↓
LlmService             OpenAI integration, prompt, error handling
    ↓
PostgreSQL + Redis     Persistent storage + context cache
```

**ChatsController** is a thin traffic cop. It validates requests and delegates to services. No business logic or database queries live here.

**ChatService** owns the full message lifecycle:

1. Resolve or create a conversation
2. Persist the user message to PostgreSQL
3. Load conversation context from Redis (fallback to PostgreSQL on cache miss)
4. Call `LlmService` for the AI reply
5. Persist the AI message
6. Update the Redis cache

**LlmService** is the single integration point for OpenAI. It owns the system prompt, store knowledge, input validation, error classification, and graceful fallbacks. Callers never handle LLM-specific exceptions.

**Query filters** (`ConversationFilter`, `MessageFilter`) encapsulate Lucid query composition and keep services readable.

### Frontend layers

```
App.vue                Full-page chat UI, welcome screen, animations
    ↓
stores/chat.ts         Pinia store — session, messages, submit flow
    ↓
services/api.ts        Axios HTTP client
    ↓
Backend API
```

The session ID is stored in `localStorage` so conversation history survives page reloads.

### Redis strategy

Redis caches the last N messages per conversation as a JSON array. On a cache hit, the backend skips a PostgreSQL read before calling OpenAI. On a cache miss, history is rebuilt from the database and the cache is warmed.

Redis is a performance layer only. If Redis is unavailable, the app falls back to PostgreSQL and continues working.

### Data model

**conversations**

| Column | Type | Description |
|---|---|---|
| `id` | UUID | Primary key, used as `sessionId` |
| `metadata` | JSON | Optional metadata (e.g. channel) |
| `created_at` | timestamp | Creation time |
| `updated_at` | timestamp | Last activity |

**messages**

| Column | Type | Description |
|---|---|---|
| `id` | UUID | Primary key |
| `conversation_id` | UUID | Foreign key to conversations |
| `sender` | enum | `user` or `ai` |
| `text` | text | Message content |
| `created_at` | timestamp | Creation time |

## LLM Integration

### Provider

**OpenAI** — model: `gpt-4o-mini`

Chosen for low latency, low cost, and strong instruction-following for structured customer support prompts.

### Prompt design

The system prompt is structured into labelled sections:

- **ROLE** — Aria, Spur Shop support agent
- **OBJECTIVE** — Answer using store knowledge only
- **STORE KNOWLEDGE** — Shipping, returns, payments, promotions, support hours
- **SECURITY RULES** — Prompt injection and role-switching protection
- **KNOWLEDGE BOUNDARY** — No hallucinated policies or order data
- **ORDER HANDLING RULES** — No fabricated tracking or order status
- **ESCALATION RULES** — When to direct to human support
- **RESPONSE STYLE** — Concise, empathetic, under 120 words
- **RESPONSE REQUIREMENTS** — Grounded answers only

Store knowledge is separated from behavioural instructions in code (`STORE_KNOWLEDGE` constant injected into `SYSTEM_PROMPT`) so it can later be swapped for CMS or database-driven content without touching prompt logic.

### Model parameters

| Parameter | Value | Reason |
|---|---|---|
| `temperature` | `0.3` | Consistent, policy-accurate replies over creative variation |
| `top_p` | `1.0` | Avoid tuning both temperature and top_p simultaneously |
| `max_tokens` | `350` | Enforces concise support answers and controls cost |

### Conversation history

The last 20 messages (`CONVERSATION_HISTORY_WINDOW`) are sent to OpenAI as context. History is capped again inside `LlmService` as a defence-in-depth guard.

### Error handling

All OpenAI failures are caught inside `LlmService` and converted to user-friendly messages:

| Failure | User-facing message |
|---|---|
| Rate limit (429) | High traffic — try again shortly |
| Invalid API key (401/403) | Assistant temporarily unavailable |
| Timeout / network error | Request timed out — try again |
| Empty response | No response returned — try again |

Detailed errors are logged server-side only. Nothing internal is exposed to the client.

## Design Decisions

**AdonisJS over Express** — Built-in validation, ORM, migrations, and Redis integration reduce boilerplate and keep the codebase structured for a take-home with real persistence requirements.

**Redis as optional cache** — The app works without Redis (PostgreSQL fallback). This avoids making Redis a hard dependency while still demonstrating cache-aware architecture.

**Structured system prompt** — Section headings improve instruction-following and make the prompt auditable. Security rules explicitly block prompt injection and role-switching attempts.

**Optimistic UI updates** — The frontend shows the user message immediately before the API responds, then replaces it with the server-confirmed message on success.

**Session in localStorage** — No auth required per the brief. The session ID lets history reload on refresh without login.

## Trade-offs and If I Had More Time

**Not implemented (by design or timebox):**

- Authentication and user accounts
- Real Shopify / WhatsApp / Instagram integrations
- Streaming LLM responses (SSE)
- Automated test suite
- Production CORS configuration for cross-origin deployment
- CMS-driven store knowledge or RAG retrieval
- Backend conversation deletion API wired to the frontend

**If I had more time, I would:**

1. Add integration tests for `ChatService` and `LlmService` with mocked OpenAI responses
2. Enable CORS and deploy backend to Railway/Render with frontend on Vercel
3. Stream AI responses token-by-token for better perceived latency
4. Move store knowledge to a database table editable by non-engineers
5. Add rate limiting per session to prevent API abuse
6. Implement a shared Lottie component to reduce duplicate animation fetches
7. Add observability (structured request IDs, LLM latency metrics)

## Deployment

| Component | Recommended platform |
|---|---|
| Frontend | Vercel or Netlify |
| Backend | Railway or Render |
| PostgreSQL | Neon, Supabase, or Railway |
| Redis | Upstash |

The backend requires a persistent Node.js process and is not suitable for Vercel serverless. Deploy the frontend and backend separately and set `VITE_API_BASE_URL` on the frontend to point to the production backend URL.

## License

Private — submitted as a take-home assignment for Spur.

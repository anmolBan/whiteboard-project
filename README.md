# SketchSync

SketchSync is a real-time collaborative whiteboard built as a Turborepo monorepo. It combines a polished Next.js frontend, JWT-based authentication, an Express API, a WebSocket collaboration server, PostgreSQL persistence through Prisma, and Redis-backed background jobs for saving chats and canvas state.

The main product experience lives in `apps/white-board`, where users can sign up, create or join rooms, draw together on an Excalidraw-powered canvas, and chat live inside the same workspace.

## What This Project Does

- Real-time collaborative drawing with Excalidraw
- Private room creation and room joining
- Credentials-based login with NextAuth
- Google sign-in support
- Live room chat over WebSockets
- Persistent room chat history in PostgreSQL
- Persistent canvas snapshots saved asynchronously through Redis/BullMQ
- Shared TypeScript packages for DB access, environment config, and validation

## Monorepo Architecture

### Applications

- `apps/white-board`  
  Main frontend application. A Next.js 16 app running on port `3001`. Handles UI, authentication, room management screens, server-side data fetching, and the collaborative canvas page.

- `apps/http-backend`  
  Express API running on port `3002`. Responsible for protected room creation, room lookup, chat history retrieval, and fetching saved canvas data.

- `apps/ws-backend`  
  WebSocket server running on port `8080`. Handles real-time collaboration events such as room joins, live chat messages, and canvas updates. It also starts the BullMQ worker used to persist chat and canvas updates.

- `apps/web`  
  A secondary/older Next.js frontend that still exists in the repo. The primary product UI is `apps/white-board`, and `vercel.json` is configured to build that app.

### Shared Packages

- `packages/db`  
  Prisma schema, generated Prisma client, and shared database access.

- `packages/types`  
  Shared Zod schemas and TypeScript types for auth and room inputs.

- `packages/backend-common`  
  Centralized environment-variable loading and shared runtime constants such as ports, URLs, JWT secret, and Redis config.

- `packages/ui`  
  Reusable UI components for the workspace.

- `packages/eslint-config` and `packages/typescript-config`  
  Shared tooling configuration for the monorepo.

## How The System Works

### Authentication Flow

- The frontend uses `next-auth`.
- Users can sign in with email/password or Google.
- On successful authentication, the app creates a custom JWT access token and stores it in the NextAuth session as `session.user.accessToken`.
- That access token is then used to authenticate:
  - requests to the Express API
  - WebSocket connections to the collaboration server

### Collaboration Flow

1. A signed-in user creates or joins a room from the frontend.
2. The frontend resolves the room slug through the HTTP API.
3. The canvas page opens and connects to the WebSocket server with the JWT token.
4. The client sends a `join` event for the room.
5. Canvas updates are broadcast live to other users in the room.
6. Chat messages are broadcast instantly and also queued for persistence.
7. Canvas snapshots are debounced, compressed, queued in Redis, and then saved to PostgreSQL by the worker.

### Persistence Strategy

- Chat messages are stored in the `Chat` table.
- Room metadata is stored in the `Room` table.
- The latest saved canvas state is stored as JSON in `Room.canvasData`.
- Canvas updates are:
  - stripped down to essential app state fields
  - gzip-compressed and base64-encoded
  - queued with BullMQ
  - decompressed and written to PostgreSQL by the worker

This design keeps real-time collaboration responsive while moving heavier persistence work off the WebSocket hot path.

## Tech Stack

- `Next.js 16`
- `React 19`
- `TypeScript`
- `NextAuth`
- `Excalidraw`
- `Express`
- `ws`
- `BullMQ`
- `Redis / Upstash Redis`
- `Prisma 7`
- `PostgreSQL`
- `Turborepo`
- `Tailwind CSS 4`

## Project Structure

```text
whiteboard-project/
+- apps/
|  +- white-board/      # Main Next.js frontend
|  +- http-backend/     # Express API
|  +- ws-backend/       # WebSocket server + BullMQ worker
|  +- web/              # Secondary/older frontend
+- packages/
|  +- backend-common/   # Shared env and runtime constants
|  +- db/               # Prisma schema/client
|  +- types/            # Shared Zod schemas/types
|  +- ui/               # Shared UI package
|  +- eslint-config/
|  +- typescript-config/
+- docker-compose.yml
+- turbo.json
+- vercel.json
```

## Database Models

The Prisma schema currently defines three core models:

- `User`
  - name, email, password, optional photo
- `Room`
  - unique slug, admin relationship, created date, saved `canvasData`
- `Chat`
  - room relation, user relation, message, timestamp

This gives the project a clean ownership model where each room belongs to a user and stores both discussion history and the latest persisted board state.

## Environment Variables

Create a root-level `.env` file. The shared backend package resolves environment variables from the monorepo root, so keeping them there is important.

Example:

```env
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/whiteboard"

JWT_SECRET="replace-this-with-a-strong-secret"
NEXTAUTH_SECRET="replace-this-with-a-strong-secret"

WHITEBOARD_PORT=3001
HTTP_PORT=3002
WS_PORT=8080

NEXTAUTH_URL="http://localhost:3001"
BACKEND_URL="http://localhost:3002"
WS_URL="ws://localhost:8080"

NEXT_PUBLIC_BACKEND_URL="http://localhost:3002"
NEXT_PUBLIC_WS_URL="ws://localhost:8080"

GOOGLE_CLIENT_ID=""
GOOGLE_CLIENT_SECRET=""

REDIS_HOST="localhost"
REDIS_PORT=6379
REDIS_PASSWORD=""
REDIS_TLS=false
```

### Variable Reference

| Variable | Used by | Purpose |
| --- | --- | --- |
| `DATABASE_URL` | Prisma, Next.js auth, worker | PostgreSQL connection string |
| `JWT_SECRET` | NextAuth, HTTP backend, WS backend | Signs and verifies access tokens |
| `NEXTAUTH_SECRET` | NextAuth | Secret used by NextAuth session/token encryption |
| `WHITEBOARD_PORT` | Next.js frontend | Port used by the `white-board` app in Docker |
| `HTTP_PORT` | HTTP backend | Express API port |
| `WS_PORT` | WS backend | WebSocket server port |
| `NEXTAUTH_URL` | NextAuth | Public base URL of the frontend app |
| `BACKEND_URL` | Next.js server-side code | Internal server-side requests to the Express API |
| `WS_URL` | Shared backend config | Base WebSocket URL for backend/runtime defaults |
| `NEXT_PUBLIC_BACKEND_URL` | Browser frontend | Public HTTP API base URL |
| `NEXT_PUBLIC_WS_URL` | Browser frontend | Public WebSocket URL |
| `GOOGLE_CLIENT_ID` | NextAuth | Google OAuth client ID |
| `GOOGLE_CLIENT_SECRET` | NextAuth | Google OAuth client secret |
| `REDIS_HOST` | BullMQ queue/worker | Redis host |
| `REDIS_PORT` | BullMQ queue/worker | Redis port |
| `REDIS_PASSWORD` | BullMQ queue/worker | Redis password |
| `REDIS_TLS` | BullMQ queue/worker | Enable TLS for hosted Redis providers like Upstash |

## Getting Started

### Prerequisites

- Node.js `18+` is declared in the repo
- Node.js `20` is the safest choice for local development because the Dockerfiles also target Node 20
- npm
- PostgreSQL
- Redis or Upstash Redis

### Option A: Run With Docker Compose

`docker-compose.yml` starts the three application services:

- `whiteboard` on port `3001`
- `http-backend` on port `3002`
- `ws-backend` on port `8080`

It does not provision PostgreSQL or Redis. Point `DATABASE_URL` and Redis settings at an existing database and Redis instance before starting the stack.

If PostgreSQL or Redis are running on your host machine instead of in containers, do not leave them as `localhost` in `.env`. From inside Docker containers, use `host.docker.internal` instead.

Example Docker-oriented values:

```env
DATABASE_URL="postgresql://postgres:postgres@host.docker.internal:5432/whiteboard"
REDIS_HOST="host.docker.internal"
NEXTAUTH_URL="http://localhost:3001"
NEXT_PUBLIC_BACKEND_URL="http://localhost:3002"
NEXT_PUBLIC_WS_URL="ws://localhost:8080"
```

Start the stack:

```bash
docker compose up --build
```

Run it in the background instead:

```bash
docker compose up -d --build
```

Stop it later with:

```bash
docker compose down
```

Default URLs with Docker Compose:

- Frontend: `http://localhost:3001`
- HTTP API: `http://localhost:3002`
- WebSocket server: `ws://localhost:8080`

### Option B: Run Locally Without Docker

#### 1. Install Dependencies

```bash
npm install
```

#### 2. Generate Prisma Client

```bash
npm run generate --workspace=@repo/db
```

#### 3. Apply Database Migrations

With Prisma 7 in this repo, migrations can be applied using the package config:

```bash
npx prisma migrate deploy --config packages/db/prisma.config.ts
```

For local development, if you prefer creating/applying dev migrations instead:

```bash
npx prisma migrate dev --config packages/db/prisma.config.ts
```

#### 4. Start The Services

You can run the core services in separate terminals:

```bash
npm run dev --workspace=white-board
```

```bash
npm run dev --workspace=http-backend
```

```bash
npm run dev --workspace=ws-backend
```

Default local URLs:

- Frontend: `http://localhost:3001`
- HTTP API: `http://localhost:3002`
- WebSocket server: `ws://localhost:8080`

You can also run the monorepo dev task:

```bash
npm run dev
```

That will ask Turborepo to run every workspace `dev` script, including the extra `apps/web` frontend if you keep it in active use.

## Available Scripts

From the repository root:

```bash
npm run dev
npm run build
npm run lint
npm run check-types
npm run format
```

Useful workspace-specific commands:

```bash
npm run dev --workspace=white-board
npm run dev --workspace=http-backend
npm run dev --workspace=ws-backend
npm run build --workspace=@repo/db
npm run generate --workspace=@repo/db
```

## HTTP API Overview

The Express backend mounts all routes under `/api`.

### Room and Data Endpoints

- `POST /api/users/create-room`
  - Protected
  - Creates a new room using the authenticated user as admin

- `GET /api/users/room/:slug`
  - Protected
  - Resolves a room slug to its room ID

- `GET /api/users/chats/:roomId`
  - Protected
  - Returns up to 50 chat messages in ascending timestamp order

- `GET /api/users/canvasData/:roomId`
  - Protected
  - Returns the latest persisted canvas snapshot for the room

### Authentication Notes

- Protected API routes expect `Authorization: Bearer <token>`.
- The token is the JWT stored in the NextAuth session.
- Email/password signup and sign-in logic now primarily live in the Next.js app and shared DB layer rather than the Express backend.

## WebSocket Event Contract

### Client -> Server

- `join`
  - payload: `{ action: "join", roomId }`

- `message`
  - payload: `{ action: "message", roomId, content }`

- `canvas-update`
  - payload: `{ action: "canvas-update", roomId, content }`

### Server -> Client

- `user-joined`
- `user-left`
- `message`
- `canvas-update`

The WebSocket server authenticates the connection through the `token` query parameter and uses that token to identify the user before allowing room participation.

## Docker And Deployment Notes

- `vercel.json` is configured to build the `white-board` app specifically.
- `docker-compose.yml` defines three services: `whiteboard`, `http-backend`, and `ws-backend`.
- The compose stack uses the Dockerfiles in:
  - `apps/white-board`
  - `apps/http-backend`
  - `apps/ws-backend`
- The compose stack does not currently include PostgreSQL or Redis containers.
- Browser-facing URLs in Docker should stay on `localhost`, while container-to-host dependencies such as a host PostgreSQL or Redis instance should use `host.docker.internal`.
- The `whiteboard` image bakes `NEXT_PUBLIC_BACKEND_URL` and `NEXT_PUBLIC_WS_URL` at build time, so rebuild the image if those public endpoints change.

If you deploy the system fully, you will typically host:

- the Next.js frontend
- the Express API
- the WebSocket server
- PostgreSQL
- Redis

## CI/CD Pipelines

Automated deployment is handled by two GitHub Actions workflows in `.github/workflows/`.

### Pipelines

| Workflow | File | Deploys |
| --- | --- | --- |
| Deploy HTTP Backend | `cd-http-backend.yml` | `apps/http-backend` |
| Deploy WS Backend | `cd-ws-backend.yml` | `apps/ws-backend` |

Both pipelines trigger on pushes to `main` and follow the same steps:

1. Build a Docker image from the relevant `Dockerfile` using the full monorepo as build context.
2. Push the image to Docker Hub tagged with the commit SHA.
3. Install `cloudflared` to tunnel SSH through Cloudflare Access.
4. SSH into the deployment server and run the new container, replacing the previous one.

### Required GitHub Secrets

Configure these in **Settings → Secrets and variables → Actions** of the repository:

| Secret | Used by | Description |
| --- | --- | --- |
| `DOCKERHUB_USERNAME` | Both | Docker Hub account username |
| `DOCKERHUB_TOKEN` | Both | Docker Hub access token |
| `SSH_PRIVATE_KEY` | Both | Private SSH key for the deployment server |
| `SSH_USERNAME` | Both | SSH login username on the server |
| `SSH_HOST` | Both | Cloudflare Access hostname for the server |
| `DATABASE_URL` | Both | PostgreSQL connection string |
| `JWT_SECRET` | Both | JWT signing secret |
| `HTTP_BACKEND_PORT` | HTTP backend | Port the Express API listens on |
| `WS_PORT` | WS backend | Port the WebSocket server listens on |
| `REDIS_HOST` | WS backend | Redis host |
| `REDIS_PORT` | WS backend | Redis port |
| `REDIS_PASSWORD` | WS backend | Redis password |
| `REDIS_TLS` | WS backend | `true` or `false` for Redis TLS |

### Notes

- The WS backend container runs with `--network host` so it can reach a Redis instance on the host without extra networking configuration.
- `DATABASE_URL` and `REDIS_PASSWORD` are quoted inside the remote `docker run` command to prevent shell interpretation of special characters such as `&` and `?`.
- The frontend (`apps/white-board`) is deployed separately via Vercel. See `vercel.json` at the repo root.

## Current Status / Notes

- The main frontend is `apps/white-board`.
- The repository still contains `apps/web`, which looks like an alternate or earlier frontend kept alongside the main product.
- There are currently no meaningful automated tests wired up; several workspace `test` scripts are still placeholders.
- Canvas persistence is intentionally asynchronous for better real-time responsiveness.

## Why This Project Is Interesting

This project is a strong full-stack collaboration app because it combines:

- server-rendered and client-rendered Next.js patterns
- JWT-secured API and socket communication
- live collaboration with WebSockets
- queued background persistence with BullMQ
- Prisma-based relational data modeling
- a clean monorepo structure with shared packages

It is a solid foundation for features like presence, invite links, board history, access roles, exports, and richer multiplayer collaboration.

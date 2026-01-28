# Pastebin-Lite

A simple, robust pastebin application built with Next.js and Vercel KV (Redis).

## Features
- Create text pastes with optional **Time-to-Live (TTL)**.
- Create text pastes with optional **Max View Limits**.
- Shareable links.
- **Deterministic Testing**: Supports `TEST_MODE` via `x-test-now-ms` header.

## Persistence
This application uses **Redis** (provisioned via Vercel KV) for persistence.
- **Client**: Standard `redis` npm package (TCP connection).
- **Reason**: Chosen for low-latency, serverless compatibility, and standard protocol checking.
- **Schema**: Data is stored as Redis Hashes (`paste:<id>`) containing content, view counts, and expiry timestamps.
- **Atomic Operations**: View limits are enforced using `HINCRBY` to prevent race conditions under load.

## How to Run Locally

### Prerequisites
- Node.js (v18+)
- A Vercel accounts (for Vercel KV) OR a local Redis instance.

### Setup

1. Clone the repository.
2. Install dependencies:
   ```bash
   npm install
   ```
3. Set up Environment Variables:
   Create a `.env.development.local` file with your Redis connection string:
   ```env
   REDIS_URL="redis://..."
   ```
   *Note: On Vercel, this variable is automatically provided if you use Vercel KV.*

4. Run the development server:
   ```bash
   npm run dev
   ```

5. Open [http://localhost:3000](http://localhost:3000) to create a paste.

## API Endpoints

- **POST /api/pastes**: Create a paste.
- **GET /api/pastes/:id**: Fetch a paste (JSON).
- **GET /p/:id**: View a paste (HTML).
- **GET /api/healthz**: Health check.

## Design Decisions
- **Next.js App Router**: Used for modern, server-side rendering and API route handling.
- **Availability Logic**: Logic is shared between API and HTML views. Pastes are checked for expiry (time) and view limits *before* serving.
- **Concurrency**: `HINCRBY` is used to atomically increment view counts. An additional check prevents serving if the increment pushed the count over the limit (handling race conditions).

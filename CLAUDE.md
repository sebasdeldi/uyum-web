# Uyum frontend (uyum-web)

React app for Uyum. Uyum lets someone pay with a debit/credit card and receive the equivalent value as tokens in a crypto wallet: submit card + amount + wallet address, the backend charges the card and mints tokens once the charge clears. This app is the UI for that — account creation/login, submitting a request, and checking status/history.

## The backend: uyum-core

Path: `/Users/sebasdeldi/Development/SD/uyum-core`

This is a **separate repo**, not a workspace/monorepo package — read its source directly, don't assume it's importable.

**Before implementing anything that calls the API, verify the current contract by reading the actual source in that repo — not just this file.** This file's summary below can drift out of date as the backend evolves; the source is the only thing that's authoritative. At minimum, check:

- `uyum-core/README.md` — plain-language + technical overview of every flow, kept up to date by convention in that repo
- `uyum-core/src/auth/auth.controller.ts` + `uyum-core/src/auth/dto/*.dto.ts` — register/login request/response shapes
- `uyum-core/src/users/users.controller.ts` — `/users/me`
- `uyum-core/src/mint_operations/mint_operations.controller.ts` + `uyum-core/src/mint_operations/dto/initiate-mint.dto.ts` — the core mint-request endpoint, request/response shape
- `uyum-core/src/payment_transactions/dto/payment-transaction-response.dto.ts` — the nested `paymentTransaction` shape returned inside a mint operation
- `uyum-core/src/common/dto/pagination-query.dto.ts` — shared pagination query shape (`page`/`limit`)

If a field, endpoint, or status value mentioned below doesn't match what's actually in those files, trust the source and flag the mismatch — don't silently code against this doc.

### How the backend works (snapshot — verify against source per above)

**Auth** — email/password, bcrypt-hashed. Login returns a JWT (1h expiry) sent as `Authorization: Bearer <token>` on every protected request. No refresh tokens — when it expires, the user logs in again.

| Endpoint              | Notes                                                            |
| --------------------- | ---------------------------------------------------------------- |
| `POST /auth/register` | `{ email, password }`. 409 if email taken.                       |
| `POST /auth/login`    | `{ email, password }` → `{ authToken }`. 401 on bad credentials. |
| `GET /users/me`       | Requires JWT.                                                    |

**Mint operations** — the core flow, and the one thing in this app that needs async/polling UX, not a simple request/response:

1. `POST /mint-operations` (card details + `amountInCents` + `address`) creates a `MintOperation` and returns it **immediately** in `PENDING` status — the charge and the mint both happen in the background afterward.
2. There is **no websocket/push** — the frontend has to poll `GET /mint-operations/:id` until `status` leaves `PENDING`.
3. Final states: `COMPLETED` (tokens sent) or `FAILED` (card declined, or something timed out). Treat `FAILED` as a normal, expected outcome to show the user, not an error state.
4. `GET /mint-operations` lists the signed-in user's history, paginated (`?page=&limit=`, defaults `page=1&limit=20`).
5. Every mint operation response can include a nested `paymentTransaction` — the raw processor payload is stripped server-side, only the summarized fields come through.

This maps well onto TanStack Query's `refetchInterval` for the detail view (poll while `status === 'PENDING'`, stop once resolved).

### Local dev wiring

- Backend listens on `http://localhost:3000` by default (`PORT` env var to change it).
- Backend CORS is allowlist-based (`CORS_ORIGINS` env var in `uyum-core`) — the Vite dev server's origin (`http://localhost:5173` by default) needs to be in that list on the backend side, or requests will be blocked by the browser. If login/API calls fail with a CORS error, that's the first thing to check — it's a backend `.env` change, not a frontend bug.
- `uyum-core` needs Postgres + Redis running (`docker compose up` from that repo, or see its README) before its API will actually work end to end.

## Frontend stack

Vite + React + TypeScript, TanStack Router, TanStack Query (server state), Zustand (client state), TanStack Form + Zod (forms/validation), antd (component kit), axios (HTTP client — decided 2026-08-09).

## Working style

The user is learning React for the first time (already built the `uyum-core` backend in NestJS, also learning-by-building there). Default mode is **teach, not implement**: explain the concept and what needs to be built and why, then let the user write it and share it back for review before moving to the next step. Break sizeable implementations into small, explained pieces rather than delivering everything at once. Only implement directly when explicitly asked to ("just do X", "implement this for me") — when in doubt, teach.

# Uyum

**Live demo:** [uyum-web.onrender.com](https://uyum-web.onrender.com)

Uyum lets someone pay with a debit/credit card and receive the equivalent value as UYUM tokens in a crypto wallet: submit card details + amount + wallet address, the backend charges the card and mints tokens once the charge clears. This repo is the frontend for that flow — account creation/login, submitting a mint request, and checking its status and history.

## What this is

This project is an experiment mimicking the real-world behavior of a stablecoin. **UYUM** is a token we created ourselves, deployed on the **Celo Sepolia testnet**:

- Smart contract on Celo Sepolia: [`0x0520F31085F7009681146002EFB9d555c30754AC`](https://celo-sepolia.blockscout.com/address/0x0520F31085F7009681146002EFB9d555c30754AC)
- Contract source: [github.com/sebasdeldi/uyum-contract](https://github.com/sebasdeldi/uyum-contract)

This application lets you mint UYUM tokens **1:1 with the Colombian peso (COP)**, by processing the card charge through [Wompi](https://wompi.com/es/co/), a Colombian payment processor.

**Important:** the payment integration used here runs against Wompi's *test* environment. That means the app reflects the real flow and lifecycle of an actual monetary transaction — validation, processing, success/failure states — using Wompi's test cards, without moving any real money.

## Related repositories

| Repo | What it is |
| --- | --- |
| [`uyum-web`](.) (this repo) | Frontend — React + TypeScript |
| [`uyum-core`](https://github.com/sebasdeldi/uyum-core) | Backend — NestJS API, auth, payment processing, minting |
| [`uyum-contract`](https://github.com/sebasdeldi/uyum-contract) | The UYUM ERC-20 smart contract (Celo Sepolia testnet) |

## Local development

1. **Clone and install dependencies:**

   ```sh
   git clone <this-repo-url>
   cd uyum-web
   npm install
   ```

2. **Set up environment variables** — copy `.env.example` to `.env`:

   ```sh
   cp .env.example .env
   ```

   By default this points at a locally running backend on `http://localhost:3000`.

3. **Run the backend** — this app needs [`uyum-core`](https://github.com/sebasdeldi/uyum-core) running locally (with Postgres + Redis, see that repo's own README for setup). Its CORS allowlist needs to include this app's dev server origin (`http://localhost:5173` by default) — check `uyum-core`'s `.env` if you hit CORS errors.

4. **Start the dev server:**

   ```sh
   npm run dev
   ```

   The app will be available at `http://localhost:5173`.

## Stack

Vite + React + TypeScript, TanStack Router, TanStack Query, Zustand, TanStack Form + Zod, antd, axios. See [`CLAUDE.md`](./CLAUDE.md) for the full architecture notes and working conventions for this repo.

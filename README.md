# Self‑contained Hono Examples

One‑command, local‑first demos using Hono across Workers, Pages, Next.js, Deno, and Bun.

## Why this repo? How it differs from the original

These examples are redesigned to be fully self‑contained and easy to try locally:

- Single command to run each example; no external accounts or secrets required by default.
- Browser‑first: a simple landing or UI so you can click around immediately.
- Local mocks and fallbacks (e.g., in‑memory KV, mock auth flow) to avoid setup hurdles.
- Better ergonomics: stable local URLs where helpful, and auto‑opening browser for some examples.
- Monorepo stays green via no‑op test scripts where actual tests aren’t provided.

Compared to the original Hono examples, this repo prioritizes quick, local demos with consistent DX and no‑secrets defaults. You can still opt into real services (KV, Stytch, etc.) when you want to go beyond local.

## Quickstart

Requirements

- Node.js 18+ and npm 10+
- macOS/Windows/Linux supported
- Deno and Bun are optional (only needed for those folders)

Install dependencies once at the root:

```bash
npm install
```

Run any example (the dev URL prints in the terminal):

```bash
npm -w <workspace> run dev
```

## Examples and how to run

- basic — Minimal Worker with routes and middleware
	- Run: `npm -w basic run dev`
- blog — CRUD API + simple UI; uses in‑memory storage locally
	- Run: `npm -w blog run dev`
- durable-objects — Counter Durable Object + UI
	- Run: `npm -w durable-objects run dev`
- env-vars — API client from env; local mock client provided in dev
	- Run: `npm -w env-vars run dev`
- serve-static — Serve static assets with a landing page/preview
	- Run: `npm -w serve-static run dev`
- jsx-ssr — Server‑rendered JSX via Hono
	- Run: `npm -w jsx-ssr run dev`
- hono-vite-jsx — Hono + Vite + hono/jsx/dom with a tiny API
	- Run: `npm -w hono-vite-jsx run dev`
- pages-stack — Cloudflare Pages: React client + Hono Functions + Zod; one‑command orchestrator; stable URL and auto‑open
	- Run: `npm -w pages-stack run dev` → http://localhost:8787/
- nextjs-stack — Next.js + Hono API route; one‑command dev
	- Run: `npm -w nextjs-stack run dev` → http://localhost:3000/
- stytch-auth — TODO app with Stytch auth; runs in mock‑auth locally (no secrets), real auth optional
	- Run: `npm -w stytch-auth run dev` → http://localhost:3000/

## Deno (standalone, optional)

- Minimal API:
	- `deno run -A deno/main.ts` → http://localhost:8000/
- JSX + static:
	- Simplest: `deno run -A deno/jsx.tsx`
	- Strict: `deno run --allow-net=0.0.0.0:8000 --allow-read=deno/public deno/jsx.tsx`

## Bun (standalone, optional)

- Install: macOS `brew install bun` or all OS `curl -fsSL https://bun.sh/install | bash`
- Minimal API:
	- `cd bun && bun install && bun run hello.ts` → http://localhost:3000/
- JSX + static:
	- `cd bun && bun install && bun run jsx.tsx` → http://localhost:3000/
	- Change port:
		- macOS/Linux: `PORT=8787 bun run jsx.tsx`
		- Windows PowerShell: `$Env:PORT=8787; bun run jsx.tsx`

## Tips & troubleshooting

- If a port is busy, set PORT (when supported) or stop the other process.
- Workers/Pages examples print a dev URL in the terminal; pages‑stack uses a stable 8787.
- Some examples default to local in‑memory storage in dev to avoid external services.

Author: Yusuke Wada — https://github.com/yusukebe

License: MIT

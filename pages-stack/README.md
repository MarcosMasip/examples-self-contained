# Cloudflare Pages + Hono API + React (self-contained)

This example pairs a Cloudflare Pages Functions API (Hono + Zod) with a Vite React client. It runs locally with one command on a stable URL and needs no secrets.

## Quickstart (one command)

From the repo root:

```bash
npm -w pages-stack run dev
```

What this does:
- Builds the client with Vite in watch mode to `./pages`
- Starts Wrangler Pages dev serving `./pages` plus Functions at a stable URL
- Auto-opens your browser to the app

App URL: http://localhost:8787/

Tip: You can change the port by setting `PORT`, e.g. `PORT=8788 npm -w pages-stack run dev`.

## Try it

When the page opens:
- It immediately calls `GET /api/hello?name=Pages` and shows the greeting
- Type another name and click “Call API” to invoke the function and update the message

Files to peek:
- `src/App.tsx` — React UI using `hc()` (Hono client) to call the API
- `functions/api/[[route]].ts` — Hono route with Zod validation (`GET /api/hello?name=...`)

## How it works

- Dev orchestration: `scripts/dev.js`
	- Runs `vite build --watch` (outputs to `./pages`)
	- After the first successful build, starts `wrangler pages dev pages --port 8787`
	- Keeps watching for changes and auto-opens the browser when ready
- Build output: `vite.config.ts` sets `build.outDir = "./pages"`
- API + Client run together under Wrangler Pages dev

## Build and deploy

```bash
npm -w pages-stack run build
npm -w pages-stack run deploy
```

This builds to `./pages` and deploys to Cloudflare Pages.

## Notes & troubleshooting

- Requirements: Node 18+ (for built-in `fetch` used by the dev script) and npm.
- No environment variables are needed for local dev.
- If the browser doesn’t open automatically, navigate to http://localhost:8787/ manually.
- To use a different port: set `PORT` (e.g., `PORT=8788`).
- The `test` script is a no-op for workspace consistency.

# Hono + Cloudflare Pages + React (Self‑contained)

This example shows a Pages Functions API (Hono + Zod) and a Vite React client, running locally with a single command.

## Quickstart (one command)

From the repo root:

```bash
npm -w pages-stack run dev
```

What starts:
- Vite dev server on http://localhost:5173/
- Wrangler Pages dev server on http://localhost:8787/ (proxying to Vite)

Open http://localhost:8787/

On the page:
- It loads the React app from the built output
- Initially calls `GET /api/hello?name=Pages` and renders the greeting
- Try typing a different name and click “Call API” to invoke the function and update the message

## How it works

- Client: `src/` is a Vite + React app. `src/App.tsx` uses `hc()` to call the API.
- API: `functions/api/[[route]].ts` is a Cloudflare Pages Function with Hono + zod‑validator.
- Dev: `wrangler pages dev pages --proxy 5173` serves the built dir (`pages`) and proxies asset requests to Vite. Functions run locally.
- Build: `vite build` outputs to `pages/` (configured in `vite.config.ts`).

## Build and deploy

```bash
npm -w pages-stack run build
npm -w pages-stack run deploy
```

This builds to `pages/` and deploys to Cloudflare Pages.

## Notes

- No environment variables required for local dev.
- The `test` script is a no‑op provided for workspace convenience.

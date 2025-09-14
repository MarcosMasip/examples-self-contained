# Hono example for Cloudflare Workers

This example shows a small Hono app running on Cloudflare Workers that demonstrates routing, middleware, simple auth, JSON responses, redirects, ETag caching, error handling, and a tiny HTML landing page to explore everything from your browser.

## Key points

- Fully self‑contained and local: no Cloudflare account or bindings required.
- One command dev: runs Wrangler in local mode by default.
- Browser‑friendly: a landing page at `/` links to every route, including a protected area with a simple login form.

## Run locally (one command)

```txt
npm install
npm run dev
```

Then open:

- http://localhost:8787

You’ll see a landing page with links to all routes and a small POST form.

## What it does (routes)

- `GET /hello` — plain text, adds a custom header `X-message`.
- `GET /entry/:id` — path param echo.
- `GET /book` — nested router (list books).
- `GET /book/:id` — nested router (get one book).
- `POST /book` — nested router (create).
- `GET /redirect` — redirects to `/`.
- Protected area:
	- `GET /auth/anything` — requires login; if not logged in, you’re redirected to `/auth/login`.
	- `GET /auth/login` — simple HTML login form (username: `hono`, password: `acoolproject`).
	- `POST /auth/login` — sets a cookie and redirects back.
	- `GET /auth/logout` — clears the cookie.
- `GET /etag/cached` — ETag enabled; reload may return `304 Not Modified` and show your cached body.
- `GET /fetch-url` — fetches https://example.com/ and reports its status.
- `GET /fetch-url?offline=1` — offline‑safe simulation (returns a fake success without network).
- `GET /user-agent` — echoes your User‑Agent header.
- API:
	- `GET /api/posts` — JSON list (pretty printed).
	- `POST /api/posts` — returns `{ message: "Created!" }` with `201`.
	- `GET /api/*` (fallback) — `404` with "API endpoint is not found".
- Errors:
	- `GET /error` — throws; handled by custom error handler (returns friendly `500`).
	- Unknown paths — custom "404 Not Found" text.

## How it works

- Framework: [Hono](https://hono.dev) with TypeScript.
- Runtime: Cloudflare Workers (Wrangler dev server in local mode).
- Middleware used:
	- `poweredBy()` — adds `x-powered-by: Hono`.
	- Custom response time — adds `X-Response-Time: …ms`.
	- Custom header on `/hello/*` — adds `X-message`.
	- `etag()` on `/etag/*` — enables conditional requests/304.
	- Custom error handler — preserves HTTP statuses and returns friendly `500` messages for unhandled errors.
- Auth (dev‑friendly, self‑contained):
	- Cookie‑based login form at `/auth/login` sets `AUTH=1`; `/auth/*` middleware checks the cookie and redirects to login if missing; `/auth/logout` clears it.
	- This avoids browser‑specific Basic Auth quirks and keeps the example completely local.
- No external services: no KV/Durable Objects/D1/etc. The only external call is to `https://example.com/` in `/fetch-url` (which you can simulate locally via `?offline=1`).

## Tests (optional)

```txt
npm test
```

Runs a small Vitest that checks the root route and headers.

## Deploying (optional)

If you want to publish to Cloudflare’s network, create a free Cloudflare account and follow: https://developers.cloudflare.com/workers/get-started/guide

Then:

```txt
npm run deploy
```

You’ll get a `*.workers.dev` URL. To use your own domain, configure routes/zone in Wrangler.

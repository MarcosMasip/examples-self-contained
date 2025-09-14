# hono-example-blog

CRUD web API for a Blog, now with a simple browser UI and a fully self‑contained local dev mode.

## What’s included

- Cloudflare Workers + Hono
- TypeScript
- JSON CRUD API under `/api`
- Minimal browser UI at `/` to list/create/edit/delete posts
- Self‑contained local storage: in local dev, a memory KV fallback is used automatically
- Simple cookie-based login to enable writes (dev‑only)
- Vitest tests using Cloudflare Workers test pool

## Run locally (one command)

```sh
npm install
npm run dev
```

Open http://localhost:8787 — you’ll see a small UI to interact with posts:
- Create a post (if not logged in, you’ll be redirected to `/login` — click Login once)
- Refresh to list posts
- Edit a post’s title/body and Save
- Delete a post
- Use `/logout` to clear the write permission cookie

## API endpoints (unchanged purpose)

All original API routes remain available under `/api`:

- `GET /api` → `{ message: "Hello" }`
- `GET /api/posts` → list posts
- `POST /api/posts` → create post (JSON body: `{ title, body }`)
- `GET /api/posts/:id` → get one
- `PUT /api/posts/:id` → update (JSON body: `{ title, body }`)
- `DELETE /api/posts/:id` → delete

Behavior remains the same:
- GET routes are open.
- Write routes (POST/PUT/DELETE) require auth. In local self‑contained mode, this is provided via a cookie set at `/login`.

## How it works

- In local dev, if `BLOG_EXAMPLE` isn’t configured, an in‑memory KV fallback is used so you can run with zero setup. This is only used in local dev; in production you should bind a real KV.
- The small UI calls the same `/api` endpoints you can call with curl or from other apps.
- A cookie (`BLOG_AUTH=1`) indicates you’re “logged in” for write operations while developing locally. It’s a dev‑only convenience, not intended for production auth.

## Running tests

Vitest runs against a Workers runtime. The test pool reads the example Wrangler config so you don’t need a real `wrangler.toml` to run tests.

```sh
npm -w blog test
```

## Deploying (optional)

To deploy to Cloudflare Workers and use a real KV namespace:

1. Create a KV namespace and bind it as `BLOG_EXAMPLE` in your `wrangler.toml`.
2. Configure any credentials you want to use for auth (or keep the simple cookie flow for demos).
3. Deploy:

```sh
npm run deploy
```

You’ll get a `*.workers.dev` URL. To use your own domain, configure routes/zone in Wrangler.

## Changelog (local self-contained updates)

- Default dev runs in local mode (`--local`) for one‑command usage.
- Added a small landing UI at `/` to browse and modify posts in the browser.
- Introduced a memory KV fallback in local dev when `BLOG_EXAMPLE` isn’t configured.
- Switched local write protection to a simple cookie‑based login (`/login`, `/logout`) to avoid Basic Auth browser quirks and keep usage frictionless.

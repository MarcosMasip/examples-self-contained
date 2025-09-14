# stytch-auth (self-contained)

Hono + Cloudflare Workers TODO app with Stytch auth. Runs locally with one command. When no Stytch credentials are present, it automatically runs in mock auth mode (login bypass) so you can explore the app fully self-contained.

## Quickstart (one command)

From the repo root:

```bash
npm -w stytch-auth run dev
```

App URL: http://localhost:3000/

What starts:
- Vite builds the client to `./assets` in watch mode
- Wrangler dev runs the Worker and serves `./assets` via the assets binding
- If no `VITE_STYTCH_PUBLIC_TOKEN` is set, mock auth mode is enabled client-side

## Try it

1) In mock mode (default, no credentials):
- You’ll see a banner “Mock auth mode” at the top; login is bypassed
- Go to “/todoapp”, add/complete/delete todos; data persists in-memory per session

2) With real Stytch credentials:
- Create `.env.local` with `VITE_STYTCH_PUBLIC_TOKEN=...`
- Provide Worker secrets and KV if desired, then run dev again to use real auth flows

## How it works

- Client: React app (`src/`) built by Vite to `./assets` and loaded by the Worker
- Auth: `src/Auth.tsx` checks for `VITE_STYTCH_PUBLIC_TOKEN` and falls back to mock auth when missing
- API: Hono app under `/api` with CRUD endpoints for todos (`api/TodoAPI.ts` and `api/TodoService.ts`)
- Storage: KV if bound; otherwise in-memory fallback in `TodoService`
- Dev orchestration: `scripts/dev.js` runs Vite build-watch, then `wrangler dev` on port 3000 and auto-opens the browser

## Deploy (optional)

To deploy with real auth and KV:
- Bind KV in `wrangler.jsonc` under `kv_namespaces`
- Upload secrets via `wrangler secret put` or `wrangler secret bulk`
- Build and deploy:

```bash
npm -w stytch-auth run build
npm -w stytch-auth run deploy
```

## Notes

- No environment variables required for local mock mode.
- The `test` script is a no-op for workspace consistency.
```



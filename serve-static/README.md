# Serve static files with Hono + Cloudflare Workers (Self‑contained)

This example serves files from the `assets/` directory using Cloudflare Workers’ static assets binding, alongside a small Hono app with an interactive landing page.

Learn more:
- Hono docs: https://hono.dev/docs/getting-started/cloudflare-workers#serve-static-files
- Cloudflare Workers static assets: https://developers.cloudflare.com/workers/static-assets/binding/#directory

## Quickstart (one command)

From the repo root:

```bash
npm install
npm -w serve-static run dev
```

Open http://localhost:8787/

On the page, click the buttons to fetch and display:
- /my-file.txt
- /folder/nested-file.txt
- /missing.txt (404 demo)

You can also click the direct links.

## How it works

- `wrangler.toml` sets `assets = { directory = "./assets/" }` to serve static files.
- `src/index.ts` renders a small UI that fetches those assets and shows the HTTP status and body inline.

## Deploy

Update `wrangler.toml` if you want to change the Worker name. Then deploy:

```bash
npm -w serve-static run deploy
```

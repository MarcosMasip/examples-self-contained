# Hono example for Cloudflare Workers

This is a fully local, self‑contained demo. You can run it with a single command and click around in your browser.

## Run locally (one command)

```txt
npm install
npm run dev
```

This starts a local server at:

- http://localhost:8787

Open that URL to see a landing page with links to all example routes.

## Deploying (optional)

If you want to publish to Cloudflare’s network, create a free Cloudflare account and follow the official guide: https://developers.cloudflare.com/workers/get-started/guide

Then:

```txt
npm run deploy
```

You’ll get a `*.workers.dev` URL. To use your own domain, configure routes/zone in Wrangler.

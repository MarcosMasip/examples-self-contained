# Environment Variables + API Client (Stripe) — Self‑contained

This example shows how to configure an API client (Stripe) in a Cloudflare Worker using environment bindings, wired through Hono middleware. It now includes a self‑contained local mode with a mock client so you can try it with one command and no secrets.

## What this is

- A tiny Worker that:
  - Reads env vars (LIVEMODE, STRIPE_RK, STRIPE_TK)
  - Instantiates a client in middleware and exposes it via `c.var`
  - Creates a Checkout Session and redirects to its URL
- A browser‑first demo that runs locally with zero configuration using a mock Stripe client.

## Quickstart (one command)

```bash
# from the repo root
npm install
npm -w env-vars run dev
```

Open http://localhost:8787/ and click “Create Checkout”. Without keys, you’ll be routed to a local mock checkout page and can complete the flow entirely in your browser.

## Original vs updated

Before (original intent):
- Required a `.dev.vars` file with real keys to try the example
- No UI, you’d hit `/checkout` which immediately redirected to Stripe
- Purpose: demonstrate setting up a real Stripe client using env vars

Now (self‑contained + original preserved):
- Works with no secrets: injects a mock client when keys are missing
- Adds a small UI at `/` and helper pages: `/mock-checkout`, `/mock-success`
- Still supports real Stripe when keys are provided (unchanged behavior)
- Purpose: same concept (configure clients from env), but frictionless to run and easy to understand

## How it works

Middleware chooses which client to attach to `c.var.stripe`:
- If keys are present:
  - `LIVEMODE=true` → use `STRIPE_RK` (live)
  - `LIVEMODE=false` → use `STRIPE_TK` (test)
- If keys are missing (local default):
  - Use a mock client. Session URLs point to `/mock-checkout` instead of stripe.com

Routes at a glance:
- GET `/` → Browser UI + “Create Checkout” button
- GET `/checkout` → Creates a session via the configured client and redirects to its URL
- GET `/env` → JSON: `{ livemode, client: mock|stripe-test|stripe-live }`
- GET `/mock-checkout`, `/mock-success` → Local pages to simulate Checkout

Security note: mock mode never sends requests to Stripe. When keys are present, the real Stripe SDK is used as before.

## Use real Stripe keys locally (optional)

Create a `.dev.vars` in this folder:

```bash
LIVEMODE = false
STRIPE_TK = sk_test_...
# If LIVEMODE=true, provide the live key instead:
# LIVEMODE = true
# STRIPE_RK = sk_live_...
```

Reload the page and click “Create Checkout”. You’ll be redirected to real Stripe Checkout.

## Deploy

```bash
npm -w env-vars run deploy
```

Configure these environment variables in your Cloudflare project:
- `LIVEMODE` (true/false)
- `STRIPE_RK` (required when `LIVEMODE=true`)
- `STRIPE_TK` (required when `LIVEMODE=false`)

## File tour

- `src/index.ts` — Hono app, middleware that injects the client (real or mock), routes and demo UI.

## References

- Hono: https://hono.dev/
- Stripe: https://docs.stripe.com/

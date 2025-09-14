# hono-example-durable-objects

Durable Objects counter demo — fully self‑contained with a simple browser UI.

## What’s included

- Cloudflare Workers + Hono + TypeScript
- Durable Object `Counter` with strongly consistent per‑name state
- Minimal UI at `/` to view/increment/decrement a named counter
- JSON API under `/api` used by the UI

## Run locally (one command)

```sh
npm install
npm run dev
```

From the monorepo root you can also run:

```sh
npm -w durable-objects run dev
```

Open http://localhost:8787 and try it:
- Pick a name (e.g. `A`) and click “Show value”
- Use Increment/Decrement; values are stored in the Durable Object for that name
 - Use different names (e.g. `B`, `team-alpha`) to get isolated counters

## Endpoints

Text API (original sample):
- `GET /?name=A` → plain text with current value
- `GET /increment?name=A` → increments, returns plain text
- `GET /decrement?name=A` → decrements, returns plain text

JSON API (used by the UI):
- `GET /api/value?name=A` → `{ name, count }`
- `POST /api/increment?name=A` → `{ name, count }`
- `POST /api/decrement?name=A` → `{ name, count }`

You can script these with curl:

```sh
# Read
curl "http://localhost:8787/api/value?name=A"

# Increment
curl -X POST "http://localhost:8787/api/increment?name=A"

# Decrement
curl -X POST "http://localhost:8787/api/decrement?name=A"
```

## How it works

- `src/counter.ts` defines `class Counter extends DurableObject` using `this.ctx.storage` to persist a numeric `value`.
- `src/index.ts` resolves a Durable Object instance by name via `idFromName(name)` and calls methods on its stub:
	- `stub.getCounterValue()`
	- `stub.increment()`
	- `stub.decrement()`
- Each unique `name` maps to a single Durable Object instance, providing ordered, serialized updates and strongly consistent reads.

## What changed vs the original sample

- Kept original text endpoints for full parity (`/?name=…`, `/increment`, `/decrement`).
- Added a small browser UI at `/` for a zero‑friction, one‑command local experience.
- Added a JSON API under `/api` (the UI uses these; handy for curl and integrations).
- Default dev runs the local Workers runtime; no extra flags needed.
- Repo postinstall auto‑installs platform‑specific native binaries (workerd/rollup) so fresh clones work on macOS, Windows, and Linux without extra steps.

## Deploying (optional)

This example includes a `wrangler.toml` that binds the Durable Object and a migration:

```toml
[[durable_objects.bindings]]
name = "COUNTERS"
class_name = "Counter"

[[migrations]]
tag = "v1"
new_classes = ["Counter"]
```

Deploy with:

```sh
npm run deploy
```

You’ll get a `*.workers.dev` URL. Configure routes/zone if using your own domain.

## Troubleshooting

- If you ever see errors mentioning missing `@cloudflare/workerd-…` or `@rollup/rollup-…`, just run `npm install` at the repository root — the postinstall hook will auto‑install the right native binary for your OS/arch.
- Wrangler now defaults to local mode. If you see a warning about `--local`, it’s safe to ignore.

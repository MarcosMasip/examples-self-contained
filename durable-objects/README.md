# hono-example-durable-objects

Durable Objects counter demo, now fully self‑contained with a simple browser UI.

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

Open http://localhost:8787 and try it:
- Pick a name (e.g. `A`) and click “Show value”
- Use Increment/Decrement; values are stored in the Durable Object for that name

## Endpoints

Text API (original sample):
- `GET /?name=A` → plain text with current value
- `GET /increment?name=A` → increments, returns plain text
- `GET /decrement?name=A` → decrements, returns plain text

JSON API (used by the UI):
- `GET /api/value?name=A` → `{ name, count }`
- `POST /api/increment?name=A` → `{ name, count }`
- `POST /api/decrement?name=A` → `{ name, count }`

## How it works

- `src/counter.ts` defines `class Counter extends DurableObject` using `this.ctx.storage` to persist a numeric `value`.
- `src/index.ts` resolves a Durable Object instance by name via `idFromName(name)` and calls methods on its stub:
	- `stub.getCounterValue()`
	- `stub.increment()`
	- `stub.decrement()`
- Each unique `name` maps to a single Durable Object instance, providing ordered, serialized updates and strongly consistent reads.

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

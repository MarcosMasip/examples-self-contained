# Next.js + Hono (self-contained)

This example shows a Next.js app with a Hono API route (Edge runtime) and a simple React UI that calls it using `hc()` and SWR. It runs locally with one command and requires no secrets.

## Quickstart

From this folder:

```bash
npm install
npm run dev
```

Open http://localhost:3000/

## Try it

- Type a name and click “Send” to POST to `POST /api/hello`
- The page shows the JSON response `{ message: "Hello <name>!" }`

## How it works

- API: `pages/api/[...route].ts` defines a Hono route on `/api/hello` with Zod validation (Edge runtime via `hono/vercel`)
- Client: `pages/index.tsx` uses `hc()` to call the API and `swr/mutation` for the mutation

## Notes

- No environment variables are needed for local dev.
- The `test` script is a no-op for workspace consistency.

## License

MIT

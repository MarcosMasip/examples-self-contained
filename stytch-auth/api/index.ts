import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { TodoAPI } from './TodoAPI'

type EnvWithOptional = Partial<Env> & { ASSETS?: Fetcher }

const app = new Hono<{ Bindings: EnvWithOptional }>()
    .use(cors())
    .route('/api', TodoAPI)
    .all('*', async (c) => {
        // Serve static assets if bound; otherwise return a simple HTML fallback
        if (c.env.ASSETS) {
            return c.env.ASSETS.fetch(c.req.raw)
        }
        return c.html(`<!doctype html>
            <html>
                <head>
                    <meta charset="utf-8" />
                    <meta name="viewport" content="width=device-width, initial-scale=1" />
                    <title>stytch-auth (mock mode)</title>
                </head>
                <body>
                    <div id="root"></div>
                    <p>Assets binding not configured. Build the client to ./assets and run via Wrangler for full experience.</p>
                </body>
            </html>`)
    })

export default app

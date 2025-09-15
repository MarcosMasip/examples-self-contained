import { Hono } from 'hono'
import { html } from 'hono/html'
import { logger } from 'hono/logger'
import { poweredBy } from 'hono/powered-by'

const app = new Hono()

app.use('*', logger(), poweredBy())
// Serve static files under /public/* from the local public directory (relative to this file)
import { serveStatic } from 'hono/deno'
const publicRoot = new URL('./', import.meta.url).pathname
app.get('/public/*', serveStatic({ root: publicRoot }))
// Redirect /favicon.ico to /public/favicon.ico
app.get('/favicon.ico', (c) => c.redirect('/public/favicon.ico'))

type Props = {
  title: string
  // deno-lint-ignore no-explicit-any
  children?: any
}

const Layout = (props: Props) => html`<!DOCTYPE html>
  <html>
    <head>
      <title>${props.title}</title>
      <link rel="icon" href="/public/favicon.ico" type="image/x-icon" />
    </head>
    <body>
      ${props.children}
    </body>
  </html>`

app.get('/', (c) => {
  // @ts-ignore JSX rendered by Hono's JSX runtime
  return c.html(
    <Layout title="Hello Deno!">
      <h1>Hono JSX example</h1>
    </Layout>
  )
})

// @ts-ignore Deno global is available at runtime
Deno.serve(app.fetch)

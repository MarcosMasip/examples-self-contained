import { Hono } from 'hono'
import { etag } from 'hono/etag'
import { HTTPException } from 'hono/http-exception'
import { poweredBy } from 'hono/powered-by'
import { prettyJSON } from 'hono/pretty-json'

const app = new Hono()

// Mount Builtin Middleware
app.use('*', poweredBy())
// app.use('*', logger())
app.use('/etag/*', etag())

// Simple self-contained auth (dev-only style): login form sets a cookie; /auth/* checks it
const USER = 'hono'
const PASS = 'acoolproject'

app.get('/auth/login', (c) => {
  const url = new URL(c.req.url)
  const next = url.searchParams.get('next') || '/auth/anything'
  return c.html(`<!doctype html>
  <html lang="en">
    <head>
      <meta charset="utf-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1" />
      <title>Login</title>
      <style>body{font-family:system-ui,-apple-system,Segoe UI,Roboto,sans-serif;margin:2rem;max-width:28rem}input,button{font-size:1rem;padding:.5rem;border:1px solid #ccc;border-radius:6px}label{display:block;margin:.5rem 0 .25rem}form{display:grid;gap:.5rem}</style>
    </head>
    <body>
      <h1>Login</h1>
      <p>Enter credentials to access <code>/auth/*</code> routes.</p>
      <form method="post" action="/auth/login">
        <input type="hidden" name="next" value="${next}" />
        <label>Username</label>
        <input name="username" value="${USER}" />
        <label>Password</label>
        <input name="password" type="password" value="${PASS}" />
        <button type="submit">Sign in</button>
      </form>
      <p><small>Hint: username <code>${USER}</code>, password <code>${PASS}</code></small></p>
    </body>
  </html>`)
})

app.post('/auth/login', async (c) => {
  const form = await c.req.formData()
  const u = form.get('username')?.toString() || ''
  const p = form.get('password')?.toString() || ''
  const next = form.get('next')?.toString() || '/auth/anything'
  if (u === USER && p === PASS) {
    c.header('Set-Cookie', 'AUTH=1; Path=/; HttpOnly; SameSite=Lax')
    return c.redirect(next)
  }
  return c.html('<p>Invalid credentials. <a href="/auth/login">Try again</a>.</p>', 401)
})

app.get('/auth/logout', (c) => {
  c.header('Set-Cookie', 'AUTH=; Path=/; Max-Age=0; HttpOnly; SameSite=Lax')
  return c.redirect('/')
})

app.use('/auth/*', async (c, next) => {
  const cookie = c.req.header('Cookie') || ''
  if (!cookie.includes('AUTH=1')) {
    const u = new URL(c.req.url)
    const nextPath = u.pathname + (u.search || '')
    return c.redirect(`/auth/login?next=${encodeURIComponent(nextPath)}`)
  }
  await next()
})

// Custom Middleware
// Add Custom Header
app.use('/hello/*', async (c, next) => {
  await next()
  c.header('X-message', 'This is addHeader middleware!')
})

// Add X-Response-Time header
app.use('*', async (c, next) => {
  const start = Date.now()
  await next()
  const ms = Date.now() - start
  c.header('X-Response-Time', `${ms}ms`)
})

// Custom Not Found Message
app.notFound((c) => {
  return c.text('Custom 404 Not Found', 404)
})

// Error handling
app.onError((err, c) => {
  if (err instanceof HTTPException) {
    if (err.status === 401) {
      // Explicitly return a challenge so more browsers show the native prompt
      return new Response('Unauthorized', {
        status: 401,
        headers: {
          'WWW-Authenticate': 'Basic realm="Hono Basic", charset="UTF-8"',
          'Cache-Control': 'no-store'
        }
      })
    }
    console.error(`${err}`)
    return err.getResponse()
  }
  console.error(`${err}`)
  return c.text('Custom Error Message', 500)
})

// Routing
app.get('/', (c) =>
  c.html(`<!doctype html>
  <html lang="en">
    <head>
      <meta charset="utf-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1" />
      <title>Hono Basic Example</title>
      <style>
        body { font-family: system-ui, -apple-system, Segoe UI, Roboto, sans-serif; line-height: 1.45; margin: 2rem; }
        h1 { margin-bottom: .25rem; }
        code { background: #f6f8fa; padding: .1rem .3rem; border-radius: 4px; }
        ul { columns: 2; gap: 2rem; max-width: 60rem; }
        li { break-inside: avoid; margin: .4rem 0; }
        small { color: #555; }
        .hint { margin:.5rem 0 1rem; color:#333 }
        form { margin-top: .25rem; }
        button { cursor: pointer; }
      </style>
    </head>
    <body>
      <h1>Hono Basic Example</h1>
      <p class="hint">This is a local demo running on Cloudflare Workers (via Wrangler). Click links to try endpoints in your browser.</p>

      <h2>Routes</h2>
      <ul>
        <li><a href="/hello">GET /hello</a> <small>– plain text</small></li>
        <li><a href="/entry/123">GET /entry/:id</a> <small>– path param</small></li>
        <li><a href="/book">GET /book</a> <small>– nested route</small></li>
        <li><a href="/book/42">GET /book/:id</a></li>
        <li>
          POST /book <small>– create book</small>
          <form action="/book" method="post"><button type="submit">Send POST</button></form>
        </li>
    <li><a href="/redirect">GET /redirect</a> <small>– 302 to /</small></li>
    <li><a href="/auth/anything" target="_blank" rel="noopener">GET /auth/*</a> <small>– requires login; default creds shown on /auth/login</small></li>
        <li><a href="/etag/cached">GET /etag/cached</a> <small>– has ETag; reload to see 304</small></li>
  <li><a href="/fetch-url">GET /fetch-url</a> <small>– fetch example.com</small></li>
  <li><a href="/fetch-url?offline=1">GET /fetch-url?offline=1</a> <small>– simulate offline</small></li>
  <li><a href="/user-agent">GET /user-agent</a> <small>– echoes your User-Agent</small></li>
  <li><a href="/api/posts">GET /api/posts</a> <small>– JSON list</small></li>
  <li><a href="/api/unknown">GET /api/unknown</a> <small>– default 404 for API</small></li>
        <li><a href="/error">GET /error</a> <small>– triggers 500</small></li>
        <li><a href="/not-found">GET /not-found</a> <small>– custom 404</small></li>
      </ul>

      <p><small>Tip: For <code>/etag/cached</code>, your browser may show 304 on reload and keep showing the cached body. Use a hard refresh to re-fetch.</small></p>
    </body>
  </html>`)
)
// Use Response object directly
app.get('/hello', () => new Response('This is /hello'))

// Named parameter
app.get('/entry/:id', (c) => {
  const id = c.req.param('id')
  return c.text(`Your ID is ${id}`)
})

// Nested route
const book = new Hono()
book.get('/', (c) => c.text('List Books'))
book.get('/:id', (c) => {
  const id = c.req.param('id')
  return c.text('Get Book: ' + id)
})
book.post('/', (c) => c.text('Create Book'))
app.route('/book', book)

// Redirect
app.get('/redirect', (c) => c.redirect('/'))
// Authentication required
app.get('/auth/*', (c) => c.text('You are authorized'))
// ETag
app.get('/etag/cached', (c) => c.text('Is this cached?'))

// Async
app.get('/fetch-url', async (c) => {
  const offline = c.req.query('offline')
  if (offline === '1') {
    return c.text('https://example.com/ is 200 (simulated offline)')
  }
  try {
    const response = await fetch('https://example.com/')
    return c.text(`https://example.com/ is ${response.status}`)
  } catch (e) {
    return c.text('https://example.com/ is unreachable (offline?)')
  }
})

// (auth-ui removed; cookie-based login flow is used instead)

// Request headers
app.get('/user-agent', (c) => {
  const userAgent = c.req.header('User-Agent')
  return c.text(`Your UserAgent is ${userAgent}`)
})

// JSON
app.get('/api/posts', prettyJSON(), (c) => {
  const posts = [
    { id: 1, title: 'Good Morning' },
    { id: 2, title: 'Good Afternoon' },
    { id: 3, title: 'Good Evening' },
    { id: 4, title: 'Good Night' }
  ]
  return c.json(posts)
})
// status code
app.post('/api/posts', (c) => c.json({ message: 'Created!' }, 201))
// default route
app.get('/api/*', (c) => c.text('API endpoint is not found', 404))

// Throw Error
app.get('/error', () => {
  throw Error('Error has occurred')
})

// @ts-ignore
app.get('/type-error', () => 'return not Response instance')

export default app

import { Hono } from 'hono'
import { prettyJSON } from 'hono/pretty-json'
import api from './api'
import { Bindings } from './bindings'

// In-memory KV fallback for fully local, self-contained dev (no wrangler config needed)
const mem = new Map<string, string>()
const memoryKV = {
  async get(key: string) {
    return mem.has(key) ? mem.get(key)! : null
  },
  async put(key: string, value: string) {
    mem.set(key, value)
  },
  async delete(key: string) {
    mem.delete(key)
  },
  async list(opts?: { prefix?: string }) {
    const keys: Array<{ name: string }> = []
    const p = opts?.prefix
    for (const k of mem.keys()) {
      if (!p || k.startsWith(p)) keys.push({ name: k })
    }
    return { keys }
  }
} as unknown as KVNamespace

const app = new Hono()

// Landing page with a tiny UI to interact with the API from the browser
app.get('/', (c) =>
  c.html(`<!doctype html>
  <html lang="en">
    <head>
      <meta charset="utf-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1" />
      <title>Blog API (Self-contained)</title>
      <style>
        body{font-family:system-ui,-apple-system,Segoe UI,Roboto,sans-serif;margin:2rem;line-height:1.45;}
        input,button,textarea{font:inherit;padding:.5rem;border:1px solid #ccc;border-radius:6px}
        textarea{width:100%;min-height:6rem}
        .row{display:flex;gap:.5rem;flex-wrap:wrap}
        .card{border:1px solid #e5e7eb;border-radius:8px;padding:1rem;margin:.5rem 0}
        .muted{color:#666}
        pre{background:#f6f8fa;padding:1rem;border-radius:6px;overflow:auto}
      </style>
    </head>
    <body>
      <h1>Blog API</h1>
      <p class="muted">Fully local & self-contained. Create, update, and delete posts right here.</p>

      <section class="card">
        <h2>Create Post</h2>
        <div class="row">
          <input id="title" placeholder="Title" />
        </div>
        <div class="row">
          <textarea id="body" placeholder="Body"></textarea>
        </div>
        <div class="row">
          <button id="create">Create</button>
          <button id="refresh">Refresh List</button>
          <a href="/login" id="loginLink">Login</a>
          <a href="/logout" id="logoutLink">Logout</a>
        </div>
      </section>

      <section class="card">
        <h2>Posts</h2>
        <div id="list"></div>
      </section>

      <script>
        async function listPosts(){
          const res = await fetch('/api/posts');
          const data = await res.json();
          const wrap = document.getElementById('list');
          wrap.innerHTML = '';
          data.posts.forEach(p => {
            const el = document.createElement('div');
            el.className = 'card';
            const escTitle = String(p.title).replaceAll('"','&quot;');
            const escBody = String(p.body).replaceAll('<','&lt;');
            el.innerHTML =
              '<strong>'+
              '  <input value="'+ escTitle +'" data-id="'+ p.id +'" class="t" />'+
              '</strong>'+
              '<div><textarea class="b" data-id="'+ p.id +'">'+ escBody +'</textarea></div>'+
              '<div class="row">'+
              '  <button class="save" data-id="'+ p.id +'">Save</button>'+
              '  <button class="del" data-id="'+ p.id +'">Delete</button>'+
              '  <span class="muted">id: '+ p.id +'</span>'+
              '</div>';
            wrap.appendChild(el);
          });
          wrap.querySelectorAll('.save').forEach(btn => btn.addEventListener('click', async (e) => {
            const id = e.target.getAttribute('data-id');
            const t = wrap.querySelector('input.t[data-id="'+id+'"]').value;
            const b = wrap.querySelector('textarea.b[data-id="'+id+'"]').value;
            const res = await fetch('/api/posts/'+id, { method:'PUT', headers:{'Content-Type':'application/json'}, body: JSON.stringify({title:t, body:b})});
            if(!res.ok){ alert('Update failed (are you logged in?)'); }
            listPosts();
          }));
          wrap.querySelectorAll('.del').forEach(btn => btn.addEventListener('click', async (e) => {
            const id = e.target.getAttribute('data-id');
            const res = await fetch('/api/posts/'+id, { method:'DELETE' });
            if(!res.ok){ alert('Delete failed (are you logged in?)'); }
            listPosts();
          }));
        }
        document.getElementById('create').addEventListener('click', async () => {
          const title = document.getElementById('title').value.trim();
          const body = document.getElementById('body').value.trim();
          const res = await fetch('/api/posts', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({title, body})});
          if(res.status === 201){ document.getElementById('title').value=''; document.getElementById('body').value=''; }
          else { alert('Create failed (are you logged in?)'); }
          listPosts();
        });
        document.getElementById('refresh').addEventListener('click', listPosts);
        listPosts();
      </script>
    </body>
  </html>`)
)

app.notFound((c) => c.json({ message: 'Not Found', ok: false }, 404))

// Middleware stack for /api: pretty JSON, KV fallback, and cookie-based auth for non-GET
const middleware = new Hono<{ Bindings: Bindings }>()
middleware.use('*', prettyJSON())

// Ensure KV binding exists in local mode without wrangler config
middleware.use('*', async (c, next) => {
  if (!c.env.BLOG_EXAMPLE) {
    // @ts-ignore
    c.env.BLOG_EXAMPLE = memoryKV
  }
  await next()
})

// Simple cookie-based auth for write operations (POST/PUT/DELETE)
middleware.use('/posts/*', async (c, next) => {
  if (c.req.method === 'GET') return next()
  const cookie = c.req.header('Cookie') || ''
  if (!cookie.includes('BLOG_AUTH=1')) {
    // Redirect to login with return path
    const u = new URL(c.req.url)
    const nextPath = '/'+u.pathname.split('/').slice(2).join('/') + (u.search || '')
    return c.redirect(`/login?next=${encodeURIComponent('/api/'+nextPath)}`)
  }
  return next()
})

// Auth endpoints for the UI (sets/clears a cookie)
app.get('/login', (c) => {
  const url = new URL(c.req.url)
  const next = url.searchParams.get('next') || '/'
  return c.html(`<!doctype html>
  <html lang="en"><head><meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Login</title>
  <style>body{font-family:system-ui,-apple-system,Segoe UI,Roboto,sans-serif;margin:2rem;max-width:28rem}input,button{font:inherit;padding:.5rem;border:1px solid #ccc;border-radius:6px}label{display:block;margin:.5rem 0 .25rem}form{display:grid;gap:.5rem}</style>
  </head><body>
  <h1>Login</h1>
  <form method="post" action="/login">
    <input type="hidden" name="next" value="${next}" />
    <label>Click login to enable writes</label>
    <button type="submit">Login</button>
  </form>
  <p class="muted">This sets a dev-only cookie so you can POST/PUT/DELETE.</p>
  </body></html>`)
})

app.post('/login', async (c) => {
  const form = await c.req.formData()
  const next = form.get('next')?.toString() || '/'
  c.header('Set-Cookie', 'BLOG_AUTH=1; Path=/; HttpOnly; SameSite=Lax')
  return c.redirect(next)
})

app.get('/logout', (c) => {
  c.header('Set-Cookie', 'BLOG_AUTH=; Path=/; Max-Age=0; HttpOnly; SameSite=Lax')
  return c.redirect('/')
})

// Mount middleware and API under /api
app.route('/api', middleware)
app.route('/api', api)

export default app

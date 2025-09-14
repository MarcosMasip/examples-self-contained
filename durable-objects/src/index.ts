import { Hono } from 'hono'
import { createMiddleware } from 'hono/factory'
import { Counter } from './counter'

type Env = {
  Bindings: {
    COUNTERS: DurableObjectNamespace<Counter>
  }
  Variables: {
    count: number
    stub: DurableObjectStub<Counter>
  }
}

const app = new Hono<Env>()

// Self-contained landing page UI
app.get('/', async (c) => {
  const qname = c.req.query('name')
  if (qname) {
    const id = c.env.COUNTERS.idFromName(qname)
    const stub = c.env.COUNTERS.get(id)
    const count = await stub.getCounterValue()
    return c.text(`Durable Object '${qname}' count: ${count}`)
  }
  return c.html(`<!doctype html>
  <html lang="en">
    <head>
      <meta charset="utf-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1" />
      <title>Durable Objects Counter</title>
      <style>
        body{font-family:system-ui,-apple-system,Segoe UI,Roboto,sans-serif;margin:2rem;line-height:1.45;max-width:48rem}
        input,button{font:inherit;padding:.5rem;border:1px solid #ccc;border-radius:6px}
        .row{display:flex;gap:.5rem;flex-wrap:wrap;align-items:center}
        .card{border:1px solid #e5e7eb;border-radius:8px;padding:1rem;margin:.5rem 0}
        .muted{color:#666}
        .count{font-size:1.5rem;font-weight:600}
      </style>
    </head>
    <body>
      <h1>Durable Objects: Counter</h1>
      <p class="muted">Pick a counter name, then increment/decrement it. Each unique <code>name</code> maps to a single, strongly-consistent Durable Object instance.</p>

      <section class="card">
        <div class="row">
          <label for="name">Name</label>
          <input id="name" placeholder="e.g. A" value="A" />
          <button id="refresh">Show value</button>
        </div>
        <div class="row">
          <button id="inc">Increment</button>
          <button id="dec">Decrement</button>
          <span class="count" id="count">—</span>
        </div>
      </section>

      <script>
        async function fetchJSON(url, opts){
          const res = await fetch(url, opts);
          if(!res.ok){ throw new Error('Request failed: '+res.status); }
          return res.json();
        }
        function getName(){
          const n = document.getElementById('name').value.trim();
          return n || 'A';
        }
        async function refresh(){
          const n = getName();
          const data = await fetchJSON('/api/value?name='+encodeURIComponent(n));
          document.getElementById('count').textContent = String(data.count);
        }
        document.getElementById('refresh').addEventListener('click', (e)=>{ e.preventDefault(); refresh(); });
        document.getElementById('inc').addEventListener('click', async (e)=>{
          e.preventDefault();
          const n = getName();
          await fetchJSON('/api/increment?name='+encodeURIComponent(n), { method: 'POST' });
          refresh();
        });
        document.getElementById('dec').addEventListener('click', async (e)=>{
          e.preventDefault();
          const n = getName();
          await fetchJSON('/api/decrement?name='+encodeURIComponent(n), { method: 'POST' });
          refresh();
        });
        refresh();
      </script>
    </body>
  </html>`)
})

// Text API (original sample behavior), kept for compatibility
const durableObjectMiddleware = createMiddleware<Env>(async (c, next) => {
  const name = c.req.query('name')
  if (!name) {
    return c.text(
      'Select a Durable Object to contact by using the `name` URL query string parameter, for example, ?name=A'
    )
  }
  const id = c.env.COUNTERS.idFromName(name)
  const stub = c.env.COUNTERS.get(id)
  c.set('stub', stub)
  await next()
  c.res = c.text(`Durable Object '${name}' count: ${c.var.count}`)
})

app.get('/increment', durableObjectMiddleware, async (c, next) => {
  const count = await c.var.stub.increment()
  c.set('count', count)
  await next()
})

app.get('/decrement', durableObjectMiddleware, async (c, next) => {
  const count = await c.var.stub.decrement()
  c.set('count', count)
  await next()
})

// JSON API used by the UI
app.get('/api/value', async (c) => {
  const name = c.req.query('name')
  if (!name) return c.json({ error: 'Missing name' }, 400)
  const id = c.env.COUNTERS.idFromName(name)
  const stub = c.env.COUNTERS.get(id)
  const count = await stub.getCounterValue()
  return c.json({ name, count })
})

app.post('/api/increment', async (c) => {
  const name = c.req.query('name')
  if (!name) return c.json({ error: 'Missing name' }, 400)
  const id = c.env.COUNTERS.idFromName(name)
  const stub = c.env.COUNTERS.get(id)
  const count = await stub.increment()
  return c.json({ name, count })
})

app.post('/api/decrement', async (c) => {
  const name = c.req.query('name')
  if (!name) return c.json({ error: 'Missing name' }, 400)
  const id = c.env.COUNTERS.idFromName(name)
  const stub = c.env.COUNTERS.get(id)
  const count = await stub.decrement()
  return c.json({ name, count })
})

export { Counter }

export default app

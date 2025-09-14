import { Hono } from "hono";
import { Stripe } from "stripe";

type StripeLike = {
  checkout: { sessions: { create: (params: any) => Promise<{ url: string }> } };
};

type Variables = {
  stripe: StripeLike; // Stripe Client (real or mock)
};

type Bindings = {
  LIVEMODE: boolean; // Stripe Livemode true | false
  STRIPE_RK: string; // Stripe Restricted API Key (live)
  STRIPE_TK: string; // Stripe Test Key (test)
};

const app = new Hono<{ Bindings: Bindings; Variables: Variables }>();

// Landing page UI
app.get('/', (c) => {
  const url = new URL(c.req.url)
  return c.html(`<!doctype html>
  <html lang="en">
    <head>
      <meta charset="utf-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1" />
      <title>Env Vars + API Client</title>
      <style>
        body{font-family:system-ui,-apple-system,Segoe UI,Roboto,sans-serif;margin:2rem;line-height:1.45;max-width:48rem}
        input,button{font:inherit;padding:.5rem;border:1px solid #ccc;border-radius:6px}
        .row{display:flex;gap:.5rem;flex-wrap:wrap;align-items:center}
        .card{border:1px solid #e5e7eb;border-radius:8px;padding:1rem;margin:.5rem 0}
        .muted{color:#666}
        code{background:#f6f8fa;padding:.15rem .35rem;border-radius:4px}
      </style>
    </head>
    <body>
      <h1>Env Vars + API Client (Stripe)</h1>
      <p class="muted">This demo instantiates a client in middleware using environment bindings. In local self‑contained mode, a mock client is used.</p>
      <section class="card">
        <h2>Try Checkout</h2>
        <p>Click to create a Checkout Session using the configured client.</p>
        <div class="row"><a href="/checkout"><button>Create Checkout</button></a></div>
      </section>
      <section class="card">
        <h2>Current Mode</h2>
        <div id="info" class="muted">loading…</div>
      </section>
      <script>
        (async () => {
          try{
            const res = await fetch('/env');
            const data = await res.json();
            const el = document.getElementById('info');
            el.textContent = 'livemode=' + data.livemode + ' (client=' + data.client + ')';
          }catch(e){
            document.getElementById('info').textContent = 'unable to load env info';
          }
        })();
      </script>
    </body>
  </html>`)
})

app.use("*", async (c, next) => {
  // Provide local, self-contained defaults if no bindings are present
  const hasTestKey = !!c.env.STRIPE_TK
  const hasLiveKey = !!c.env.STRIPE_RK
  const liveMode = Boolean(c.env.LIVEMODE)

  if (!hasTestKey && !hasLiveKey) {
    // Mock Stripe client for self-contained local dev
    const origin = new URL(c.req.url).origin
    const mock: StripeLike = {
      checkout: {
        sessions: {
          create: async (_params: any) => {
            const sid = (typeof crypto !== 'undefined' && 'randomUUID' in crypto)
              ? crypto.randomUUID()
              : Math.random().toString(36).slice(2)
            return { url: origin + '/mock-checkout?sid=' + encodeURIComponent(sid) }
          }
        }
      }
    }
    c.set("stripe", mock)
  } else {
    // Real Stripe client (will error if keys invalid)
    const stripeKey: string = liveMode ? c.env.STRIPE_RK : c.env.STRIPE_TK
    const real = new Stripe(stripeKey, { maxNetworkRetries: 3, timeout: 30 * 1000 }) as unknown as StripeLike
    c.set("stripe", real)
  }

  await next();
});

app.get("/checkout", async (c) => {
  // Retrieve the Stripe-like client from the variable object
  const stripe = c.var.stripe;

  // Create a Checkout session (mock or real) and redirect to its URL
  const session = await stripe.checkout.sessions.create({
    line_items: [
      {
        quantity: 1,
        price_data: {
          unit_amount: 1000,
          currency: "aud",
          product_data: { name: "Hono Starter Kit" },
        },
      },
    ],
    mode: "payment",
    success_url: new URL('/', c.req.url).origin + '/mock-success',
  });
  return c.redirect(session.url as string);
});

// Small JSON helper to show effective mode in the UI
app.get('/env', (c) => {
  const hasTestKey = !!c.env.STRIPE_TK
  const hasLiveKey = !!c.env.STRIPE_RK
  const liveMode = Boolean(c.env.LIVEMODE)
  const client = !hasTestKey && !hasLiveKey ? 'mock' : (liveMode ? 'stripe-live' : 'stripe-test')
  return c.json({ livemode: liveMode, client })
})

// Mock checkout pages for self-contained flow
app.get('/mock-checkout', (c) => {
  const sid = new URL(c.req.url).searchParams.get('sid') || 'mock'
  return c.html(`<!doctype html><meta charset="utf-8" />
  <title>Mock Checkout</title>
  <body style="font-family:system-ui,-apple-system,Segoe UI,Roboto,sans-serif;margin:2rem">
    <h1>Mock Checkout</h1>
    <p class="muted">Session: <code>${sid}</code></p>
    <p>This simulates Stripe Checkout in local self‑contained mode.</p>
    <p><a href="/mock-success"><button>Complete Payment</button></a></p>
  </body>`)
})

app.get('/mock-success', (c) => {
  return c.html(`<!doctype html><meta charset="utf-8" />
  <title>Mock Success</title>
  <body style="font-family:system-ui,-apple-system,Segoe UI,Roboto,sans-serif;margin:2rem">
    <h1>Payment Successful</h1>
    <p>Thanks! Return to <a href="/">home</a>.</p>
  </body>`)
})

export default app;

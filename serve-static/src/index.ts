import { Hono } from "hono";
import { poweredBy } from "hono/powered-by";

const app = new Hono();
// Wrangler/Cloudflare will serve static assets from `assets/` before hitting the Worker.

// Mount Builtin Middleware
app.use("*", poweredBy());

// Routing
app.get("/", (c) => {
  return c.html(`<!doctype html>
  <html lang="en">
    <head>
      <meta charset="utf-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1" />
      <title>Serve Static Assets (Self-contained)</title>
      <style>
        :root{color-scheme:light dark}
        body{font-family:system-ui,-apple-system,Segoe UI,Roboto,sans-serif;margin:2rem;line-height:1.45;max-width:58rem}
        h1{margin:0 0 .5rem}
        .muted{color:#666}
        .row{display:flex;gap:.5rem;flex-wrap:wrap;align-items:center}
        button{font:inherit;padding:.5rem .75rem;border:1px solid #ccc;border-radius:8px;cursor:pointer}
        pre{background:#0a0a0a;color:#f5f5f5;padding:1rem;border-radius:8px;overflow:auto}
        .card{border:1px solid #e5e7eb;border-radius:10px;padding:1rem;margin:1rem 0}
        a{color:inherit}
        code{background:#f6f8fa;color:#111;border:1px solid #e5e7eb;padding:.15rem .35rem;border-radius:4px}
        @media (prefers-color-scheme: dark){
          .card{border-color:#2a2a2a}
          code{background:#111;color:#eaeaea;border-color:#2a2a2a}
          pre{background:#0a0a0a;color:#f5f5f5}
        }
      </style>
    </head>
    <body>
      <h1>Serve Static Assets</h1>
      <p class="muted">One-command, self-contained demo. Static files are served from <code>assets/</code> using Cloudflare Workers' assets binding.</p>

      <section class="card">
        <h2>Quick links</h2>
        <p>
          • <a href="/my-file.txt">/my-file.txt</a><br/>
          • <a href="/folder/nested-file.txt">/folder/nested-file.txt</a>
        </p>
      </section>

      <section class="card">
        <h2>Viewer (no JavaScript)</h2>
        <p>These links load into the viewer below—served directly from <code>assets/</code>:</p>
        <div class="row">
          <a href="/my-file.txt" target="viewer"><button>View /my-file.txt</button></a>
          <a href="/folder/nested-file.txt" target="viewer"><button>View /folder/nested-file.txt</button></a>
          <a href="/missing.txt" target="viewer"><button>View /missing.txt (404)</button></a>
        </div>
        <div style="margin-top:1rem;border:1px solid #e5e7eb;border-radius:10px;overflow:hidden">
          <iframe name="viewer" title="Asset viewer" style="width:100%;height:320px;border:0"></iframe>
        </div>
      </section>

      <section class="card">
        <h2>Docs</h2>
        <p>Hono: <a target="_blank" href="https://hono.dev/docs/getting-started/cloudflare-workers#serve-static-files">Serve static files</a><br/>
        Cloudflare Workers: <a target="_blank" href="https://developers.cloudflare.com/workers/static-assets/binding/#directory">Static assets binding</a></p>
      </section>

      
    </body>
  </html>`)
});

export default app;

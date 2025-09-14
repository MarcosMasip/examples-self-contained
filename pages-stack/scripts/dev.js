#!/usr/bin/env node
/*
  One-command dev for Pages + Vite:
  - Start Vite build in watch mode (outputs to ./pages)
  - After the first successful build, start Wrangler Pages dev serving ./pages
  - Keep both running; rebuilds will be picked up automatically
*/

import { spawn } from 'node:child_process'
import { createInterface } from 'node:readline'
import { setTimeout as sleep } from 'node:timers/promises'

const isWin = process.platform === 'win32'
const PORT = process.env.PORT || '8787'

function run(cmd, args, opts = {}) {
  // Default to piping stdout/stderr so we can read program output.
  const stdio = opts.stdio ?? ['inherit', 'pipe', 'pipe']
  const child = spawn(cmd, args, { stdio, shell: isWin, ...opts })
  if (child.stdout) child.stdout.on('data', (d) => process.stdout.write(d))
  if (child.stderr) child.stderr.on('data', (d) => process.stderr.write(d))
  return child
}

// Start Vite build in watch mode
const vite = run('npm', ['run', 'build:watch'])

let wranglerStarted = false

// Detect first successful build by scanning stdout for Vite completion message
const rl = createInterface({ input: vite.stdout })
rl.on('line', (line) => {
  // Heuristic: look for "built in" which Vite prints after a successful build
  if (!wranglerStarted && /built in/i.test(line)) {
    wranglerStarted = true
    // Start Wrangler Pages dev serving the built directory
    run('npx', ['wrangler', 'pages', 'dev', 'pages', '--compatibility-date=2024-09-19', '--port', PORT], { stdio: 'inherit' })
    // Wait until the server responds, then open the browser to a stable URL
    ;(async () => {
      const url = `http://localhost:${PORT}/`
      const deadline = Date.now() + 20000
      while (Date.now() < deadline) {
        try {
          const res = await fetch(url, { method: 'GET' })
          if (res.ok || res.status === 404) break
        } catch {}
        await sleep(300)
      }
      openBrowser(url)
      console.log(`\nDev server ready → ${url}\n`)
    })()
  }
})

vite.on('exit', (code) => {
  if (code !== 0) {
    console.error(`vite build watch exited with code ${code}`)
    process.exit(code ?? 1)
  }
})

function openBrowser(url) {
  const platform = process.platform
  if (platform === 'darwin') {
    spawn('open', [url], { stdio: 'ignore', detached: true })
    return
    }
  if (platform === 'win32') {
    spawn('cmd', ['/c', 'start', url], { stdio: 'ignore', detached: true })
    return
  }
  // linux and others
  spawn('xdg-open', [url], { stdio: 'ignore', detached: true })
}

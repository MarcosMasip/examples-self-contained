#!/usr/bin/env node
/*
  One-command dev for stytch-auth:
  - Start Vite build in watch mode (outputs to ./assets)
  - After the first successful build, start Wrangler dev for the Worker with assets binding
  - Keep both running; rebuilds are picked up automatically
  - Supports mock auth mode when no Stytch credentials are provided
*/

import { spawn } from 'node:child_process'
import { createInterface } from 'node:readline'
import { setTimeout as sleep } from 'node:timers/promises'

const isWin = process.platform === 'win32'
const PORT = process.env.PORT || '3000'

function run(cmd, args, opts = {}) {
  const stdio = opts.stdio ?? ['inherit', 'pipe', 'pipe']
  const child = spawn(cmd, args, { stdio, shell: isWin, ...opts })
  if (child.stdout) child.stdout.on('data', (d) => process.stdout.write(d))
  if (child.stderr) child.stderr.on('data', (d) => process.stderr.write(d))
  return child
}

// Start Vite build in watch mode
const vite = run('npm', ['run', 'build:watch'])

let wranglerStarted = false
const rl = createInterface({ input: vite.stdout })
rl.on('line', (line) => {
  if (!wranglerStarted && /built in/i.test(line)) {
    wranglerStarted = true
    // Start Wrangler dev; assets binding configured in wrangler.jsonc
    run('npx', ['wrangler', 'dev', 'api/index.ts', '--port', PORT], { stdio: 'inherit' })
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
  spawn('xdg-open', [url], { stdio: 'ignore', detached: true })
}

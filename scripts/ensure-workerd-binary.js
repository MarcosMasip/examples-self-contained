#!/usr/bin/env node
/*
Ensure platform-specific native binary packages are installed for:
- workerd (Cloudflare Workers local runtime)
- rollup (used by Vite/Vitest under the hood)

Why: On some systems, optionalDependencies may be skipped (e.g., CI flags, npm bugs or mirrors),
leading to runtime failures like "@cloudflare/workerd-<platform> could not be found" or
"Cannot find module @rollup/rollup-<platform>".
This script detects required packages from each library's package.json and installs them if missing.
*/

const { execSync } = require('node:child_process')
const path = require('node:path')
const fs = require('node:fs')

function log(msg) { console.log(`[postinstall] ${msg}`) }
function warn(msg) { console.warn(`[postinstall] ${msg}`) }
function err(msg) { console.error(`[postinstall] ${msg}`) }

const root = process.cwd()
function ensurePlatformPackage(pkgDir, packageToPlatform) {
  const pkgPath = path.join(root, 'node_modules', pkgDir, 'package.json')
  if (!fs.existsSync(pkgPath)) {
    log(`${pkgDir} not installed at root; skipping ensure for ${pkgDir}`)
    return
  }
  let pkg
  try {
    pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'))
  } catch (e) {
    warn(`Failed to read ${pkgDir} package.json: ${e.message}`)
    return
  }
  const opt = pkg.optionalDependencies || {}
  const name = packageToPlatform(opt)
  if (!name) return
  const version = opt[name]
  if (!version) {
    log(`No optional version listed for ${name}; skipping`)
    return
  }
  const nodeModulesName = name.replace('@', '').replace('/', '%2f')
  const installedPath = path.join(root, 'node_modules', nodeModulesName)
  if (fs.existsSync(installedPath)) {
    log(`${name} already present`)
    return
  }
  try {
    log(`Installing ${name}@${version} ...`)
    execSync(`npm install ${name}@${version} --no-audit --no-fund`, { stdio: 'inherit' })
    log(`Installed ${name}@${version}`)
  } catch (e) {
    err(`Failed to install ${name}@${version}: ${e.message}`)
  }
}

const isWin = process.platform === 'win32'
const isDarwin = process.platform === 'darwin'
const isLinux = process.platform === 'linux'
const arch = process.arch

// workerd
ensurePlatformPackage('workerd', (opt) => {
  if (isDarwin) return arch === 'arm64' ? '@cloudflare/workerd-darwin-arm64' : '@cloudflare/workerd-darwin-64'
  if (isLinux) return arch === 'arm64' ? '@cloudflare/workerd-linux-arm64' : '@cloudflare/workerd-linux-64'
  if (isWin) return '@cloudflare/workerd-windows-64'
  return null
})

// rollup
ensurePlatformPackage('rollup', (opt) => {
  if (isDarwin) return arch === 'arm64' ? '@rollup/rollup-darwin-arm64' : '@rollup/rollup-darwin-x64'
  if (isLinux) return arch === 'arm64' ? '@rollup/rollup-linux-arm64-gnu' : '@rollup/rollup-linux-x64-gnu'
  if (isWin) return arch === 'arm64' ? '@rollup/rollup-win32-arm64-msvc' : '@rollup/rollup-win32-x64-msvc'
  return null
})

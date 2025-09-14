import { defineWorkersConfig } from '@cloudflare/vitest-pool-workers/config'

export default defineWorkersConfig({
  test: {
    poolOptions: {
      workers: {
        isolatedStorage: false,
        // Use the example Wrangler config for tests to provide bindings like KV
        wrangler: { configPath: './wrangler.example.toml' }
      }
    }
  }
})

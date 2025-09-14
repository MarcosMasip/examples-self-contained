import { describe, expect, test } from 'vitest'
import app from './index'

describe('Durable Objects Counter', () => {
  test('value/increment/decrement JSON API', async () => {
    // Choose a test name
    const name = 'Test'

    // Start with value
    let res = await app.request(`/api/value?name=${encodeURIComponent(name)}`)
    expect(res.status).toBe(200)
  let body: any = await res.json()
    expect(typeof body.count).toBe('number')
    const start = body.count

    // Increment
    res = await app.request(`/api/increment?name=${encodeURIComponent(name)}`, { method: 'POST' })
    expect(res.status).toBe(200)
  body = await res.json()
    expect(body.count).toBe(start + 1)

    // Decrement
    res = await app.request(`/api/decrement?name=${encodeURIComponent(name)}`, { method: 'POST' })
    expect(res.status).toBe(200)
  body = await res.json()
    expect(body.count).toBe(start)
  })

  test('text API requires name', async () => {
    const res = await app.request('/')
    expect(res.status).toBe(200)
    const text = await res.text()
    // Should be the HTML UI (no ?name)
    expect(text).toContain('Durable Objects: Counter')
  })
})

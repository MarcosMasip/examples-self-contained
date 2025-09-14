import type { InferResponseType } from 'hono/client'
import { hc } from 'hono/client'
import { useEffect, useState } from 'react'
import { AppType } from '../functions/api/[[route]]'

const App = () => {
  const client = hc<AppType>('/')
  const $get = client.api.hello.$get

  const [data, setData] = useState<InferResponseType<typeof $get>>()
  const [name, setName] = useState('Pages')

  useEffect(() => {
    const fetchData = async () => {
      const res = await $get({
        query: {
          name: 'Pages',
        },
      })
      const responseData = await res.json()
      setData(responseData)
    }
    fetchData()
  }, [])

  const callApi = async () => {
    const res = await $get({ query: { name } })
    const responseData = await res.json()
    setData(responseData)
  }

  return (
    <div style={{ fontFamily: 'system-ui, -apple-system, Segoe UI, Roboto, sans-serif', padding: '1rem' }}>
      <h1 style={{ margin: 0 }}>{data?.message}</h1>
      <div style={{ marginTop: '1rem', display: 'flex', gap: '.5rem', alignItems: 'center', flexWrap: 'wrap' }}>
        <input
          value={name}
          onChange={(e) => setName((e.target as HTMLInputElement).value)}
          placeholder="Enter a name"
          style={{ padding: '.5rem', borderRadius: 8, border: '1px solid #ccc' }}
        />
        <button type="button" onClick={callApi} style={{ padding: '.5rem .75rem', borderRadius: 8, border: '1px solid #ccc' }}>
          Call API
        </button>
      </div>
    </div>
  )
}

export default App

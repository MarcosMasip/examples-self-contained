import { Consumer } from '@hono/stytch-auth'
import { Hono } from 'hono'
import { todoService } from './TodoService'

type Bindings = { [k: string]: unknown }

const hasStytch = (env: Bindings) => Boolean((env as any).STYTCH_PROJECT_ID && (env as any).STYTCH_PROJECT_SECRET)

const requireAuthLocal = () => async (c: any, next: any) => {
    if (hasStytch(c.env)) return Consumer.authenticateSessionLocal()(c, next)
    return next()
}

const requireAuthRemote = () => async (c: any, next: any) => {
    if (hasStytch(c.env)) return Consumer.authenticateSessionRemote()(c, next)
    return next()
}

const getUserId = (c: any) => {
    if (hasStytch(c.env)) {
        const { user_id } = Consumer.getStytchSession(c)
        return user_id
    }
    return c.req.header('x-mock-user') || 'mock-user'
}

/**
 * The Hono app exposes the TODO Service via REST endpoints for consumption by the frontend
 */
export const TodoAPI = new Hono<{ Bindings: Bindings }>()
    // We want Reads to be fast, so we can authenticate the Stytch session JWT locally
    .get('/todos', requireAuthLocal(), async (c) => {
        const user_id = getUserId(c)
        const todos = await todoService(c.env as any, user_id).get()
        return c.json({ todos })
    })
    // The Session JWT is a cached value and can be stale. For more dangerous operations like writes
    // we can check against the Stytch servers for the most up-to-date information
    .post('/todos', requireAuthRemote(), async (c) => {
        const newTodo = await c.req.json<{ todoText: string }>()
        const user_id = getUserId(c)
        const todos = await todoService(c.env as any, user_id).add(newTodo.todoText)
        return c.json({ todos })
    })
    .post('/todos/:id/complete', requireAuthRemote(), async (c) => {
        const user_id = getUserId(c)
        const todos = await todoService(c.env as any, user_id).markCompleted(c.req.param().id)
        return c.json({ todos })
    })
    .delete('/todos/:id', requireAuthRemote(), async (c) => {
        const user_id = getUserId(c)
        const todos = await todoService(c.env as any, user_id).delete(c.req.param().id)
        return c.json({ todos })
    })

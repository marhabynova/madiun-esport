import { registerEventAdapter } from './emitter'

const connections = new Map<string, ReadableStreamDefaultController>()

function makeId() {
    return Math.random().toString(36).slice(2, 9)
}

export function connect() {
    // controllerRef intentionally unused; keep local controller via closure
    const id = makeId()

    const stream = new ReadableStream({
        start(controller) {
            connections.set(id, controller)
            try {
                const payload = { id }
                // send both named and default message for compatibility
                controller.enqueue(`event: connected\ndata: ${JSON.stringify(payload)}\n\n`)
                controller.enqueue(`data: ${JSON.stringify({ type: 'connected', ...payload })}\n\n`)
            } catch {
                // ignore
            }
        },
        cancel() {
            connections.delete(id)
        },
    })

    const close = () => {
        const c = connections.get(id)
        if (c) {
            try {
                c.close()
            } catch {
                // ignore
            }
        }
        connections.delete(id)
    }

    return { id, stream, close }
}

export function emitSSE(event: string, payload?: Record<string, unknown> | undefined) {
    const named = `event: ${event}\ndata: ${JSON.stringify(payload)}\n\n`
    // Also enqueue a default message event containing the type in the payload so
    // clients that only listen to `onmessage` (default message) receive the
    // notification. This keeps backward compatibility with consumers.
    const defaultPayload: Record<string, unknown> = Object.assign({ type: event }, payload || {})
    const message = `data: ${JSON.stringify(defaultPayload)}\n\n`

    for (const [, controller] of connections) {
        try {
            // send named event
            controller.enqueue(named)
        } catch {
            // swallow per-connection errors and continue
        }
        try {
            // send default message with `type` included
            controller.enqueue(message)
        } catch {
            // swallow per-connection errors and continue
        }
    }
}

// provide a periodic keep-alive
setInterval(() => {
    for (const [, controller] of connections) {
        try {
            controller.enqueue(':keep-alive\n\n')
        } catch {
            // ignore
        }
    }
}, 15_000)

// register as an event adapter so emitEvent will fan-out to SSE clients
registerEventAdapter({
    emit: (event: string, payload?: unknown) => {
        // coerce payload to record when emitting via SSE
        const p = (payload && typeof payload === 'object') ? (payload as Record<string, unknown>) : undefined
        emitSSE(event, p)
    },
})

const sse = { connect, emitSSE }
export default sse

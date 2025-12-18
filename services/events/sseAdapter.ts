import { registerEventAdapter } from './emitter'

const connections = new Map<string, ReadableStreamDefaultController>()

function makeId() {
    return Math.random().toString(36).slice(2, 9)
}

export function connect() {
    let controllerRef: ReadableStreamDefaultController | null = null
    const id = makeId()

    const stream = new ReadableStream({
        start(controller) {
            controllerRef = controller
            connections.set(id, controller)
            try {
                controller.enqueue(`event: connected\ndata: ${JSON.stringify({ id })}\n\n`)
            } catch (e) {
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
            } catch (e) {
                // ignore
            }
        }
        connections.delete(id)
    }

    return { id, stream, close }
}

export function emitSSE(event: string, payload?: any) {
    const data = `event: ${event}\ndata: ${JSON.stringify(payload)}\n\n`
    for (const [, controller] of connections) {
        try {
            controller.enqueue(data)
        } catch (e) {
            // swallow per-connection errors and continue
        }
    }
}

// provide a periodic keep-alive
setInterval(() => {
    for (const [, controller] of connections) {
        try {
            controller.enqueue(':keep-alive\n\n')
        } catch (e) {
            // ignore
        }
    }
}, 15_000)

// register as an event adapter so emitEvent will fan-out to SSE clients
registerEventAdapter({
    emit: (event: string, payload?: any) => {
        emitSSE(event, payload)
    },
})

export default { connect, emitSSE }

type EventAdapter = {
    emit: (event: string, payload?: any) => Promise<void> | void
}

const adapters: EventAdapter[] = []

export function registerEventAdapter(adapter: EventAdapter) {
    adapters.push(adapter)
}

export async function emitEvent(event: string, payload?: any) {
    for (const adapter of adapters) {
        try {
            await Promise.resolve(adapter.emit(event, payload))
        } catch (err) {
            // adapter errors should not bubble to domain logic
            // log and continue with other adapters
            // use console here to avoid introducing logging deps
            // eslint-disable-next-line no-console
            console.error('[events] adapter error', err)
        }
    }
}

// default adapter: console logger
registerEventAdapter({
    emit: (event: string, payload?: any) => {
        // eslint-disable-next-line no-console
        console.info('[event]', event, payload)
    },
})

export default { registerEventAdapter, emitEvent }

"use client"
import { useEffect, useRef, useState } from 'react'

type MessageHandler = (data: unknown) => void

export default function useSSE(path: string, onMessage?: MessageHandler) {
    const [connected, setConnected] = useState(false)
    const evtSourceRef = useRef<EventSource | null>(null)
    const [source, setSource] = useState<EventSource | null>(null)

    useEffect(() => {
        if (!path) return
        const url = path
        const es = new EventSource(url)
        evtSourceRef.current = es
        // update state asynchronously to avoid sync state updates inside effect
        Promise.resolve().then(() => {
            setSource(es)
            setConnected(true)
        })

        es.onmessage = (ev: MessageEvent) => {
            try {
                const data = JSON.parse(ev.data)
                onMessage?.(data)
            } catch {
                onMessage?.(ev.data)
            }
        }

        es.onerror = () => {
            setConnected(false)
            es.close()
        }

        return () => {
            es.close()
            setConnected(false)
            setSource(null)
        }
    }, [path, onMessage])

    return { connected, source }
}

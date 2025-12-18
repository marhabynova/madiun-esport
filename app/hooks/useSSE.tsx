"use client"
import { useEffect, useRef, useState } from 'react'

type MessageHandler = (data: any) => void

export default function useSSE(path: string, onMessage?: MessageHandler) {
    const [connected, setConnected] = useState(false)
    const evtSourceRef = useRef<EventSource | null>(null)

    useEffect(() => {
        if (!path) return
        const url = path
        const es = new EventSource(url)
        evtSourceRef.current = es
        setConnected(true)

        es.onmessage = (ev) => {
            try {
                const data = JSON.parse(ev.data)
                onMessage?.(data)
            } catch (e) {
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
        }
    }, [path])

    return { connected, source: evtSourceRef.current }
}

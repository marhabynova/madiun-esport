import React from 'react'

type Props = {
    isLoading?: boolean
    isError?: string | boolean
    items?: any[] | null
    emptyMessage?: string
    children?: React.ReactNode
}

export default function ListStates({
    isLoading,
    isError,
    items,
    emptyMessage = 'No items',
    children,
}: Props) {
    if (isLoading) {
        return <div className="p-4 text-center">Loading…</div>
    }

    if (isError) {
        const msg = typeof isError === 'string' ? isError : 'An error occurred'
        return <div className="p-4 text-center text-red-600">Error: {msg}</div>
    }

    if (!items || items.length === 0) {
        return <div className="p-4 text-center text-gray-500">{emptyMessage}</div>
    }

    return <>{children}</>
}

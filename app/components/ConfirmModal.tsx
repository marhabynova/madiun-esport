"use client"
import React from 'react'

export default function ConfirmModal({ open, title, message, onConfirm, onCancel }: {
    open: boolean
    title?: string
    message: string
    onConfirm: () => void
    onCancel: () => void
}) {
    if (!open) return null
    return (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded shadow max-w-md w-full">
                {title && <h3 className="text-lg font-semibold">{title}</h3>}
                <p className="mt-3 text-sm text-gray-700">{message}</p>
                <div className="mt-4 flex justify-end gap-2">
                    <button className="px-3 py-1 rounded" onClick={onCancel}>Cancel</button>
                    <button className="px-3 py-1 bg-red-600 text-white rounded" onClick={onConfirm}>Confirm</button>
                </div>
            </div>
        </div>
    )
}

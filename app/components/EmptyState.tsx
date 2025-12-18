import React from "react";

export default function EmptyState({ message = "No data", icon = null }) {
    return (
        <div className="flex flex-col items-center justify-center py-12 text-zinc-500">
            {icon && <div className="mb-4">{icon}</div>}
            <div className="text-lg font-medium">{message}</div>
        </div>
    );
}

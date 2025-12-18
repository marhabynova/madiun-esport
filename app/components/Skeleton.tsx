import React from "react";

export default function Skeleton({ className = "", style = {}, ...props }) {
    return (
        <div
            className={
                "animate-pulse bg-neutral-100 dark:bg-neutral-700 rounded " + className
            }
            style={{ minHeight: 16, ...style }}
            {...props}
        />
    );
}

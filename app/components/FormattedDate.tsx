'use client';

import { useEffect, useState } from 'react';

export default function FormattedDate({ timestamp, label }: { timestamp: number, label?: string }) {
    const [formatted, setFormatted] = useState<string>('');

    useEffect(() => {
        // Render on client to get local timezone
        setFormatted(new Date(timestamp).toLocaleString());
    }, [timestamp]);

    if (!formatted) return <span className="opacity-0">Loading...</span>; // Prevent hydration mismatch

    return (
        <span>
            {label && `${label}: `}{formatted}
        </span>
    );
}

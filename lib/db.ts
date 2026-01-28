import { createClient } from 'redis';

export interface Paste {
    id: string;
    content: string;
    views: number;
    max_views: number | null; // null if unlimited
    expires_at: number | null; // null if no expiry
    created_at: number;
}

export type CreatePasteDTO = {
    content: string;
    ttl_seconds?: number;
    max_views?: number;
};

// Singleton client handling for Serverless/Next.js hot-reload
let client: ReturnType<typeof createClient>;

function getClient() {
    if (!client) {
        client = createClient({
            url: process.env.REDIS_URL,
        });
        client.on('error', (err) => console.error('Redis Client Error', err));
    }
    return client;
}

async function connectIfNeeded() {
    const c = getClient();
    if (!c.isOpen) {
        await c.connect();
    }
    return c;
}

// Generate a random ID (simple alphanumeric)
function generateId(length = 8): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < length; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
}

export const db = {
    // Expose the raw client getter for health checks
    getClient: () => getClient(),

    async createPaste(data: CreatePasteDTO): Promise<{ id: string }> {
        const c = await connectIfNeeded();
        const id = generateId();
        const now = Date.now();

        const pasteData = {
            content: data.content,
            views: '0', // Redis stores strings
            max_views: (data.max_views ?? -1).toString(),
            expires_at: (data.ttl_seconds ? now + data.ttl_seconds * 1000 : -1).toString(),
            created_at: now.toString(),
        };

        // Store in Redis
        await c.hSet(`paste:${id}`, pasteData);

        // Set expiry for GC if needed
        if (data.ttl_seconds) {
            await c.expire(`paste:${id}`, data.ttl_seconds + 86400);
        }

        return { id };
    },

    async getPaste(id: string, simulatedTimeMs?: number): Promise<Paste | null> {
        const c = await connectIfNeeded();
        const key = `paste:${id}`;
        const now = simulatedTimeMs ?? Date.now();

        // 1. Fetch
        const data = await c.hGetAll(key);
        // hGetAll returns prototype-less object. Check if it has keys.
        if (!data || Object.keys(data).length === 0) return null;

        const expiresAt = parseInt(data.expires_at, 10);
        const maxViews = parseInt(data.max_views, 10);
        let currentViews = parseInt(data.views, 10);

        // 2. Availability Check (Pre-Increment)

        // Time Check
        if (expiresAt !== -1 && now > expiresAt) {
            return null; // Expired
        }

        // View Limit Check
        if (maxViews !== -1 && currentViews >= maxViews) {
            return null; // View limit reached
        }

        // 3. Atomic Increment
        const newViews = await c.hIncrBy(key, 'views', 1);

        // 4. Concurrency Safety Check
        if (maxViews !== -1 && newViews > maxViews) {
            // Exceeded limit
            return null;
        }

        // 5. Success
        return {
            id,
            content: data.content,
            views: newViews,
            max_views: maxViews === -1 ? null : maxViews,
            expires_at: expiresAt === -1 ? null : expiresAt,
            created_at: parseInt(data.created_at, 10),
        };
    }
};

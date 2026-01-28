import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { content, ttl_seconds, max_views } = body;

        // Manual validation to remove zod dependency
        if (!content || typeof content !== 'string' || content.length === 0) {
            return NextResponse.json({ error: 'Invalid input: content is required' }, { status: 400 });
        }
        if (ttl_seconds !== undefined && (!Number.isInteger(ttl_seconds) || ttl_seconds < 1)) {
            return NextResponse.json({ error: 'Invalid input: ttl_seconds must be a positive integer' }, { status: 400 });
        }
        if (max_views !== undefined && (!Number.isInteger(max_views) || max_views < 1)) {
            return NextResponse.json({ error: 'Invalid input: max_views must be a positive integer' }, { status: 400 });
        }
        const { id } = await db.createPaste({ content, ttl_seconds, max_views });

        // Construct absolute URL (using request origin if available, or fallbacks)
        const origin = req.nextUrl.origin;
        const url = `${origin}/p/${id}`;

        return NextResponse.json({ id, url }, { status: 201 });
    } catch (error) {
        console.error('Create paste failed:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

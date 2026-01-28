import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> } // Params is a Promise in Next.js 15+ (if using latest, which we are)
) {
    try {
        const { id } = await params;

        // Check for simulated time header
        const testTimeHeader = req.headers.get('x-test-now-ms');
        const simulatedTime = testTimeHeader ? parseInt(testTimeHeader, 10) : undefined;
        if (testTimeHeader && isNaN(simulatedTime!)) {
            return NextResponse.json({ error: 'Invalid x-test-now-ms header' }, { status: 400 });
        }

        const paste = await db.getPaste(id, simulatedTime);

        if (!paste) {
            return NextResponse.json({ error: 'Paste not found or unavailable' }, { status: 404 });
        }

        return NextResponse.json({
            content: paste.content,
            remaining_views: paste.max_views !== null ? Math.max(0, paste.max_views - paste.views) : null,
            expires_at: paste.expires_at !== null ? new Date(paste.expires_at).toISOString() : null,
        });
    } catch (error) {
        console.error('Get paste failed:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

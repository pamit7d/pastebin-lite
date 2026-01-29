import { notFound } from 'next/navigation';
import { db } from '@/lib/db';
import { headers } from 'next/headers';
import FormattedDate from '@/app/components/FormattedDate';

export default async function PastePage({
    params,
}: {
    params: Promise<{ id: string }>;
}) {
    const { id } = await params;

    // Extract test time header if present to ensure deterministic testing matches API behavior
    // Only accepted if TEST_MODE=1 is set in environment
    const headersList = await headers();
    let simulatedTime: number | undefined;

    if (process.env.TEST_MODE === '1') {
        const testTimeHeader = headersList.get('x-test-now-ms');
        if (testTimeHeader) {
            simulatedTime = parseInt(testTimeHeader, 10);
        }
    }

    const paste = await db.getPaste(id, simulatedTime);

    if (!paste) {
        notFound();
    }

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-3xl w-full space-y-8">
                <div className="bg-white shadow rounded-lg overflow-hidden border border-gray-200">
                    <div className="px-4 py-5 sm:px-6 bg-gray-50 border-b border-gray-200 flex justify-between items-center">
                        <h1 className="text-lg leading-6 font-medium text-gray-900">
                            Paste ID: <span className="font-mono text-indigo-600 select-all">{paste.id}</span>
                        </h1>
                        <div className="flex space-x-4 text-xs text-gray-500">
                            {paste.expires_at ? (
                                <FormattedDate timestamp={paste.expires_at} label="Expires" />
                            ) : (
                                <span className="text-green-600">Never Expires</span>
                            )}
                            <span>•</span>
                            <FormattedDate timestamp={paste.created_at} label="Created" />
                        </div>
                    </div>
                    <div className="px-4 py-5 sm:p-6 bg-white">
                        <pre className="whitespace-pre-wrap break-words font-mono text-sm text-gray-900 bg-gray-50 p-4 rounded-md border border-gray-200 overflow-x-auto min-h-[100px]">
                            {paste.content}
                        </pre>
                    </div>
                    {paste.max_views !== null && (
                        <div className="px-4 py-4 sm:px-6 bg-gray-50 border-t border-gray-200 flex justify-end">
                            <p className="text-xs font-medium text-gray-500 bg-gray-200 px-2 py-1 rounded">
                                Views: {paste.views} / {paste.max_views}
                            </p>
                        </div>
                    )}
                </div>
                <div className="text-center">
                    <a href="/" className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
                        Create New Paste
                    </a>
                </div>
            </div>
        </div>
    );
}

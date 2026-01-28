import Link from 'next/link';

export default function NotFound() {
    return (
        <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-md w-full text-center space-y-8">
                <div>
                    <h1 className="text-9xl font-extrabold text-indigo-600">404</h1>
                    <h2 className="mt-6 text-3xl font-bold text-gray-900 tracking-tight">
                        Paste Unavailable
                    </h2>
                    <p className="mt-2 text-base text-gray-500">
                        The paste you are looking for is not accessible.
                    </p>
                    <div className="mt-4 bg-yellow-50 border-l-4 border-yellow-400 p-4 text-left">
                        <p className="text-sm text-yellow-700">
                            <strong>Possible reasons:</strong>
                        </p>
                        <ul className="list-disc ml-5 mt-2 text-sm text-yellow-700 space-y-1">
                            <li>The paste ID is incorrect.</li>
                            <li>The paste has <strong>expired</strong> (Time-to-Live reached).</li>
                            <li>The paste has reached its <strong>view limit</strong>.</li>
                        </ul>
                    </div>
                </div>
                <div className="mt-6">
                    <Link
                        href="/"
                        className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                    >
                        Go back home
                    </Link>
                </div>
            </div>
        </div>
    );
}

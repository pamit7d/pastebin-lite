'use client';

import { useState } from 'react';

export default function Home() {
  const [content, setContent] = useState('');
  const [ttl, setTtl] = useState('');
  const [maxViews, setMaxViews] = useState('');
  const [createdUrl, setCreatedUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setCreatedUrl(null);

    try {
      const payload: any = { content };
      if (ttl) payload.ttl_seconds = parseInt(ttl, 10);
      if (maxViews) payload.max_views = parseInt(maxViews, 10);

      const res = await fetch('/api/pastes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to create paste');
      }

      setCreatedUrl(data.url);
      setContent('');
      setTtl('');
      setMaxViews('');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-xl w-full space-y-8">
        <div>
          <h1 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Pastebin-Lite
          </h1>
          <p className="mt-2 text-center text-sm text-gray-600">
            Create a text paste with optional expiration and view limits.
          </p>
        </div>

        <div className="bg-white py-8 px-4 shadow rounded-lg sm:px-10 border border-gray-200">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="content" className="block text-sm font-medium text-gray-700">
                Paste Content <span className="text-red-500">*</span>
              </label>
              <div className="mt-1">
                <textarea
                  id="content"
                  name="content"
                  required
                  rows={8}
                  className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm text-gray-900 bg-white"
                  placeholder="Enter your text here..."
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-2">
              <div>
                <label htmlFor="ttl" className="block text-sm font-medium text-gray-700">
                  TTL (seconds)
                </label>
                <div className="mt-1">
                  <input
                    id="ttl"
                    name="ttl"
                    type="number"
                    min="1"
                    className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm text-gray-900 bg-white"
                    placeholder="e.g. 60"
                    value={ttl}
                    onChange={(e) => setTtl(e.target.value)}
                  />
                </div>
                <p className="mt-1 text-xs text-gray-500">Optional: Expire after time</p>
              </div>

              <div>
                <label htmlFor="maxViews" className="block text-sm font-medium text-gray-700">
                  Max Views
                </label>
                <div className="mt-1">
                  <input
                    id="maxViews"
                    name="maxViews"
                    type="number"
                    min="1"
                    className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm text-gray-900 bg-white"
                    placeholder="e.g. 5"
                    value={maxViews}
                    onChange={(e) => setMaxViews(e.target.value)}
                  />
                </div>
                <p className="mt-1 text-xs text-gray-500">Optional: Expire after views</p>
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={loading}
                className={`w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors ${loading ? 'opacity-75 cursor-not-allowed' : ''}`}
              >
                {loading ? 'Creating Paste...' : 'Create Paste'}
              </button>
            </div>
          </form>

          {error && (
            <div className="mt-6 bg-red-50 border-l-4 border-red-400 p-4">
              <div className="flex">
                <div className="ml-3">
                  <p className="text-sm text-red-700">
                    {error}
                  </p>
                </div>
              </div>
            </div>
          )}

          {createdUrl && (
            <div className="mt-6 bg-green-50 border border-green-200 rounded-md p-4">
              <div className="flex">
                <div className="ml-3 w-full">
                  <h3 className="text-sm font-medium text-green-800">
                    Paste created successfully!
                  </h3>
                  <div className="mt-2 text-sm text-green-700">
                    <p className="break-all">
                      <a
                        href={createdUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="font-medium underline hover:text-green-600"
                      >
                        {createdUrl}
                      </a>
                    </p>
                  </div>
                  <div className="mt-4">
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(createdUrl);
                        alert('Copied to clipboard!');
                      }}
                      className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded border border-green-300 hover:bg-green-200"
                    >
                      Copy URL
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

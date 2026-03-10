'use client';

import { useEffect, useState } from 'react';

interface QueryItem {
  query: string;
  normalized: string;
  count: number;
}

interface QueriesData {
  queries: QueryItem[];
  page: number;
  pageSize: number;
  total: number;
}

export default function QueriesPage() {
  const [data, setData] = useState<QueriesData | null>(null);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    setLoading(true);
    fetch(`/api/echoatlas/queries?page=${page}&pageSize=20`)
      .then(async (r) => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        return r.json();
      })
      .then(setData)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [page]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Queries</h1>
        <p className="mt-1 text-sm text-zinc-400">Most common queries from AI agents</p>
      </div>

      {error && (
        <div className="rounded-xl border border-red-500/20 bg-red-500/5 p-4 text-red-400">{error}</div>
      )}

      {loading ? (
        <div className="flex justify-center py-16">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-zinc-600 border-t-cyan-400" />
        </div>
      ) : data?.queries ? (
        <>
          <div className="overflow-x-auto rounded-xl border border-zinc-800">
            <table className="w-full text-left">
              <thead className="border-b border-zinc-800 bg-zinc-900/50">
                <tr>
                  <th className="px-4 py-3 text-sm font-medium text-zinc-400">Query</th>
                  <th className="px-4 py-3 text-sm font-medium text-zinc-400">Normalized</th>
                  <th className="px-4 py-3 text-sm font-medium text-zinc-400 text-right">Count</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800">
                {data.queries.map((q, i) => (
                  <tr key={i} className="hover:bg-zinc-900/50 transition-colors">
                    <td className="px-4 py-3 text-sm text-zinc-200 max-w-xs truncate" title={q.query}>{q.query || '(empty)'}</td>
                    <td className="px-4 py-3 text-sm text-zinc-400 max-w-xs truncate" title={q.normalized}>{q.normalized || '—'}</td>
                    <td className="px-4 py-3 text-sm text-zinc-300 text-right">{q.count.toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="flex items-center justify-between">
            <p className="text-sm text-zinc-500">
              Page {data.page} {data.total ? `of ${Math.ceil(data.total / data.pageSize)}` : ''}
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page <= 1}
                className="rounded-lg border border-zinc-700 px-3 py-1.5 text-sm text-zinc-300 hover:bg-zinc-800 disabled:opacity-30 transition-colors"
              >
                Previous
              </button>
              <button
                onClick={() => setPage((p) => p + 1)}
                disabled={data.queries.length < (data.pageSize || 20)}
                className="rounded-lg border border-zinc-700 px-3 py-1.5 text-sm text-zinc-300 hover:bg-zinc-800 disabled:opacity-30 transition-colors"
              >
                Next
              </button>
            </div>
          </div>
        </>
      ) : (
        <p className="text-zinc-500">No query data available.</p>
      )}
    </div>
  );
}

'use client';

import { useEffect, useState, useCallback } from 'react';

interface UndergroundEvent {
  id: string;
  type: string;
  createdAt: string;
  payload: Record<string, unknown> | null;
  requestLogId: string | null;
}

interface EventsData {
  from: string;
  to: string;
  type: string | null;
  count: number;
  events: UndergroundEvent[];
}

const EVENT_TYPES = [
  { value: '', label: 'All types' },
  { value: 'honeypot_hit', label: 'Honeypot Hit' },
  { value: 'trap_phrase_reuse', label: 'Trap Phrase Reuse' },
  { value: 'trap_query_served', label: 'Trap Query Served' },
  { value: 'behavior_outlier', label: 'Behavior Outlier' },
];

const TYPE_COLORS: Record<string, string> = {
  honeypot_hit: 'bg-red-500/10 text-red-400 border-red-500/20',
  trap_phrase_reuse: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
  trap_query_served: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
  behavior_outlier: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
};

export default function UndergroundPage() {
  const [data, setData] = useState<EventsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [days, setDays] = useState(7);

  const fetchEvents = useCallback(() => {
    setLoading(true);
    setError('');
    const from = new Date(Date.now() - days * 86400000).toISOString();
    const to = new Date().toISOString();
    const params = new URLSearchParams({ from, to, limit: '200' });
    if (typeFilter) params.set('type', typeFilter);

    fetch(`/api/echoatlas/underground/events?${params}`)
      .then(async (r) => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        return r.json();
      })
      .then(setData)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [days, typeFilter]);

  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Underground Events</h1>
        <p className="mt-1 text-sm text-zinc-400">
          Honeypot hits, trap phrases, and behavioral anomalies detected by EchoAtlas
        </p>
      </div>

      <div className="flex flex-wrap gap-3">
        <select
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value)}
          className="rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm text-zinc-200 focus:border-cyan-500 focus:outline-none"
        >
          {EVENT_TYPES.map((t) => (
            <option key={t.value} value={t.value}>{t.label}</option>
          ))}
        </select>
        <select
          value={days}
          onChange={(e) => setDays(Number(e.target.value))}
          className="rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm text-zinc-200 focus:border-cyan-500 focus:outline-none"
        >
          <option value={1}>Last 24 hours</option>
          <option value={7}>Last 7 days</option>
          <option value={14}>Last 14 days</option>
          <option value={30}>Last 30 days</option>
        </select>
        <button
          onClick={fetchEvents}
          className="rounded-lg border border-zinc-700 px-3 py-2 text-sm text-zinc-300 hover:bg-zinc-800 transition-colors"
        >
          Refresh
        </button>
      </div>

      {error && (
        <div className="rounded-xl border border-red-500/20 bg-red-500/5 p-4 text-red-400">{error}</div>
      )}

      {loading ? (
        <div className="flex justify-center py-16">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-zinc-600 border-t-cyan-400" />
        </div>
      ) : data?.events && data.events.length > 0 ? (
        <div className="space-y-3">
          <p className="text-sm text-zinc-500">{data.count} event{data.count !== 1 ? 's' : ''} found</p>
          {data.events.map((event) => (
            <div
              key={event.id}
              className="rounded-xl border border-zinc-800 bg-zinc-900 p-4 space-y-2"
            >
              <div className="flex items-center justify-between">
                <span
                  className={`inline-block rounded-md border px-2 py-0.5 text-xs font-medium ${TYPE_COLORS[event.type] || 'bg-zinc-800 text-zinc-300 border-zinc-700'}`}
                >
                  {event.type.replace(/_/g, ' ')}
                </span>
                <span className="text-xs text-zinc-500">
                  {new Date(event.createdAt).toLocaleString()}
                </span>
              </div>
              {event.payload && Object.keys(event.payload).length > 0 && (
                <pre className="mt-2 overflow-x-auto rounded-lg bg-zinc-950 p-3 text-xs text-zinc-400 font-mono">
                  {JSON.stringify(event.payload, null, 2)}
                </pre>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-8 text-center">
          <p className="text-zinc-400">No underground events found for the selected period.</p>
        </div>
      )}
    </div>
  );
}

'use client';

import { useEffect, useState } from 'react';

interface Metrics {
  total: number;
  uniqueAgents: number;
  uniqueIps: number;
  uniqueSessions: number;
  byDay: { date: string; count: number }[];
  topAgents: { agentName: string; count: number }[];
  topQueries: { query: string; normalized: string; count: number }[];
  topSourceDomains: { domain: string; count: number }[];
  avgAutomationScore: number;
  avgComplianceScore: number;
  avgPolitenessScore: number;
  zeroResultRate: number;
  [key: string]: unknown;
}

function StatCard({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-5">
      <p className="text-sm text-zinc-400">{label}</p>
      <p className="mt-1 text-2xl font-bold text-white">{typeof value === 'number' ? value.toLocaleString() : value}</p>
    </div>
  );
}

function MiniBar({ data, max }: { data: { label: string; value: number }[]; max: number }) {
  return (
    <div className="space-y-2">
      {data.map((d) => (
        <div key={d.label} className="flex items-center gap-3">
          <span className="w-40 truncate text-sm text-zinc-300" title={d.label}>{d.label}</span>
          <div className="flex-1 h-5 rounded bg-zinc-800 overflow-hidden">
            <div
              className="h-full rounded bg-cyan-600"
              style={{ width: `${max > 0 ? (d.value / max) * 100 : 0}%` }}
            />
          </div>
          <span className="w-12 text-right text-sm text-zinc-400">{d.value}</span>
        </div>
      ))}
    </div>
  );
}

export default function DashboardPage() {
  const [metrics, setMetrics] = useState<Metrics | null>(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/echoatlas/metrics')
      .then(async (r) => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        return r.json();
      })
      .then(setMetrics)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-32">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-zinc-600 border-t-cyan-400" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-xl border border-red-500/20 bg-red-500/5 p-6 text-center">
        <p className="text-red-400">Failed to load metrics: {error}</p>
        <p className="mt-2 text-sm text-zinc-500">
          Make sure ECHOATLAS_API_KEY and ECHOATLAS_BASE_URL are configured.
        </p>
      </div>
    );
  }

  if (!metrics) return null;

  const topAgentsData = (metrics.topAgents || []).slice(0, 8).map((a) => ({
    label: a.agentName || 'Unknown',
    value: a.count,
  }));
  const agentsMax = topAgentsData.length > 0 ? topAgentsData[0].value : 1;

  const topQueriesData = (metrics.topQueries || []).slice(0, 8).map((q) => ({
    label: q.query || '(empty)',
    value: q.count,
  }));
  const queriesMax = topQueriesData.length > 0 ? topQueriesData[0].value : 1;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-white">Observatory Overview</h1>
        <p className="mt-1 text-sm text-zinc-400">EchoAtlas agent monitoring data</p>
      </div>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <StatCard label="Total Requests" value={metrics.total ?? 0} />
        <StatCard label="Unique Agents" value={metrics.uniqueAgents ?? 0} />
        <StatCard label="Unique IPs" value={metrics.uniqueIps ?? 0} />
        <StatCard label="Sessions" value={metrics.uniqueSessions ?? 0} />
      </div>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <StatCard label="Automation Score" value={`${((metrics.avgAutomationScore ?? 0) * 100).toFixed(0)}%`} />
        <StatCard label="Compliance Score" value={`${((metrics.avgComplianceScore ?? 0) * 100).toFixed(0)}%`} />
        <StatCard label="Politeness Score" value={`${((metrics.avgPolitenessScore ?? 0) * 100).toFixed(0)}%`} />
        <StatCard label="Zero-Result Rate" value={`${((metrics.zeroResultRate ?? 0) * 100).toFixed(1)}%`} />
      </div>

      {metrics.byDay && metrics.byDay.length > 0 && (
        <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-5">
          <h2 className="mb-4 text-lg font-semibold text-white">Requests by Day</h2>
          <div className="flex items-end gap-1 h-40">
            {metrics.byDay.map((d) => {
              const maxDay = Math.max(...metrics.byDay.map((x) => x.count), 1);
              const pct = (d.count / maxDay) * 100;
              return (
                <div key={d.date} className="flex-1 flex flex-col items-center gap-1" title={`${d.date}: ${d.count}`}>
                  <div
                    className="w-full rounded-t bg-cyan-600 min-h-[2px] transition-all"
                    style={{ height: `${pct}%` }}
                  />
                  <span className="text-[10px] text-zinc-500 rotate-[-45deg] origin-top-left whitespace-nowrap">
                    {d.date.slice(5)}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {topAgentsData.length > 0 && (
          <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-5">
            <h2 className="mb-4 text-lg font-semibold text-white">Top Agents</h2>
            <MiniBar data={topAgentsData} max={agentsMax} />
          </div>
        )}
        {topQueriesData.length > 0 && (
          <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-5">
            <h2 className="mb-4 text-lg font-semibold text-white">Top Queries</h2>
            <MiniBar data={topQueriesData} max={queriesMax} />
          </div>
        )}
      </div>
    </div>
  );
}

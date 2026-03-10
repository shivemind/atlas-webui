"use client";

import { useState, useCallback } from "react";
import { ExternalLink, Play, CheckCircle2, XCircle, Loader2 } from "lucide-react";

type EntityStat = { label: string; count: number };

export function EstateWorkspaceCard({
  name,
  description,
  color,
  ops,
  workspaceId,
  collectionUid,
  entityStats,
  baseUrl,
}: {
  name: string;
  description: string;
  color: string;
  ops: number;
  workspaceId: string;
  collectionUid: string;
  entityStats: EntityStat[];
  baseUrl: string;
}) {
  const [health, setHealth] = useState<"idle" | "checking" | "healthy" | "unhealthy">("idle");

  const checkHealth = useCallback(async () => {
    setHealth("checking");
    try {
      const res = await fetch(`${baseUrl}/api/health`, { cache: "no-store" });
      setHealth(res.ok ? "healthy" : "unhealthy");
    } catch {
      setHealth("unhealthy");
    }
  }, [baseUrl]);

  const totalRecords = entityStats.reduce((s, e) => s + e.count, 0);

  return (
    <div className="group rounded-xl border border-card-border bg-card-bg shadow-sm transition-shadow hover:shadow-md">
      <div className="border-b border-card-border p-5">
        <div className="mb-2 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <span
              className="inline-block h-3.5 w-3.5 rounded-full ring-2 ring-white/20"
              style={{ backgroundColor: color }}
            />
            <h3 className="text-sm font-semibold">{name}</h3>
          </div>
          <div className="flex items-center gap-2">
            {health === "idle" && (
              <button
                onClick={checkHealth}
                className="rounded-md px-2 py-1 text-xs text-muted hover:bg-muted-bg transition-colors"
              >
                Check
              </button>
            )}
            {health === "checking" && <Loader2 className="h-4 w-4 animate-spin text-muted" />}
            {health === "healthy" && <CheckCircle2 className="h-4 w-4 text-emerald-500" />}
            {health === "unhealthy" && <XCircle className="h-4 w-4 text-red-500" />}
            <span className="rounded-full px-2.5 py-0.5 text-xs font-bold tabular-nums" style={{ backgroundColor: `${color}15`, color }}>
              {ops} endpoints
            </span>
          </div>
        </div>
        <p className="text-xs text-muted leading-relaxed">{description}</p>
      </div>

      <div className="px-5 py-3">
        <div className="mb-2 flex items-center justify-between">
          <span className="text-xs font-medium text-muted">Live Data</span>
          <span className="text-xs font-semibold tabular-nums">{totalRecords.toLocaleString()} records</span>
        </div>
        <div className="grid grid-cols-2 gap-x-4 gap-y-1.5">
          {entityStats.map((e) => (
            <div key={e.label} className="flex items-center justify-between">
              <span className="text-xs text-muted">{e.label}</span>
              <span className="text-xs font-semibold tabular-nums">{e.count.toLocaleString()}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="flex items-center gap-2 border-t border-card-border px-5 py-3">
        <a
          href={`https://go.postman.co/workspace/${workspaceId}`}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 rounded-md border border-card-border px-2.5 py-1.5 text-xs font-medium text-muted hover:bg-muted-bg hover:text-foreground transition-colors"
        >
          <ExternalLink className="h-3 w-3" />
          Workspace
        </a>
        <a
          href={`https://go.postman.co/workspace/${workspaceId}/collection/${collectionUid}`}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 rounded-md border border-card-border px-2.5 py-1.5 text-xs font-medium text-muted hover:bg-muted-bg hover:text-foreground transition-colors"
        >
          <Play className="h-3 w-3" />
          Collection
        </a>
      </div>
    </div>
  );
}

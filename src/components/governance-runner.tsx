"use client";

import { useState, useCallback } from "react";
import { Play, CheckCircle2, XCircle, Loader2, Copy, Check, ExternalLink, ChevronDown, ChevronRight } from "lucide-react";

/* ── Copy Button ─────────────────────────────────────────────────── */

export function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);

  const copy = useCallback(() => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [text]);

  return (
    <button
      onClick={copy}
      className="inline-flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-medium text-muted hover:bg-muted-bg hover:text-foreground transition-colors"
    >
      {copied ? <Check className="h-3.5 w-3.5 text-emerald-500" /> : <Copy className="h-3.5 w-3.5" />}
      {copied ? "Copied" : "Copy"}
    </button>
  );
}

/* ── Endpoint Health Runner ──────────────────────────────────────── */

type EndpointResult = {
  method: string;
  path: string;
  status: number | null;
  ok: boolean;
  ms: number;
  error?: string;
  responseBody?: string;
};

type RunState = "idle" | "running" | "done";

const SAMPLE_ENDPOINTS = [
  { method: "GET", path: "/api/health" },
  { method: "GET", path: "/api/readiness" },
  { method: "GET", path: "/api/v1/me" },
  { method: "GET", path: "/api/v1/customers" },
  { method: "GET", path: "/api/v1/payment_intents" },
  { method: "GET", path: "/api/v1/refunds" },
  { method: "GET", path: "/api/v1/balance" },
  { method: "GET", path: "/api/v1/payment_methods" },
  { method: "GET", path: "/api/v1/setup_intents" },
  { method: "GET", path: "/api/v1/products" },
  { method: "GET", path: "/api/v1/prices" },
  { method: "GET", path: "/api/v1/coupons" },
  { method: "GET", path: "/api/v1/subscriptions" },
  { method: "GET", path: "/api/v1/invoices" },
  { method: "GET", path: "/api/v1/tax_rates" },
  { method: "GET", path: "/api/v1/disputes" },
  { method: "GET", path: "/api/v1/transfers" },
  { method: "GET", path: "/api/v1/reserves" },
  { method: "GET", path: "/api/v1/holds" },
  { method: "GET", path: "/api/v1/risk/signals" },
  { method: "GET", path: "/api/v1/risk/rulesets" },
  { method: "GET", path: "/api/v1/risk/decisions" },
  { method: "GET", path: "/api/v1/risk/lists" },
  { method: "GET", path: "/api/v1/reports" },
  { method: "GET", path: "/api/v1/exports" },
  { method: "GET", path: "/api/v1/events" },
  { method: "GET", path: "/api/v1/webhook_endpoints" },
  { method: "GET", path: "/api/v1/balance_transactions" },
  { method: "GET", path: "/api/v1/promotion_codes" },
  { method: "GET", path: "/api/v1/export_schedules" },
];

export function EndpointRunner({ baseUrl }: { baseUrl: string }) {
  const [state, setState] = useState<RunState>("idle");
  const [results, setResults] = useState<EndpointResult[]>([]);
  const [progress, setProgress] = useState(0);
  const [expandedRows, setExpandedRows] = useState<Set<number>>(new Set());

  const toggleRow = useCallback((idx: number) => {
    setExpandedRows((prev) => {
      const next = new Set(prev);
      if (next.has(idx)) next.delete(idx);
      else next.add(idx);
      return next;
    });
  }, []);

  const run = useCallback(async () => {
    setState("running");
    setResults([]);
    setProgress(0);

    const allResults: EndpointResult[] = [];

    for (let i = 0; i < SAMPLE_ENDPOINTS.length; i++) {
      const ep = SAMPLE_ENDPOINTS[i];
      const start = Date.now();

      try {
        const res = await fetch(`${baseUrl}${ep.path}`, {
          method: ep.method,
          headers: {
            Authorization: "Bearer sk_test_demo_merchant_key",
            "Content-Type": "application/json",
          },
        });
        const isOk = res.status >= 200 && res.status < 400;
        let responseBody: string | undefined;
        if (!isOk) {
          try {
            responseBody = await res.text();
          } catch { /* ignore */ }
        }
        allResults.push({
          method: ep.method,
          path: ep.path,
          status: res.status,
          ok: isOk,
          ms: Date.now() - start,
          responseBody,
        });
      } catch (err) {
        allResults.push({
          method: ep.method,
          path: ep.path,
          status: null,
          ok: false,
          ms: Date.now() - start,
          error: err instanceof Error ? err.message : "Network error",
        });
      }

      setResults([...allResults]);
      setProgress(((i + 1) / SAMPLE_ENDPOINTS.length) * 100);
    }

    setState("done");
  }, [baseUrl]);

  const passed = results.filter((r) => r.ok).length;
  const failed = results.filter((r) => !r.ok).length;
  const avgMs = results.length > 0
    ? Math.round(results.reduce((s, r) => s + r.ms, 0) / results.length)
    : 0;

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h2 className="text-sm font-semibold">Live Endpoint Health Check</h2>
          <p className="text-xs text-muted">
            Probes {SAMPLE_ENDPOINTS.length} endpoints across all 5 services
          </p>
        </div>
        <button
          onClick={run}
          disabled={state === "running"}
          className="inline-flex items-center gap-2 rounded-lg bg-accent px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-accent-hover disabled:opacity-50"
        >
          {state === "running" ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Play className="h-4 w-4" />
          )}
          {state === "running" ? "Running..." : state === "done" ? "Run Again" : "Run Health Check"}
        </button>
      </div>

      {state !== "idle" && (
        <>
          <div className="mb-4 h-1.5 w-full overflow-hidden rounded-full bg-muted-bg">
            <div
              className="h-full rounded-full bg-accent transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>

          <div className="mb-4 grid grid-cols-3 gap-3">
            <div className="rounded-lg border border-card-border bg-emerald-50 p-3 text-center">
              <p className="text-2xl font-bold text-emerald-700">{passed}</p>
              <p className="text-xs text-emerald-600">Passed</p>
            </div>
            <div className="rounded-lg border border-card-border bg-red-50 p-3 text-center">
              <p className="text-2xl font-bold text-red-700">{failed}</p>
              <p className="text-xs text-red-600">Failed</p>
            </div>
            <div className="rounded-lg border border-card-border bg-blue-50 p-3 text-center">
              <p className="text-2xl font-bold text-blue-700">{avgMs}ms</p>
              <p className="text-xs text-blue-600">Avg Response</p>
            </div>
          </div>

          {failed > 0 && state === "done" && (
            <div className="mb-3 flex items-center gap-2">
              <button
                onClick={() => setExpandedRows((prev) => {
                  const failedIdxs = results.map((r, i) => (!r.ok ? i : -1)).filter((i) => i >= 0);
                  const allExpanded = failedIdxs.every((i) => prev.has(i));
                  return allExpanded ? new Set<number>() : new Set(failedIdxs);
                })}
                className="rounded-md border border-red-200 bg-red-50 px-3 py-1 text-xs font-medium text-red-700 transition-colors hover:bg-red-100"
              >
                {results.every((r, i) => r.ok || expandedRows.has(i))
                  ? "Collapse All Errors"
                  : `Show All ${failed} Errors`}
              </button>
            </div>
          )}

          <div className="max-h-[500px] overflow-y-auto rounded-lg border border-card-border">
            <table className="w-full text-left text-sm">
              <thead className="sticky top-0 border-b border-card-border bg-muted-bg/80 backdrop-blur">
                <tr>
                  <th className="w-8 px-2 py-2" />
                  <th className="px-3 py-2 text-xs font-medium uppercase text-muted">Status</th>
                  <th className="px-3 py-2 text-xs font-medium uppercase text-muted">Endpoint</th>
                  <th className="px-3 py-2 text-xs font-medium uppercase text-muted text-right">Response</th>
                  <th className="px-3 py-2 text-xs font-medium uppercase text-muted text-right">Time</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-card-border">
                {results.map((r, i) => {
                  const hasDetail = !r.ok && (r.error || r.responseBody);
                  const isExpanded = expandedRows.has(i);
                  return (
                    <ResultRow
                      key={i}
                      result={r}
                      hasDetail={!!hasDetail}
                      isExpanded={isExpanded}
                      onToggle={() => toggleRow(i)}
                    />
                  );
                })}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}

/* ── Result Row (with expandable error detail) ───────────────────── */

function formatErrorBody(body: string): string {
  try {
    return JSON.stringify(JSON.parse(body), null, 2);
  } catch {
    return body;
  }
}

function ResultRow({
  result: r,
  hasDetail,
  isExpanded,
  onToggle,
}: {
  result: EndpointResult;
  hasDetail: boolean;
  isExpanded: boolean;
  onToggle: () => void;
}) {
  return (
    <>
      <tr
        className={`${hasDetail ? "cursor-pointer" : ""} hover:bg-muted-bg/30 ${isExpanded ? "bg-red-50/40" : ""}`}
        onClick={hasDetail ? onToggle : undefined}
      >
        <td className="w-8 px-2 py-2 text-center">
          {hasDetail ? (
            isExpanded ? (
              <ChevronDown className="mx-auto h-3.5 w-3.5 text-muted" />
            ) : (
              <ChevronRight className="mx-auto h-3.5 w-3.5 text-muted" />
            )
          ) : null}
        </td>
        <td className="px-3 py-2">
          {r.ok ? (
            <CheckCircle2 className="h-4 w-4 text-emerald-500" />
          ) : (
            <XCircle className="h-4 w-4 text-red-500" />
          )}
        </td>
        <td className="px-3 py-2">
          <span className="inline-flex items-center gap-2">
            <span className="rounded bg-emerald-50 px-1.5 py-0.5 text-xs font-bold text-emerald-700">
              {r.method}
            </span>
            <span className="font-mono text-xs">{r.path}</span>
          </span>
        </td>
        <td className="px-3 py-2 text-right">
          <span
            className={`rounded-md px-2 py-0.5 text-xs font-semibold ${
              r.status && r.status < 300
                ? "bg-emerald-50 text-emerald-700"
                : r.status && r.status < 400
                  ? "bg-blue-50 text-blue-700"
                  : "bg-red-50 text-red-700"
            }`}
          >
            {r.status ?? "ERR"}
          </span>
        </td>
        <td className="px-3 py-2 text-right font-mono text-xs text-muted">{r.ms}ms</td>
      </tr>
      {isExpanded && hasDetail && (
        <tr className="bg-red-50/30">
          <td colSpan={5} className="px-4 py-3">
            {r.error && (
              <div className="mb-2 flex items-start gap-2">
                <span className="mt-0.5 shrink-0 rounded bg-red-100 px-1.5 py-0.5 text-[10px] font-bold uppercase text-red-700">
                  Error
                </span>
                <span className="text-xs text-red-700">{r.error}</span>
              </div>
            )}
            {r.responseBody && (
              <div>
                <div className="mb-1.5 flex items-center justify-between">
                  <span className="text-[10px] font-bold uppercase text-muted">Response Body</span>
                  <CopyButton text={r.responseBody} />
                </div>
                <pre className="max-h-48 overflow-auto rounded-md bg-slate-900 p-3 text-xs leading-relaxed text-slate-300">
                  {formatErrorBody(r.responseBody)}
                </pre>
              </div>
            )}
          </td>
        </tr>
      )}
    </>
  );
}

/* ── Workspace Card ──────────────────────────────────────────────── */

export function WorkspaceCard({
  name,
  ops,
  workspaceId,
  collectionUid,
  envUid,
  color,
}: {
  name: string;
  ops: number;
  workspaceId: string;
  collectionUid: string;
  envUid: string;
  color: string;
}) {
  const cliCmd = `postman collection run ${collectionUid} -e ${envUid}`;

  return (
    <div className="rounded-xl border border-card-border bg-card-bg p-4 shadow-sm">
      <div className="mb-3 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <span
            className="inline-block h-3 w-3 rounded-full"
            style={{ backgroundColor: color }}
          />
          <span className="text-sm font-semibold">{name}</span>
        </div>
        <span className="rounded-md bg-muted-bg px-2 py-0.5 text-xs font-semibold tabular-nums">
          {ops} ops
        </span>
      </div>

      <div className="mb-3 rounded-lg bg-slate-900 p-3">
        <div className="flex items-start justify-between gap-2">
          <code className="break-all text-xs text-slate-300">
            postman collection run {collectionUid} \<br />
            &nbsp;&nbsp;-e {envUid}
          </code>
          <CopyButton text={cliCmd} />
        </div>
      </div>

      <div className="flex items-center gap-2">
        <a
          href={`https://go.postman.co/workspace/${workspaceId}`}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 rounded-md border border-card-border px-2.5 py-1.5 text-xs font-medium text-muted hover:bg-muted-bg hover:text-foreground transition-colors"
        >
          <ExternalLink className="h-3 w-3" />
          Open Workspace
        </a>
        <a
          href={`https://go.postman.co/workspace/${workspaceId}/collection/${collectionUid}`}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 rounded-md border border-card-border px-2.5 py-1.5 text-xs font-medium text-muted hover:bg-muted-bg hover:text-foreground transition-colors"
        >
          <Play className="h-3 w-3" />
          Run in Postman
        </a>
      </div>
    </div>
  );
}

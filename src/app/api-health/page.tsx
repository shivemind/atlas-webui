import {
  Activity,
  CheckCircle2,
  Database,
  Shield,
  FileText,
  Server,
} from "lucide-react";
import { PageHeader, StatCard, Badge } from "@/components/ui";

export const dynamic = "force-dynamic";

async function probe(url: string): Promise<{ ok: boolean; ms: number }> {
  const base = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";
  const start = Date.now();
  try {
    const res = await fetch(`${base}${url}`, { cache: "no-store" });
    return { ok: res.ok, ms: Date.now() - start };
  } catch {
    return { ok: false, ms: Date.now() - start };
  }
}

export default async function ApiHealthPage() {
  const [health, readiness] = await Promise.all([
    probe("/api/health"),
    probe("/api/readiness"),
  ]);

  const checks = [
    {
      name: "Health Endpoint",
      icon: <Server className="h-5 w-5" />,
      ok: health.ok,
      latency: health.ms,
      description: "GET /api/health — basic liveness",
    },
    {
      name: "Readiness (DB)",
      icon: <Database className="h-5 w-5" />,
      ok: readiness.ok,
      latency: readiness.ms,
      description: "GET /api/readiness — PostgreSQL connectivity",
    },
  ];

  const governanceRules = [
    {
      rule: "Every operation has a unique operationId",
      scope: "OpenAPI spec",
      enforced: "CI (pnpm openapi:validate)",
    },
    {
      rule: "Every operation has at least one tag",
      scope: "OpenAPI spec",
      enforced: "CI (pnpm openapi:validate)",
    },
    {
      rule: "/api/v1/* operations require MerchantKeyAuth",
      scope: "Security",
      enforced: "CI (pnpm openapi:validate)",
    },
    {
      rule: "/api/internal/* operations require PlatformAdminKeyAuth",
      scope: "Security",
      enforced: "CI (pnpm openapi:validate)",
    },
    {
      rule: "Spectral lint rules (descriptions, naming, security)",
      scope: "Style",
      enforced: "CI (pnpm openapi:lint)",
    },
    {
      rule: "x-platform extension enforcement",
      scope: "Governance",
      enforced: "CI (pnpm openapi:xplatform)",
    },
    {
      rule: "Contract tests: spec ↔ implementation consistency",
      scope: "Contract",
      enforced: "CI (pnpm test)",
    },
    {
      rule: "Postman CLI collection tests",
      scope: "Integration",
      enforced: "CI (postman collection run)",
    },
  ];

  return (
    <>
      <PageHeader
        title="API Health & Governance"
        description="Live health probes and API governance rules"
      />

      <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {checks.map((c) => (
          <StatCard
            key={c.name}
            label={c.name}
            value={c.ok ? "Healthy" : "Down"}
            sub={`${c.latency}ms — ${c.description}`}
            icon={c.icon}
            trend={c.ok ? { value: "Up", positive: true } : { value: "Down", positive: false }}
          />
        ))}
        <StatCard
          label="OpenAPI Operations"
          value="20"
          sub="Phase 1–3 endpoints"
          icon={<FileText className="h-5 w-5" />}
        />
      </div>

      <h2 className="mb-3 text-sm font-semibold">API Governance Rules</h2>
      <div className="overflow-x-auto rounded-xl border border-card-border bg-card-bg shadow-sm">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-card-border bg-muted-bg/50">
              <th className="px-4 py-3 text-xs font-medium uppercase tracking-wider text-muted">Status</th>
              <th className="px-4 py-3 text-xs font-medium uppercase tracking-wider text-muted">Rule</th>
              <th className="px-4 py-3 text-xs font-medium uppercase tracking-wider text-muted">Scope</th>
              <th className="px-4 py-3 text-xs font-medium uppercase tracking-wider text-muted">Enforced By</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-card-border">
            {governanceRules.map((r, i) => (
              <tr key={i} className="hover:bg-muted-bg/30">
                <td className="px-4 py-3">
                  <CheckCircle2 className="h-4 w-4 text-success" />
                </td>
                <td className="px-4 py-3 text-sm">{r.rule}</td>
                <td className="px-4 py-3">
                  <Badge variant="info">{r.scope}</Badge>
                </td>
                <td className="px-4 py-3 font-mono text-xs text-muted">{r.enforced}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <h2 className="mb-3 mt-8 text-sm font-semibold">Security Model</h2>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="rounded-xl border border-card-border bg-card-bg p-5">
          <div className="mb-2 flex items-center gap-2">
            <Shield className="h-4 w-4 text-accent" />
            <span className="text-sm font-medium">MerchantKeyAuth</span>
          </div>
          <p className="text-xs text-muted">
            Bearer token with <code className="rounded bg-muted-bg px-1">sk_</code> prefix.
            Applied to all <code className="rounded bg-muted-bg px-1">/api/v1/*</code> routes.
          </p>
        </div>
        <div className="rounded-xl border border-card-border bg-card-bg p-5">
          <div className="mb-2 flex items-center gap-2">
            <Shield className="h-4 w-4 text-warning" />
            <span className="text-sm font-medium">PlatformAdminKeyAuth</span>
          </div>
          <p className="text-xs text-muted">
            Bearer token with{" "}
            <code className="rounded bg-muted-bg px-1">pk_admin_</code> prefix.
            Applied to <code className="rounded bg-muted-bg px-1">/api/internal/*</code> routes.
          </p>
        </div>
      </div>
    </>
  );
}

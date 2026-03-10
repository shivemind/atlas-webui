import {
  Zap,
  Clock,
  Layers,
  Server,
  ChevronDown,
} from "lucide-react";
import { StatCard, PageHeader, Badge, Table } from "@/components/ui";
import { TimelineChart, ServiceBarChart } from "@/components/activity-charts";
import { AutoRefresh } from "@/components/auto-refresh";
import {
  getActivityStats,
  getEventTimeline,
  getServiceBreakdown,
  getRecentEvents,
  getEndpointCatalog,
} from "@/lib/dal";

export const dynamic = "force-dynamic";

const METHOD_COLORS: Record<string, string> = {
  GET: "bg-emerald-50 text-emerald-700 ring-emerald-600/20",
  POST: "bg-blue-50 text-blue-700 ring-blue-600/20",
  PATCH: "bg-amber-50 text-amber-700 ring-amber-600/20",
  PUT: "bg-orange-50 text-orange-700 ring-orange-600/20",
  DELETE: "bg-red-50 text-red-700 ring-red-600/20",
};

function MethodBadge({ method }: { method: string }) {
  return (
    <span
      className={`inline-flex w-16 items-center justify-center rounded-md px-2 py-0.5 text-xs font-bold ring-1 ring-inset ${METHOD_COLORS[method] ?? "bg-gray-50 text-gray-700 ring-gray-600/20"}`}
    >
      {method}
    </span>
  );
}

function ServiceDot({ color }: { color: string }) {
  return (
    <span
      className="inline-block h-2.5 w-2.5 shrink-0 rounded-full"
      style={{ backgroundColor: color }}
    />
  );
}

function timeAgo(date: Date) {
  const seconds = Math.floor((Date.now() - date.getTime()) / 1000);
  if (seconds < 60) return `${seconds}s ago`;
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  return `${Math.floor(seconds / 86400)}d ago`;
}

export default async function ActivityPage() {
  const [stats, timeline, services, recentEvents, catalog] = await Promise.all([
    getActivityStats(),
    getEventTimeline(24),
    getServiceBreakdown(),
    getRecentEvents(25),
    getEndpointCatalog(),
  ]);

  const serviceGroups: Record<
    string,
    typeof catalog.operations
  > = {};
  for (const op of catalog.operations) {
    const svc = op.service;
    if (!serviceGroups[svc]) serviceGroups[svc] = [];
    serviceGroups[svc].push(op);
  }

  return (
    <>
      <AutoRefresh intervalMs={10_000} />

      <PageHeader
        title="API Activity"
        description={`Live activity across ${catalog.operations.length} endpoints and ${services.length} services`}
      />

      {/* Stat Cards */}
      <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Total Events"
          value={stats.totalEvents.toLocaleString()}
          icon={<Zap className="h-5 w-5" />}
        />
        <StatCard
          label="Events Today"
          value={stats.eventsToday.toLocaleString()}
          sub={`${stats.eventsThisHour} this hour`}
          icon={<Clock className="h-5 w-5" />}
        />
        <StatCard
          label="Active Services"
          value={stats.activeServices}
          sub="of 5 services"
          icon={<Server className="h-5 w-5" />}
        />
        <StatCard
          label="Entity Types"
          value={stats.activeEntityTypes}
          sub="unique types active"
          icon={<Layers className="h-5 w-5" />}
        />
      </div>

      {/* Activity Timeline */}
      <div className="mb-8 rounded-xl border border-card-border bg-card-bg p-5 shadow-sm">
        <h2 className="mb-4 text-sm font-semibold">Activity Timeline (24h)</h2>
        <TimelineChart data={timeline} />
      </div>

      {/* Service Breakdown + Live Feed */}
      <div className="mb-8 grid grid-cols-1 gap-6 xl:grid-cols-2">
        {/* Service Breakdown */}
        <div className="rounded-xl border border-card-border bg-card-bg p-5 shadow-sm">
          <h2 className="mb-4 text-sm font-semibold">Service Breakdown</h2>
          <ServiceBarChart data={services} />
          <div className="mt-4 space-y-2">
            {services.map((svc) => (
              <div
                key={svc.name}
                className="flex items-center justify-between rounded-lg px-3 py-2 hover:bg-muted-bg/50"
              >
                <div className="flex items-center gap-2.5">
                  <ServiceDot color={svc.color} />
                  <span className="text-sm font-medium">{svc.name}</span>
                  <span className="text-xs text-muted">
                    {svc.entityTypes.length} types
                  </span>
                </div>
                <span className="rounded-md bg-muted-bg px-2 py-0.5 text-xs font-semibold tabular-nums">
                  {svc.count.toLocaleString()}
                </span>
              </div>
            ))}
            {services.length === 0 && (
              <p className="py-8 text-center text-xs text-muted">
                No events yet. Call the API to generate activity.
              </p>
            )}
          </div>
        </div>

        {/* Live Event Feed */}
        <div className="rounded-xl border border-card-border bg-card-bg p-5 shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-sm font-semibold">Live Event Feed</h2>
            <span className="flex items-center gap-1.5 text-xs text-muted">
              <span className="h-2 w-2 animate-pulse rounded-full bg-emerald-500" />
              Auto-refreshing
            </span>
          </div>
          <div className="max-h-[400px] space-y-1 overflow-y-auto">
            {recentEvents.map((ev) => (
              <div
                key={ev.id}
                className="flex items-start gap-3 rounded-lg px-3 py-2.5 hover:bg-muted-bg/50"
              >
                <ServiceDot color={ev.color} />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="truncate text-xs font-semibold">
                      {ev.type}
                    </span>
                    <span className="shrink-0 text-xs text-muted">
                      {timeAgo(ev.createdAt)}
                    </span>
                  </div>
                  <div className="mt-0.5 flex items-center gap-2 text-xs text-muted">
                    <span>{ev.entityType}</span>
                    <span className="font-mono">{ev.entityId.slice(0, 12)}...</span>
                  </div>
                </div>
              </div>
            ))}
            {recentEvents.length === 0 && (
              <p className="py-12 text-center text-xs text-muted">
                No events yet. Call the API to see live activity.
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Endpoint Map */}
      <div className="rounded-xl border border-card-border bg-card-bg shadow-sm">
        <details>
          <summary className="flex cursor-pointer items-center gap-2 px-5 py-4">
            <ChevronDown className="h-4 w-4 text-muted transition-transform [[open]>&]:rotate-180" />
            <h2 className="text-sm font-semibold">
              Endpoint Map — {catalog.operations.length} Operations
            </h2>
            <span className="ml-auto text-xs text-muted">
              {Object.keys(catalog.tagCounts).length} tags across{" "}
              {Object.keys(serviceGroups).length} services
            </span>
          </summary>

          <div className="border-t border-card-border">
            {Object.entries(serviceGroups).map(([svcName, ops]) => (
              <details key={svcName} className="group">
                <summary className="flex cursor-pointer items-center gap-3 border-b border-card-border px-5 py-3 hover:bg-muted-bg/30">
                  <ChevronDown className="h-3.5 w-3.5 text-muted transition-transform group-open:rotate-180" />
                  <ServiceDot color={ops[0]?.color ?? "#94a3b8"} />
                  <span className="text-sm font-medium">{svcName}</span>
                  <Badge variant="neutral">{ops.length} ops</Badge>
                </summary>

                <div className="border-b border-card-border">
                  <Table headers={["Method", "Path", "Operation", "Tag"]}>
                    {ops.map((op) => (
                      <tr
                        key={`${op.method}-${op.path}`}
                        className="hover:bg-muted-bg/30"
                      >
                        <td className="px-4 py-2">
                          <MethodBadge method={op.method} />
                        </td>
                        <td className="px-4 py-2 font-mono text-xs">
                          {op.path}
                        </td>
                        <td className="px-4 py-2 text-xs text-muted">
                          {op.operationId}
                        </td>
                        <td className="px-4 py-2">
                          <Badge variant="info">{op.tag}</Badge>
                        </td>
                      </tr>
                    ))}
                  </Table>
                </div>
              </details>
            ))}
          </div>
        </details>
      </div>
    </>
  );
}

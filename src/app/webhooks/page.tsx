import { Webhook, Globe } from "lucide-react";
import { getWebhookEndpoints, getWebhookDeliveries } from "@/lib/dal";
import { PageHeader, Table, EmptyState, Badge } from "@/components/ui";

export const dynamic = "force-dynamic";

export default async function WebhooksPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const params = await searchParams;
  const page = Math.max(1, Number(params.page) || 1);
  const [endpoints, deliveriesData] = await Promise.all([
    getWebhookEndpoints(),
    getWebhookDeliveries(page),
  ]);

  return (
    <>
      <PageHeader
        title="Webhooks"
        description="Webhook endpoints and delivery log"
      />

      {/* Endpoints */}
      <h2 className="mb-3 text-sm font-semibold">Endpoints</h2>
      {endpoints.length === 0 ? (
        <EmptyState
          icon={<Globe className="h-8 w-8" />}
          title="No webhook endpoints"
          description="Register an endpoint via POST /api/v1/webhook_endpoints"
        />
      ) : (
        <Table headers={["ID", "URL", "Events", "Active", "Deliveries", "Created"]}>
          {endpoints.map((ep) => (
            <tr key={ep.id} className="hover:bg-muted-bg/30">
              <td className="px-4 py-3 font-mono text-xs">{ep.id.slice(0, 12)}…</td>
              <td className="px-4 py-3 text-xs font-medium truncate max-w-xs">{ep.url}</td>
              <td className="px-4 py-3 text-xs">
                {(ep.eventTypes as string[])?.join(", ") || "*"}
              </td>
              <td className="px-4 py-3">
                <Badge variant={ep.isActive ? "success" : "neutral"}>
                  {ep.isActive ? "Active" : "Inactive"}
                </Badge>
              </td>
              <td className="px-4 py-3 text-xs">{ep._count.deliveries}</td>
              <td className="px-4 py-3 text-xs text-muted">
                {ep.createdAt.toLocaleDateString()}
              </td>
            </tr>
          ))}
        </Table>
      )}

      {/* Deliveries */}
      <h2 className="mb-3 mt-8 text-sm font-semibold">Recent Deliveries</h2>
      {deliveriesData.deliveries.length === 0 ? (
        <EmptyState
          icon={<Webhook className="h-8 w-8" />}
          title="No deliveries yet"
          description="Webhook deliveries appear here after payment events"
        />
      ) : (
        <>
          <Table headers={["ID", "Endpoint", "Event", "Status", "Next Attempt", "Created"]}>
            {deliveriesData.deliveries.map((d) => (
              <tr key={d.id} className="hover:bg-muted-bg/30">
                <td className="px-4 py-3 font-mono text-xs">{d.id.slice(0, 12)}…</td>
                <td className="px-4 py-3 text-xs truncate max-w-xs">
                  {d.webhookEndpoint?.url ?? "—"}
                </td>
                <td className="px-4 py-3">
                  <Badge variant="info">{d.eventType}</Badge>
                </td>
                <td className="px-4 py-3">
                  <Badge
                    variant={
                      d.status === "DELIVERED" ? "success" : d.status === "PENDING" ? "warning" : "danger"
                    }
                  >
                    {d.status}
                  </Badge>
                </td>
                <td className="px-4 py-3 text-xs text-muted">
                  {d.nextAttemptAt?.toLocaleString() ?? "—"}
                </td>
                <td className="px-4 py-3 text-xs text-muted">
                  {d.createdAt.toLocaleDateString()}
                </td>
              </tr>
            ))}
          </Table>
          {deliveriesData.pages > 1 && (
            <div className="mt-4 flex items-center justify-between text-xs text-muted">
              <span>Page {page} of {deliveriesData.pages}</span>
              <div className="flex gap-2">
                {page > 1 && (
                  <a href={`/webhooks?page=${page - 1}`} className="rounded border border-card-border px-3 py-1 hover:bg-muted-bg">Previous</a>
                )}
                {page < deliveriesData.pages && (
                  <a href={`/webhooks?page=${page + 1}`} className="rounded border border-card-border px-3 py-1 hover:bg-muted-bg">Next</a>
                )}
              </div>
            </div>
          )}
        </>
      )}
    </>
  );
}

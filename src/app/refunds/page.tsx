import { RotateCcw } from "lucide-react";
import { getRefunds } from "@/lib/dal";
import { PageHeader, Table, EmptyState, Badge } from "@/components/ui";

function centsToUsd(cents: number) {
  return `$${(cents / 100).toLocaleString("en-US", { minimumFractionDigits: 2 })}`;
}

export const dynamic = "force-dynamic";

export default async function RefundsPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const params = await searchParams;
  const page = Math.max(1, Number(params.page) || 1);
  const { refunds, total, pages } = await getRefunds(page);

  return (
    <>
      <PageHeader
        title="Refunds"
        description={`${total} refund${total !== 1 ? "s" : ""}`}
      />

      {refunds.length === 0 ? (
        <EmptyState
          icon={<RotateCcw className="h-8 w-8" />}
          title="No refunds yet"
          description="Issue a refund via POST /api/v1/refunds"
        />
      ) : (
        <>
          <Table headers={["ID", "Payment", "Amount", "Status", "Reason", "Created"]}>
            {refunds.map((r) => (
              <tr key={r.id} className="hover:bg-muted-bg/30">
                <td className="px-4 py-3 font-mono text-xs">{r.id.slice(0, 16)}…</td>
                <td className="px-4 py-3 font-mono text-xs">
                  {r.paymentIntent.id.slice(0, 12)}…
                </td>
                <td className="px-4 py-3 text-sm font-medium">
                  {centsToUsd(Number(r.amount))}
                </td>
                <td className="px-4 py-3">
                  <Badge
                    variant={
                      r.status === "SUCCEEDED"
                        ? "success"
                        : r.status === "PENDING"
                          ? "warning"
                          : "danger"
                    }
                  >
                    {r.status}
                  </Badge>
                </td>
                <td className="px-4 py-3 text-xs">{r.reason ?? "—"}</td>
                <td className="px-4 py-3 text-xs text-muted">
                  {r.createdAt.toLocaleDateString()}
                </td>
              </tr>
            ))}
          </Table>
          {pages > 1 && (
            <div className="mt-4 flex items-center justify-between text-xs text-muted">
              <span>Page {page} of {pages}</span>
              <div className="flex gap-2">
                {page > 1 && (
                  <a href={`/refunds?page=${page - 1}`} className="rounded border border-card-border px-3 py-1 hover:bg-muted-bg">Previous</a>
                )}
                {page < pages && (
                  <a href={`/refunds?page=${page + 1}`} className="rounded border border-card-border px-3 py-1 hover:bg-muted-bg">Next</a>
                )}
              </div>
            </div>
          )}
        </>
      )}
    </>
  );
}

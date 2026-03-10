import { CreditCard } from "lucide-react";
import { getPayments } from "@/lib/dal";
import { PageHeader, Table, EmptyState, Badge } from "@/components/ui";

function statusBadge(status: string) {
  const map: Record<string, "success" | "warning" | "danger" | "info" | "neutral"> = {
    SUCCEEDED: "success",
    APPROVED: "success",
    PENDING: "warning",
    PROCESSING: "warning",
    REQUIRES_CONFIRMATION: "info",
    DECLINED: "danger",
    PAYMENT_FAILED: "danger",
    CANCELED: "neutral",
  };
  return <Badge variant={map[status] ?? "neutral"}>{status}</Badge>;
}

function centsToUsd(cents: number) {
  return `$${(cents / 100).toLocaleString("en-US", { minimumFractionDigits: 2 })}`;
}

export const dynamic = "force-dynamic";

export default async function PaymentsPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const params = await searchParams;
  const page = Math.max(1, Number(params.page) || 1);
  const { payments, total, pages } = await getPayments(page);

  return (
    <>
      <PageHeader
        title="Payment Intents"
        description={`${total} payment intent${total !== 1 ? "s" : ""}`}
      />

      {payments.length === 0 ? (
        <EmptyState
          icon={<CreditCard className="h-8 w-8" />}
          title="No payment intents yet"
          description="Create a payment via POST /api/v1/payment_intents"
        />
      ) : (
        <>
          <Table
            headers={[
              "ID",
              "Customer",
              "Amount",
              "Currency",
              "Status",
              "Created",
            ]}
          >
            {payments.map((pi) => (
              <tr key={pi.id} className="hover:bg-muted-bg/30">
                <td className="px-4 py-3 font-mono text-xs">
                  {pi.id.slice(0, 16)}…
                </td>
                <td className="px-4 py-3 text-sm">
                  {pi.customer?.name ?? pi.customer?.email ?? "—"}
                </td>
                <td className="px-4 py-3 text-sm font-medium">
                  {centsToUsd(Number(pi.amount))}
                </td>
                <td className="px-4 py-3 text-xs uppercase">{pi.currency}</td>
                <td className="px-4 py-3">{statusBadge(pi.status)}</td>
                <td className="px-4 py-3 text-xs text-muted">
                  {pi.createdAt.toLocaleDateString()}
                </td>
              </tr>
            ))}
          </Table>
          {pages > 1 && (
            <div className="mt-4 flex items-center justify-between text-xs text-muted">
              <span>
                Page {page} of {pages}
              </span>
              <div className="flex gap-2">
                {page > 1 && (
                  <a
                    href={`/payments?page=${page - 1}`}
                    className="rounded border border-card-border px-3 py-1 hover:bg-muted-bg"
                  >
                    Previous
                  </a>
                )}
                {page < pages && (
                  <a
                    href={`/payments?page=${page + 1}`}
                    className="rounded border border-card-border px-3 py-1 hover:bg-muted-bg"
                  >
                    Next
                  </a>
                )}
              </div>
            </div>
          )}
        </>
      )}
    </>
  );
}

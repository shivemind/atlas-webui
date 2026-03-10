import { Users } from "lucide-react";
import { getCustomers } from "@/lib/dal";
import { PageHeader, Table, EmptyState, Badge } from "@/components/ui";

export const dynamic = "force-dynamic";

export default async function CustomersPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const params = await searchParams;
  const page = Math.max(1, Number(params.page) || 1);
  const { customers, total, pages } = await getCustomers(page);

  return (
    <>
      <PageHeader
        title="Customers"
        description={`${total} customer${total !== 1 ? "s" : ""} in sandbox`}
      />

      {customers.length === 0 ? (
        <EmptyState
          icon={<Users className="h-8 w-8" />}
          title="No customers yet"
          description="Create customers via POST /api/v1/customers"
        />
      ) : (
        <>
          <Table
            headers={["ID", "Name", "Email", "Payments", "Created"]}
          >
            {customers.map((c) => (
              <tr key={c.id} className="hover:bg-muted-bg/30">
                <td className="px-4 py-3 font-mono text-xs">
                  {c.id.slice(0, 16)}…
                </td>
                <td className="px-4 py-3 text-sm font-medium">
                  {c.name ?? "—"}
                </td>
                <td className="px-4 py-3 text-sm">{c.email}</td>
                <td className="px-4 py-3">
                  <Badge variant={c._count.paymentIntents > 0 ? "info" : "neutral"}>
                    {c._count.paymentIntents}
                  </Badge>
                </td>
                <td className="px-4 py-3 text-xs text-muted">
                  {c.createdAt.toLocaleDateString()}
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
                    href={`/customers?page=${page - 1}`}
                    className="rounded border border-card-border px-3 py-1 hover:bg-muted-bg"
                  >
                    Previous
                  </a>
                )}
                {page < pages && (
                  <a
                    href={`/customers?page=${page + 1}`}
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

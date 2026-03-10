import { Wallet } from "lucide-react";
import { getBalance } from "@/lib/dal";
import { PageHeader, StatCard, EmptyState } from "@/components/ui";

function centsToUsd(cents: number) {
  return `$${(Math.abs(cents) / 100).toLocaleString("en-US", { minimumFractionDigits: 2 })}`;
}

export const dynamic = "force-dynamic";

export default async function BalancePage() {
  const balances = await getBalance();
  const hasData = Object.keys(balances).length > 0;

  return (
    <>
      <PageHeader
        title="Balance & Ledger"
        description="Double-entry ledger account balances"
      />

      {!hasData ? (
        <EmptyState
          icon={<Wallet className="h-8 w-8" />}
          title="No ledger entries yet"
          description="Capture a payment to create ledger entries"
        />
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Object.entries(balances).map(([code, cents]) => (
            <StatCard
              key={code}
              label={code.replace(/_/g, " ")}
              value={centsToUsd(cents)}
              sub={cents >= 0 ? "Debit balance" : "Credit balance"}
              icon={<Wallet className="h-5 w-5" />}
            />
          ))}
        </div>
      )}
    </>
  );
}

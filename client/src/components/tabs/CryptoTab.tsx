import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Coins, Lightbulb } from "lucide-react";
import { PortfolioChart } from "@/components/PortfolioChart";
import { PerformanceChart } from "@/components/PerformanceChart";
import { DataTable } from "@/components/DataTable";
import { Skeleton } from "@/components/ui/skeleton";
import type { TreasurySnapshot } from "@shared/treasury-types";

interface CryptoTabProps {
  snapshot?: TreasurySnapshot;
  isLoadingSnapshot: boolean;
  historicalSnapshots?: TreasurySnapshot[];
  isLoadingHistory: boolean;
}

export function CryptoTab({ snapshot, isLoadingSnapshot, historicalSnapshots, isLoadingHistory }: CryptoTabProps) {
  const performanceData = historicalSnapshots && historicalSnapshots.length > 0
    ? historicalSnapshots.map(s => ({
        date: new Date(s.timestamp).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        value: s.totalUsdValue,
      }))
    : [];

  const totalCryptoValue = snapshot?.tokens?.reduce((sum, token) => sum + (token.usdValue || 0), 0) || 0;

  return (
    <div className="space-y-6" data-testid="tab-crypto">
      <div>
        <h2 className="text-2xl font-bold font-heading mb-2">Crypto Holdings</h2>
        <p className="text-muted-foreground">
          Cryptocurrency and token holdings across all DAO wallets.
        </p>
      </div>

      <Card className="rounded-2xl border border-primary/20 bg-gradient-to-br from-primary/10 to-primary/5 backdrop-blur-xl">
        <CardHeader>
          <CardTitle className="text-xl flex items-center gap-2">
            <Coins className="w-5 h-5" />
            Total Crypto Holdings
          </CardTitle>
          <CardDescription>
            Combined value of all cryptocurrency assets
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {isLoadingSnapshot ? (
              <Skeleton className="h-16 rounded" />
            ) : (
              <div className="flex items-baseline gap-2">
                <span className="text-4xl font-bold font-heading">
                  ${totalCryptoValue.toLocaleString(undefined, { maximumFractionDigits: 2 })}
                </span>
                <span className="text-muted-foreground">USD</span>
              </div>
            )}
            <div className="p-4 rounded-lg bg-muted/30 border border-muted flex gap-3">
              <Lightbulb className="w-4 h-4 text-primary shrink-0 mt-0.5" />
              <div>
                <p className="text-sm text-muted-foreground">
                  <strong>Data Sources:</strong> Aggregating token balances from:
                </p>
                <ul className="list-disc list-inside text-sm text-muted-foreground mt-2 ml-2 space-y-1">
                  <li>Gnosis Safe multi-sig wallets</li>
                  <li>DAO treasury wallets</li>
                  <li>Tactical operation wallets</li>
                </ul>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {isLoadingSnapshot ? (
          <>
            <Skeleton className="h-96 rounded-2xl" />
            <Skeleton className="h-96 rounded-2xl" />
          </>
        ) : (
          <>
            <PortfolioChart tokens={snapshot?.tokens || []} />
            <DataTable tokens={(snapshot?.tokens || []).slice(0, 10)} title="Top Token Holdings" />
          </>
        )}
      </div>

      <div>
        {isLoadingHistory ? (
          <Skeleton className="h-96 rounded-2xl" />
        ) : (
          <PerformanceChart data={performanceData} />
        )}
      </div>

    </div>
  );
}

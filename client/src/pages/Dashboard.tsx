import { useQuery } from "@tanstack/react-query";
import { Wallet, Coins, Image } from "lucide-react";
import { StatCard } from "@/components/StatCard";
import { PortfolioChart } from "@/components/PortfolioChart";
import { PerformanceChart } from "@/components/PerformanceChart";
import { DataTable } from "@/components/DataTable";
import { SectionHeader } from "@/components/SectionHeader";
import { AlertBanner } from "@/components/AlertBanner";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useTreasuryWebSocket } from "@/hooks/useTreasuryWebSocket";
import type { TokenBalance, TreasurySnapshot, SheetTreasuryEntry } from "@shared/treasury-types";

export default function Dashboard() {
  useTreasuryWebSocket();
  const { data: snapshot, isLoading: isLoadingSnapshot, error: snapshotError } = useQuery<TreasurySnapshot>({
    queryKey: ['/api/treasury/snapshots'],
  });

  const { data: safeBalances, isLoading: isLoadingSafe } = useQuery<TokenBalance[]>({
    queryKey: ['/api/treasury/safe'],
  });

  const { data: sheetEntries, isLoading: isLoadingSheets } = useQuery<SheetTreasuryEntry[]>({
    queryKey: ['/api/treasury/google-sheets'],
  });

  const { data: historicalSnapshots, isLoading: isLoadingHistory } = useQuery<TreasurySnapshot[]>({
    queryKey: ['/api/treasury/snapshots/history', { limit: 90 }],
    queryFn: async () => {
      const response = await fetch('/api/treasury/snapshots/history?limit=90');
      if (!response.ok) {
        throw new Error('Failed to fetch historical snapshots');
      }
      return response.json();
    },
    staleTime: 5 * 60 * 1000,
  });

  const performanceData = historicalSnapshots && historicalSnapshots.length > 0
    ? historicalSnapshots.map(s => ({
        date: new Date(s.timestamp).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        value: s.totalUsdValue,
      }))
    : [];

  if (snapshotError) {
    return (
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <AlertBanner
          type="error"
          message="Failed to load treasury data. Please try again later."
        />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8" data-testid="page-dashboard">
      <div className="mb-8">
        <h1 className="text-3xl sm:text-4xl font-bold font-heading mb-2">Treasury Dashboard</h1>
        <p className="text-muted-foreground">Real-time overview of KingDAO treasury assets</p>
      </div>

      {isLoadingSnapshot ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-32 rounded-2xl" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <StatCard
            title="Total Treasury Value"
            value={`$${(snapshot?.totalUsdValue || 0).toLocaleString()}`}
            subtitle="Across all sources"
            icon={Coins}
          />
          <StatCard
            title="Wallet Count"
            value={snapshot?.wallets?.length || 0}
            subtitle="Multi-sig wallets tracked"
            icon={Wallet}
          />
          <StatCard
            title="NFT Holdings"
            value={snapshot?.nfts?.length || 0}
            subtitle="Unique NFT assets"
            icon={Image}
          />
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
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

      <div className="mb-8">
        {isLoadingHistory ? (
          <Skeleton className="h-96 rounded-2xl" />
        ) : (
          <PerformanceChart data={performanceData} />
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div>
          <SectionHeader
            title="Multi-Sig (Safe) Assets"
            subtitle="Assets held in Gnosis Safe wallets"
          />
          {isLoadingSafe ? (
            <Skeleton className="h-64 rounded-2xl" />
          ) : (
            <Card className="rounded-2xl border border-white/10 bg-card/50 backdrop-blur-xl p-6">
              {safeBalances && safeBalances.length > 0 ? (
                <div className="space-y-4">
                  {safeBalances.slice(0, 5).map((token, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between pb-3 border-b border-white/5 last:border-0"
                      data-testid={`safe-balance-${idx}`}
                    >
                      <div>
                        <div className="font-semibold">{token.symbol}</div>
                        <div className="text-sm text-muted-foreground">
                          {token.amount.toLocaleString(undefined, { maximumFractionDigits: 4 })}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-semibold">
                          ${(token.usdValue || 0).toLocaleString()}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  No Safe balances available
                </div>
              )}
            </Card>
          )}
        </div>

        <div>
          <SectionHeader
            title="Off-Chain / Manual Entries"
            subtitle="Treasury data from Google Sheets"
          />
          {isLoadingSheets ? (
            <Skeleton className="h-64 rounded-2xl" />
          ) : (
            <Card className="rounded-2xl border border-white/10 bg-card/50 backdrop-blur-xl p-6">
              {sheetEntries && sheetEntries.length > 0 ? (
                <div className="space-y-4">
                  {sheetEntries.slice(0, 5).map((entry, idx) => (
                    <div
                      key={idx}
                      className="pb-3 border-b border-white/5 last:border-0"
                      data-testid={`sheet-entry-${idx}`}
                    >
                      <div className="flex items-start justify-between mb-1">
                        <div className="font-semibold">{entry.description}</div>
                        <div className="font-semibold text-right">
                          ${entry.amountUsd.toLocaleString()}
                        </div>
                      </div>
                      <div className="flex items-center justify-between text-sm text-muted-foreground">
                        <span>{entry.category}</span>
                        <span>{entry.date}</span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  No sheet entries available
                </div>
              )}
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}

import { useQuery } from "@tanstack/react-query";
import { Wallet, Coins, Image } from "lucide-react";
import { StatCard } from "@/components/StatCard";
import { AlertBanner } from "@/components/AlertBanner";
import { ExportDialog } from "@/components/ExportDialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { useTreasuryWebSocket } from "@/hooks/useTreasuryWebSocket";
import { NftCollectionsTab } from "@/components/tabs/NftCollectionsTab";
import { CryptoTab } from "@/components/tabs/CryptoTab";
import { MultiSigTab } from "@/components/tabs/MultiSigTab";
import { DaoWalletsTab } from "@/components/tabs/DaoWalletsTab";
import { TacticalWalletsTab } from "@/components/tabs/TacticalWalletsTab";
import type { TreasurySnapshot } from "@shared/treasury-types";

export default function Dashboard() {
  useTreasuryWebSocket();
  const { data: snapshot, isLoading: isLoadingSnapshot, error: snapshotError } = useQuery<TreasurySnapshot>({
    queryKey: ['/api/treasury/snapshots'],
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
      <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl sm:text-4xl font-bold font-heading mb-2">Treasury Dashboard</h1>
          <p className="text-muted-foreground">Real-time overview of KingDAO treasury assets</p>
        </div>
        <ExportDialog />
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

      <Tabs defaultValue="nft-collections" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2">
          <TabsTrigger value="nft-collections" data-testid="tab-trigger-nft-collections">
            NFT Collections
          </TabsTrigger>
          <TabsTrigger value="crypto" data-testid="tab-trigger-crypto">
            Crypto
          </TabsTrigger>
          <TabsTrigger value="multisig" data-testid="tab-trigger-multisig">
            Multi-Sig
          </TabsTrigger>
          <TabsTrigger value="dao-wallets" data-testid="tab-trigger-dao-wallets">
            DAO Wallets
          </TabsTrigger>
          <TabsTrigger value="tactical" data-testid="tab-trigger-tactical">
            Tactical
          </TabsTrigger>
        </TabsList>

        <TabsContent value="nft-collections" className="space-y-6">
          <NftCollectionsTab />
        </TabsContent>

        <TabsContent value="crypto" className="space-y-6">
          <CryptoTab 
            snapshot={snapshot}
            isLoadingSnapshot={isLoadingSnapshot}
            historicalSnapshots={historicalSnapshots}
            isLoadingHistory={isLoadingHistory}
          />
        </TabsContent>

        <TabsContent value="multisig" className="space-y-6">
          <MultiSigTab />
        </TabsContent>

        <TabsContent value="dao-wallets" className="space-y-6">
          <DaoWalletsTab />
        </TabsContent>

        <TabsContent value="tactical" className="space-y-6">
          <TacticalWalletsTab />
        </TabsContent>
      </Tabs>
    </div>
  );
}

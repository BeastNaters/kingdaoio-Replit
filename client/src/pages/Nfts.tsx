import { useQuery } from "@tanstack/react-query";
import { useAccount } from "wagmi";
import { NftGrid } from "@/components/NftGrid";
import { AlertBanner } from "@/components/AlertBanner";
import { Skeleton } from "@/components/ui/skeleton";
import type { NftHolding } from "@shared/treasury-types";

const KING_NFT_CONTRACT = "0x6E3a2e08A88186f41ECD90E0683d9cA0983a4328";

export default function Nfts() {
  const { address, isConnected } = useAccount();

  const { data: nfts, isLoading, error } = useQuery<NftHolding[]>({
    queryKey: ['/api/nfts/holdings', { wallet: address, contract: KING_NFT_CONTRACT }],
    enabled: isConnected && !!address,
    queryFn: async () => {
      const params = new URLSearchParams({
        wallet: address!,
        contract: KING_NFT_CONTRACT,
      });
      const response = await fetch(`/api/nfts/holdings?${params}`);
      if (!response.ok) {
        throw new Error('Failed to fetch NFTs');
      }
      return response.json();
    },
  });

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8" data-testid="page-nfts">
      <div className="mb-8">
        <h1 className="text-3xl sm:text-4xl font-bold font-heading mb-2">Your KING NFTs</h1>
        <p className="text-muted-foreground">
          {!isConnected 
            ? "Connect your wallet to view your KING NFTs" 
            : isLoading 
            ? "Loading..." 
            : `${nfts?.length || 0} KING NFT${nfts?.length === 1 ? '' : 's'} found in your wallet`}
        </p>
      </div>

      {!isConnected && (
        <div className="mb-6">
          <AlertBanner
            type="info"
            message="Please connect your wallet to view your KING NFT collection."
          />
        </div>
      )}

      {error && isConnected && (
        <div className="mb-6">
          <AlertBanner
            type="error"
            message="Failed to load NFT data. Please try again later."
          />
        </div>
      )}

      {isLoading && isConnected ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
            <Skeleton key={i} className="aspect-square rounded-2xl" />
          ))}
        </div>
      ) : isConnected ? (
        <NftGrid nfts={nfts || []} />
      ) : null}
    </div>
  );
}

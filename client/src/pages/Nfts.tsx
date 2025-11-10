import { useQuery } from "@tanstack/react-query";
import { NftGrid } from "@/components/NftGrid";
import { AlertBanner } from "@/components/AlertBanner";
import { Skeleton } from "@/components/ui/skeleton";
import type { NftHolding } from "@shared/treasury-types";

export default function Nfts() {
  const { data: nfts, isLoading, error } = useQuery<NftHolding[]>({
    queryKey: ['/api/nfts/holdings'],
  });

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8" data-testid="page-nfts">
      <div className="mb-8">
        <h1 className="text-3xl sm:text-4xl font-bold font-heading mb-2">Your NFT Collection</h1>
        <p className="text-muted-foreground">
          {isLoading ? "Loading..." : `${nfts?.length || 0} NFTs found in connected wallet`}
        </p>
      </div>

      {error && (
        <div className="mb-6">
          <AlertBanner
            type="error"
            message="Failed to load NFT data. Please try again later."
          />
        </div>
      )}

      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
            <Skeleton key={i} className="aspect-square rounded-2xl" />
          ))}
        </div>
      ) : (
        <NftGrid nfts={nfts || []} />
      )}
    </div>
  );
}

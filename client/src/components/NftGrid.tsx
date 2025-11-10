import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { NftHolding } from "@shared/treasury-types";

interface NftGridProps {
  nfts: NftHolding[];
}

export function NftGrid({ nfts }: NftGridProps) {
  if (nfts.length === 0) {
    return (
      <div className="text-center py-16" data-testid="empty-nft-state">
        <div className="mx-auto w-16 h-16 rounded-full bg-muted/20 flex items-center justify-center mb-4">
          <svg
            className="w-8 h-8 text-muted-foreground"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
            />
          </svg>
        </div>
        <h3 className="text-lg font-semibold text-foreground mb-2">No NFTs Found</h3>
        <p className="text-muted-foreground">This wallet doesn't hold any NFTs yet.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6" data-testid="grid-nfts">
      {nfts.map((nft, idx) => (
        <Card
          key={`${nft.collection}-${nft.tokenId}`}
          className="group overflow-hidden rounded-2xl border border-white/10 bg-card/50 backdrop-blur-xl transition-all hover:scale-105 hover:border-primary/30"
          data-testid={`card-nft-${idx}`}
        >
          <div className="aspect-square relative overflow-hidden bg-muted/20">
            {nft.image ? (
              <img
                src={nft.image}
                alt={`${nft.collection} #${nft.tokenId}`}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                <svg
                  className="w-16 h-16"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1}
                    d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                  />
                </svg>
              </div>
            )}
          </div>
          <div className="p-4">
            <h3 className="font-semibold text-foreground mb-1 truncate">
              {nft.collection}
            </h3>
            <p className="text-sm text-muted-foreground mb-3">#{nft.tokenId}</p>
            <div className="flex items-center justify-between gap-2">
              {nft.floorPrice !== undefined && (
                <Badge variant="outline" className="bg-accent/20 text-accent border-accent/30 rounded-full">
                  Floor: {nft.floorPrice} ETH
                </Badge>
              )}
              {nft.estimatedValueUsd !== undefined && (
                <span className="text-sm font-medium text-muted-foreground">
                  ~${nft.estimatedValueUsd.toLocaleString()}
                </span>
              )}
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
}

import { ExternalLink, Copy, CheckCircle2, Lightbulb } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { daoNftCollections } from "@shared/daoNfts";
import { useState } from "react";

export function NftCollectionsTab() {
  const [copiedAddress, setCopiedAddress] = useState<string | null>(null);

  const handleCopyAddress = (address: string) => {
    navigator.clipboard.writeText(address);
    setCopiedAddress(address);
    setTimeout(() => setCopiedAddress(null), 2000);
  };

  const shortenAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  const totalNfts = daoNftCollections.reduce((sum, collection) => sum + collection.tokenIds.length, 0);

  return (
    <div className="space-y-6" data-testid="tab-nft-collections">
      <div>
        <h2 className="text-2xl font-bold font-heading mb-2">DAO-Owned NFT Collections</h2>
        <p className="text-muted-foreground">
          These are collections held by the DAO. Values are estimated from floor price data.
        </p>
      </div>

      <Card className="rounded-2xl border border-primary/20 bg-gradient-to-br from-primary/10 to-primary/5 backdrop-blur-xl">
        <CardHeader>
          <CardTitle className="text-xl">Total NFT Collection Value</CardTitle>
          <CardDescription>
            Combined value across all {daoNftCollections.length} collections
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-baseline gap-2">
              <span className="text-4xl font-bold font-heading">{totalNfts}</span>
              <span className="text-muted-foreground">NFTs owned</span>
            </div>
            <div className="p-4 rounded-lg bg-muted/30 border border-muted flex gap-3">
              <Lightbulb className="w-4 h-4 text-primary shrink-0 mt-0.5" />
              <p className="text-sm text-muted-foreground">
                <strong>Integration Note:</strong> Connect to Dune Analytics floor price API 
                (<code className="text-xs bg-background/50 px-1 py-0.5 rounded">/api/dune/nft-floors</code>) 
                to calculate estimated USD value (floor price × quantity per collection).
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="space-y-4">
        {daoNftCollections.map((collection, idx) => (
          <Card 
            key={collection.contractAddress}
            className="rounded-2xl border border-white/10 bg-card/50 backdrop-blur-xl hover-elevate transition-all duration-200"
            data-testid={`collection-card-${idx}`}
          >
            <CardHeader>
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <CardTitle className="text-xl">{collection.name}</CardTitle>
                    <Badge variant="secondary" className="font-mono text-xs">
                      {collection.tokenIds.length} NFTs
                    </Badge>
                  </div>
                  <CardDescription>{collection.description}</CardDescription>
                </div>
                <div className="flex gap-2">
                  {collection.links.opensea && (
                    <Button
                      variant="outline"
                      size="sm"
                      asChild
                      data-testid={`button-opensea-${idx}`}
                    >
                      <a
                        href={collection.links.opensea}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2"
                      >
                        OpenSea
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    </Button>
                  )}
                  <Button
                    variant="outline"
                    size="sm"
                    asChild
                    data-testid={`button-etherscan-${idx}`}
                  >
                    <a
                      href={collection.links.etherscan}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2"
                    >
                      Etherscan
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">Contract:</span>
                  <code className="text-sm font-mono bg-muted/50 px-2 py-1 rounded">
                    {shortenAddress(collection.contractAddress)}
                  </code>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleCopyAddress(collection.contractAddress)}
                    data-testid={`button-copy-${idx}`}
                  >
                    {copiedAddress === collection.contractAddress ? (
                      <CheckCircle2 className="w-4 h-4 text-green-500" />
                    ) : (
                      <Copy className="w-4 h-4" />
                    )}
                  </Button>
                </div>

                <div className="p-4 rounded-lg bg-muted/30 border border-muted/50">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <div className="text-sm text-muted-foreground mb-1">NFTs Owned</div>
                      <div className="text-2xl font-bold font-heading">
                        {collection.tokenIds.length}
                      </div>
                    </div>
                    <div>
                      <div className="text-sm text-muted-foreground mb-1">Est. Floor Value</div>
                      <div className="text-sm text-muted-foreground italic">
                        Connect to floor price API
                      </div>
                    </div>
                  </div>
                </div>

                <details className="group">
                  <summary 
                    className="cursor-pointer text-sm text-muted-foreground hover:text-foreground transition-colors flex items-center gap-2"
                    data-testid={`toggle-token-ids-${idx}`}
                  >
                    <span>View all {collection.tokenIds.length} token IDs</span>
                    <span className="text-xs group-open:rotate-180 transition-transform">▼</span>
                  </summary>
                  <div className="mt-3 p-3 rounded-lg bg-muted/20 border border-muted/30 max-h-48 overflow-y-auto">
                    <div className="flex flex-wrap gap-2">
                      {collection.tokenIds.map((tokenId) => (
                        <Badge
                          key={tokenId}
                          variant="outline"
                          className="font-mono text-xs"
                        >
                          #{tokenId}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </details>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="rounded-2xl border border-white/10 bg-card/50 backdrop-blur-xl">
        <CardContent className="pt-6">
          <div className="space-y-2 text-sm text-muted-foreground">
            <p>
              <strong>Future Integration Points:</strong>
            </p>
            <ul className="list-disc list-inside space-y-1 ml-2">
              <li>
                <strong>Dune Analytics:</strong> Query NFT floor prices by contract address
              </li>
              <li>
                <strong>Supabase:</strong> Load collection metadata and token IDs from database instead of hardcoding
              </li>
              <li>
                <strong>Moralis:</strong> Fetch real-time NFT metadata and images for each token
              </li>
              <li>
                <strong>OpenSea API:</strong> Get collection stats, volume, and sales data
              </li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

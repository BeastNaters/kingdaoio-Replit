// TODO: Fetch per-wallet token/NFT balances via web3 APIs and roll into tactical total.
// 
// Integration approach:
// 1. For each tactical wallet address, query:
//    - ETH balance via RPC: provider.getBalance(address)
//    - ERC20 tokens via Alchemy/Moralis Token API
//    - NFT holdings via Alchemy NFT API or Moralis
// 2. Calculate USD value for all assets
// 3. Aggregate into total tactical wallet value
//
// Example Alchemy endpoints:
// - Token balances: https://eth-mainnet.g.alchemy.com/v2/YOUR-API-KEY (method: alchemy_getTokenBalances)
// - NFTs owned: https://eth-mainnet.g.alchemy.com/nft/v2/YOUR-API-KEY/getNFTs

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Zap, Lightbulb, ExternalLink, Copy, AlertCircle } from "lucide-react";
import { daoWallets } from "@shared/daoWallets";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

export function TacticalWalletsTab() {
  const { toast } = useToast();
  
  const tacticalWallets = daoWallets.tactical;
  
  // Mock balances - replace with real API call
  const mockBalances: Record<string, number> = {
    "0x1C0F0b94B3130Bd7F3c93417D4c19e9E80C56f74": 8500,
    "0x8CC04643143caFa204b2797459AA3cb82cd41283": 6200,
  };
  
  const totalValue = Object.values(mockBalances).reduce((sum, val) => sum + val, 0);

  const shortenAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copied to clipboard",
      description: `${label} address copied`,
    });
  };

  return (
    <div className="space-y-6" data-testid="tab-tactical-wallets">
      <div>
        <h2 className="text-2xl font-bold font-heading mb-2">DAO Tactical Wallets</h2>
        <p className="text-muted-foreground">
          These wallets are used for short-term mints, trades, and tactical operations. Values may fluctuate.
        </p>
      </div>

      <Card className="rounded-2xl border border-primary/20 bg-gradient-to-br from-primary/10 to-primary/5 backdrop-blur-xl">
        <CardHeader>
          <CardTitle className="text-xl flex items-center gap-2">
            <Zap className="w-5 h-5" />
            Total Tactical Wallet Value
          </CardTitle>
          <CardDescription>
            Combined value in operational and trading wallets
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-baseline gap-2">
              <span className="text-4xl font-bold font-heading" data-testid="value-tactical-total">
                ${totalValue.toLocaleString()}
              </span>
              <span className="text-muted-foreground">USD</span>
            </div>
            <div className="p-4 rounded-lg bg-muted/30 border border-muted flex gap-3">
              <Lightbulb className="w-4 h-4 text-primary shrink-0 mt-0.5" />
              <div>
                <p className="text-sm text-muted-foreground">
                  <strong>Mock Data:</strong> Using placeholder balances. Integrate with Web3 APIs to track:
                </p>
                <ul className="list-disc list-inside text-sm text-muted-foreground mt-2 ml-2 space-y-1">
                  <li>ETH and token balances (Alchemy, Moralis)</li>
                  <li>NFT holdings per wallet</li>
                  <li>Real-time USD valuations</li>
                </ul>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="p-4 rounded-lg bg-accent/10 border border-accent/20 flex gap-3">
        <AlertCircle className="w-5 h-5 text-accent shrink-0 mt-0.5" />
        <div>
          <p className="text-sm font-medium text-accent">Volatile Wallets</p>
          <p className="text-sm text-muted-foreground mt-1">
            Tactical wallets are used for short-term operations including NFT mints, DeFi trades, and strategic acquisitions. 
            Balances may change frequently and should be monitored in real-time.
          </p>
        </div>
      </div>

      <Card className="rounded-2xl border border-white/10 bg-card/50 backdrop-blur-xl">
        <CardHeader>
          <CardTitle>Tactical Wallets</CardTitle>
          <CardDescription>Operational wallets with placeholder balances</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {tacticalWallets.map((wallet, index) => (
              <div
                key={wallet.address}
                className="p-4 rounded-lg border border-border bg-background/50 hover-elevate active-elevate-2"
                data-testid={`tactical-wallet-${index}`}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="font-semibold text-lg">{wallet.label}</h3>
                      <span className="text-xs px-2 py-0.5 rounded bg-accent/10 text-accent border border-accent/20">
                        Tactical
                      </span>
                    </div>
                    
                    <div className="flex items-center gap-2 mb-3">
                      <code className="text-sm text-muted-foreground font-mono">
                        {shortenAddress(wallet.address)}
                      </code>
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => copyToClipboard(wallet.address, wallet.label)}
                        data-testid={`button-copy-${index}`}
                      >
                        <Copy className="w-3 h-3" />
                      </Button>
                      <a
                        href={`https://etherscan.io/address/${wallet.address}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        data-testid={`link-etherscan-${index}`}
                      >
                        <Button size="icon" variant="ghost">
                          <ExternalLink className="w-3 h-3" />
                        </Button>
                      </a>
                    </div>

                    <div className="flex items-baseline gap-2">
                      <span className="text-sm text-muted-foreground">Current Balance:</span>
                      <span className="text-lg font-bold font-heading">
                        ${mockBalances[wallet.address]?.toLocaleString() || '0'}
                      </span>
                      <span className="text-sm text-muted-foreground">USD (mock)</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

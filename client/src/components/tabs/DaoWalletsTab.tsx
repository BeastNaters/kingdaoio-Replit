// TODO: Integrate with on-chain RPC for ETH wallet balances and Solana RPC for SOL wallets
// 
// For Ethereum wallets:
// - Use ethers.js / viem to query balance via RPC: provider.getBalance(address)
// - Fetch ERC20 token balances via Alchemy Token API: https://docs.alchemy.com/reference/alchemy-gettokenbalances
// - Or use Moralis: https://docs.moralis.io/web3-data-api/evm/reference/get-wallet-token-balances
//
// For Solana wallet (Controller SOL):
// - This wallet is on Solana; integrate with Solana RPC / Helius / QuickNode
// - Solana RPC endpoint: https://api.mainnet-beta.solana.com
// - Get SOL balance: connection.getBalance(new PublicKey(address))
// - Get SPL tokens: connection.getParsedTokenAccountsByOwner()
// - Recommended: Use Helius API for easier token metadata: https://docs.helius.dev/

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Wallet, Lightbulb, ExternalLink, Copy } from "lucide-react";
import { daoWallets } from "@shared/daoWallets";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

export function DaoWalletsTab() {
  const { toast } = useToast();
  
  const controllerWallets = daoWallets.controller;
  
  // Mock balances - replace with real API call
  const mockBalances: Record<string, number> = {
    "0xd8a7113a701a4eccc5f8aa85a621ac42104d6eb8": 85000,
    "Gok7zfZ2aZ6ftvYtXhRR2KR8dzu2cKZLDeqvDhNQvipT": 42000,
    "0xB26ACB02661620C7533A20CC709afDECFe3b94DB": 18000,
    "0x17c08C6445401736A31f50aFbCca7258623F0Cfb": 12000,
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

  const getExplorerUrl = (address: string, chain?: string) => {
    if (chain === 'SOL') {
      return `https://solscan.io/account/${address}`;
    }
    return `https://etherscan.io/address/${address}`;
  };

  return (
    <div className="space-y-6" data-testid="tab-dao-wallets">
      <div>
        <h2 className="text-2xl font-bold font-heading mb-2">DAO Wallets</h2>
        <p className="text-muted-foreground">
          Primary DAO-controlled wallets (Controller, Deployer, and Developer wallets).
        </p>
      </div>

      <Card className="rounded-2xl border border-primary/20 bg-gradient-to-br from-primary/10 to-primary/5 backdrop-blur-xl">
        <CardHeader>
          <CardTitle className="text-xl flex items-center gap-2">
            <Wallet className="w-5 h-5" />
            Total DAO Wallet Value
          </CardTitle>
          <CardDescription>
            Combined value across all controller and operational wallets
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-baseline gap-2">
              <span className="text-4xl font-bold font-heading" data-testid="value-dao-wallets-total">
                ${totalValue.toLocaleString()}
              </span>
              <span className="text-muted-foreground">USD</span>
            </div>
            <div className="p-4 rounded-lg bg-muted/30 border border-muted flex gap-3">
              <Lightbulb className="w-4 h-4 text-primary shrink-0 mt-0.5" />
              <div>
                <p className="text-sm text-muted-foreground">
                  <strong>Mock Data:</strong> Using placeholder balances. Integrate with:
                </p>
                <ul className="list-disc list-inside text-sm text-muted-foreground mt-2 ml-2 space-y-1">
                  <li>Ethereum RPC or Alchemy/Moralis for ETH wallets</li>
                  <li>Solana RPC, Helius, or QuickNode for SOL wallet</li>
                  <li>Token balance APIs for ERC20/SPL tokens</li>
                </ul>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="rounded-2xl border border-white/10 bg-card/50 backdrop-blur-xl">
        <CardHeader>
          <CardTitle>Controller & Operational Wallets</CardTitle>
          <CardDescription>Core DAO wallets with placeholder balances</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {controllerWallets.map((wallet, index) => (
              <div
                key={wallet.address}
                className="p-4 rounded-lg border border-border bg-background/50 hover-elevate active-elevate-2"
                data-testid={`dao-wallet-${index}`}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="font-semibold text-lg">{wallet.label}</h3>
                      <span 
                        className={`text-xs px-2 py-0.5 rounded border ${
                          wallet.chain === 'SOL' 
                            ? 'bg-accent/10 text-accent border-accent/20' 
                            : 'bg-primary/10 text-primary border-primary/20'
                        }`}
                      >
                        {wallet.chain}
                      </span>
                    </div>
                    
                    {wallet.chain === 'SOL' && (
                      <div className="p-3 mb-3 rounded bg-accent/5 border border-accent/20 flex gap-2">
                        <Lightbulb className="w-4 h-4 text-accent shrink-0 mt-0.5" />
                        <p className="text-xs text-muted-foreground">
                          <strong>Solana Wallet:</strong> Integrate with Solana RPC, Helius, or QuickNode for balance and SPL token data.
                        </p>
                      </div>
                    )}
                    
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
                        href={getExplorerUrl(wallet.address, wallet.chain)}
                        target="_blank"
                        rel="noopener noreferrer"
                        data-testid={`link-explorer-${index}`}
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

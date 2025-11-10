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
import { Wallet, Lightbulb } from "lucide-react";
import { daoWallets } from "@shared/daoWallets";
import { WalletCard } from "@/components/WalletCard";
import { getMockBalance, formatMockBalance } from "@shared/mockData";

export function DaoWalletsTab() {
  const controllerWallets = daoWallets.controller;
  
  const totalValue = controllerWallets.reduce((sum, wallet) => sum + getMockBalance(wallet.address), 0);

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

      <div className="grid gap-4">
        {controllerWallets.map((wallet) => (
          <div key={wallet.address} className="space-y-3">
            {wallet.chain === 'SOL' && (
              <div className="p-3 rounded bg-accent/5 border border-accent/20 flex gap-2">
                <Lightbulb className="w-4 h-4 text-accent shrink-0 mt-0.5" />
                <p className="text-xs text-muted-foreground">
                  <strong>Solana Wallet:</strong> Integrate with Solana RPC, Helius, or QuickNode for balance and SPL token data.
                </p>
              </div>
            )}
            <WalletCard
              label={wallet.label}
              address={wallet.address}
              chain={wallet.chain}
              balance={formatMockBalance(getMockBalance(wallet.address), wallet.chain)}
              balanceUsd={getMockBalance(wallet.address)}
            />
          </div>
        ))}
      </div>
    </div>
  );
}

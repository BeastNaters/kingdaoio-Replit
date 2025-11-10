// TODO: integrate with Gnosis Safe Transaction Service or onchain balance fetch
// endpoint: https://safe-transaction-mainnet.safe.global/api/v1/safes/{address}/balances/usd/
// For each Safe address, call this endpoint to get real-time balance data
// Example response:
// [
//   {
//     "tokenAddress": "0x0000000000000000000000000000000000000000",
//     "token": null,
//     "balance": "1000000000000000000",
//     "fiatBalance": "3400.00",
//     "fiatConversion": "3400.00"
//   }
// ]

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Shield, Lightbulb } from "lucide-react";
import { daoWallets } from "@shared/daoWallets";
import { WalletCard } from "@/components/WalletCard";
import { getMockBalance, formatMockBalance } from "@shared/mockData";

export function MultiSigTab() {
  const multiSigWallets = daoWallets.multisigs;
  
  const totalValue = multiSigWallets.reduce((sum, wallet) => sum + getMockBalance(wallet.address), 0);

  return (
    <div className="space-y-6" data-testid="tab-multisig">
      <div>
        <h2 className="text-2xl font-bold font-heading mb-2">Multi-Sig Wallets</h2>
        <p className="text-muted-foreground">
          Gnosis Safe multi-signature wallets controlled by the DAO.
        </p>
      </div>

      <Card className="rounded-2xl border border-primary/20 bg-gradient-to-br from-primary/10 to-primary/5 backdrop-blur-xl">
        <CardHeader>
          <CardTitle className="text-xl flex items-center gap-2">
            <Shield className="w-5 h-5" />
            Total Multi-Sig Value
          </CardTitle>
          <CardDescription>
            Combined value across all Gnosis Safe wallets
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-baseline gap-2">
              <span className="text-4xl font-bold font-heading" data-testid="value-multisig-total">
                ${totalValue.toLocaleString()}
              </span>
              <span className="text-muted-foreground">USD</span>
            </div>
            <div className="p-4 rounded-lg bg-muted/30 border border-muted flex gap-3">
              <Lightbulb className="w-4 h-4 text-primary shrink-0 mt-0.5" />
              <div>
                <p className="text-sm text-muted-foreground">
                  <strong>Mock Data:</strong> Using placeholder balances. Integrate with Gnosis Safe Transaction Service:
                </p>
                <code className="block text-xs bg-background/50 px-2 py-1 rounded mt-2 font-mono">
                  GET https://safe-transaction-mainnet.safe.global/api/v1/safes/{"{address}"}/balances/usd/
                </code>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-4">
        {multiSigWallets.map((wallet) => (
          <WalletCard
            key={wallet.address}
            label={wallet.label}
            address={wallet.address}
            chain={wallet.chain}
            balance={formatMockBalance(getMockBalance(wallet.address), wallet.chain)}
            balanceUsd={getMockBalance(wallet.address)}
          />
        ))}
      </div>
    </div>
  );
}

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
import { Shield, Lightbulb, ExternalLink, Copy } from "lucide-react";
import { daoWallets } from "@shared/daoWallets";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

export function MultiSigTab() {
  const { toast } = useToast();
  
  const multiSigWallets = daoWallets.multisigs;
  
  // Mock balances - replace with real API call
  const mockBalances: Record<string, number> = {
    "0xde27cbE0DdfaDF1C8C27fC8e43f7e713DD1B23cF": 125000,
    "0x24901F1b9b41e853778107CD737cC426b456fC95": 45000,
    "0x00239b99703b773B0A1B6A33f4691867aF071d5A": 30000,
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

      <Card className="rounded-2xl border border-white/10 bg-card/50 backdrop-blur-xl">
        <CardHeader>
          <CardTitle>Safe Wallets</CardTitle>
          <CardDescription>Multi-sig wallets with placeholder balances</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {multiSigWallets.map((wallet, index) => (
              <div
                key={wallet.address}
                className="p-4 rounded-lg border border-border bg-background/50 hover-elevate active-elevate-2"
                data-testid={`multisig-wallet-${index}`}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="font-semibold text-lg">{wallet.label}</h3>
                      <span className="text-xs px-2 py-0.5 rounded bg-primary/10 text-primary border border-primary/20">
                        Gnosis Safe
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

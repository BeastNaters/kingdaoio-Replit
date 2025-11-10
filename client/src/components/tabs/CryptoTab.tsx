import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Coins } from "lucide-react";

export function CryptoTab() {
  return (
    <div className="space-y-6" data-testid="tab-crypto">
      <div>
        <h2 className="text-2xl font-bold font-heading mb-2">Crypto Holdings</h2>
        <p className="text-muted-foreground">
          Cryptocurrency and token holdings across all DAO wallets.
        </p>
      </div>

      <Card className="rounded-2xl border border-primary/20 bg-gradient-to-br from-primary/10 to-primary/5 backdrop-blur-xl">
        <CardHeader>
          <CardTitle className="text-xl flex items-center gap-2">
            <Coins className="w-5 h-5" />
            Total Crypto Holdings
          </CardTitle>
          <CardDescription>
            Combined value of all cryptocurrency assets
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-baseline gap-2">
              <span className="text-4xl font-bold font-heading">$--</span>
              <span className="text-muted-foreground">USD</span>
            </div>
            <div className="p-4 rounded-lg bg-muted/30 border border-muted">
              <p className="text-sm text-muted-foreground">
                💡 <strong>Integration Required:</strong> Aggregate token balances from:
              </p>
              <ul className="list-disc list-inside text-sm text-muted-foreground mt-2 ml-2 space-y-1">
                <li>Gnosis Safe multi-sig wallets</li>
                <li>DAO treasury wallets</li>
                <li>Tactical operation wallets</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="rounded-2xl border border-white/10 bg-card/50 backdrop-blur-xl">
        <CardHeader>
          <CardTitle>Token Breakdown</CardTitle>
          <CardDescription>Placeholder for token holdings table</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/10">
                  <th className="text-left py-3 px-4 text-sm font-semibold">Token</th>
                  <th className="text-right py-3 px-4 text-sm font-semibold">Amount</th>
                  <th className="text-right py-3 px-4 text-sm font-semibold">USD Value</th>
                  <th className="text-right py-3 px-4 text-sm font-semibold">Source</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td colSpan={4} className="text-center py-8 text-muted-foreground">
                    No data available. Connect to treasury API endpoints.
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Wallet, Lightbulb } from "lucide-react";

export function DaoWalletsTab() {
  return (
    <div className="space-y-6" data-testid="tab-dao-wallets">
      <div>
        <h2 className="text-2xl font-bold font-heading mb-2">DAO Wallets</h2>
        <p className="text-muted-foreground">
          Primary DAO-controlled Ethereum wallets (EOAs and contracts).
        </p>
      </div>

      <Card className="rounded-2xl border border-primary/20 bg-gradient-to-br from-primary/10 to-primary/5 backdrop-blur-xl">
        <CardHeader>
          <CardTitle className="text-xl flex items-center gap-2">
            <Wallet className="w-5 h-5" />
            Total DAO Wallet Value
          </CardTitle>
          <CardDescription>
            Combined value across all DAO-controlled wallets
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-baseline gap-2">
              <span className="text-4xl font-bold font-heading">$--</span>
              <span className="text-muted-foreground">USD</span>
            </div>
            <div className="p-4 rounded-lg bg-muted/30 border border-muted flex gap-3">
              <Lightbulb className="w-4 h-4 text-primary shrink-0 mt-0.5" />
              <div>
                <p className="text-sm text-muted-foreground">
                  <strong>Integration Required:</strong> Query balances for known DAO wallet addresses:
                </p>
                <ul className="list-disc list-inside text-sm text-muted-foreground mt-2 ml-2 space-y-1">
                  <li>Fetch token balances via Moralis API</li>
                  <li>Query NFT holdings per wallet</li>
                  <li>Calculate total USD value</li>
                </ul>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="rounded-2xl border border-white/10 bg-card/50 backdrop-blur-xl">
        <CardHeader>
          <CardTitle>DAO Wallet Addresses</CardTitle>
          <CardDescription>Configure wallet addresses in Admin Panel</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            No DAO wallet addresses configured. Add addresses in the Admin Panel under "Treasury Wallets".
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

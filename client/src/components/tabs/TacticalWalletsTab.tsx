import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Zap } from "lucide-react";

export function TacticalWalletsTab() {
  return (
    <div className="space-y-6" data-testid="tab-tactical-wallets">
      <div>
        <h2 className="text-2xl font-bold font-heading mb-2">DAO Tactical Wallets</h2>
        <p className="text-muted-foreground">
          Short-term or tactical wallets used for trades, mints, and operational activities.
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
              <span className="text-4xl font-bold font-heading">$--</span>
              <span className="text-muted-foreground">USD</span>
            </div>
            <div className="p-4 rounded-lg bg-muted/30 border border-muted">
              <p className="text-sm text-muted-foreground">
                💡 <strong>Integration Required:</strong> Track tactical wallet activities:
              </p>
              <ul className="list-disc list-inside text-sm text-muted-foreground mt-2 ml-2 space-y-1">
                <li>Trading wallets for DeFi operations</li>
                <li>Mint wallets for NFT acquisitions</li>
                <li>Operational wallets for gas and utilities</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="rounded-2xl border border-white/10 bg-card/50 backdrop-blur-xl">
        <CardHeader>
          <CardTitle>Tactical Operations</CardTitle>
          <CardDescription>Recent activity from tactical wallets</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            No tactical wallet data available. Configure wallet addresses and tracking in Admin Panel.
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

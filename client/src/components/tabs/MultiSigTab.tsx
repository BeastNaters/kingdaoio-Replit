import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Shield } from "lucide-react";

export function MultiSigTab() {
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
              <span className="text-4xl font-bold font-heading">$--</span>
              <span className="text-muted-foreground">USD</span>
            </div>
            <div className="p-4 rounded-lg bg-muted/30 border border-muted">
              <p className="text-sm text-muted-foreground">
                💡 <strong>Integration Required:</strong> Fetch balances from Gnosis Safe Transaction Service API:
              </p>
              <code className="block text-xs bg-background/50 px-2 py-1 rounded mt-2 font-mono">
                /api/treasury/safe
              </code>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="rounded-2xl border border-white/10 bg-card/50 backdrop-blur-xl">
        <CardHeader>
          <CardTitle>Safe Wallets</CardTitle>
          <CardDescription>List of multi-sig wallets and their balances</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="text-center py-8 text-muted-foreground">
              No Safe addresses configured. Add Safe addresses in the Admin Panel.
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

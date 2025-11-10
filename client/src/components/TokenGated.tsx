import { Shield } from "lucide-react";
import { Card } from "@/components/ui/card";
import { WalletConnect } from "./WalletConnect";

export function TokenGated() {
  return (
    <div className="min-h-[80vh] flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <Card className="relative overflow-hidden rounded-2xl border border-white/10 bg-card/50 backdrop-blur-xl p-8 text-center" data-testid="card-token-gated">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-accent/10" />
          
          <div className="relative z-10">
            <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-primary/20 to-accent/20 ring-4 ring-primary/10">
              <Shield className="h-10 w-10 text-primary" />
            </div>

            <h2 className="text-2xl font-bold font-heading mb-3 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              Kong NFT Required
            </h2>

            <p className="text-muted-foreground mb-6 leading-relaxed">
              This area is restricted to holders of the official Kong NFT. Connect a wallet that holds a Kong NFT to access the dashboard.
            </p>

            <div className="space-y-3">
              <WalletConnect />

              <p className="text-xs text-muted-foreground">
                Contract: <span className="font-mono">0x6E3a...4328</span>
              </p>
            </div>
          </div>

          <div className="absolute -bottom-24 -right-24 h-48 w-48 rounded-full bg-primary/10 blur-3xl" />
          <div className="absolute -top-24 -left-24 h-48 w-48 rounded-full bg-accent/10 blur-3xl" />
        </Card>
      </div>
    </div>
  );
}

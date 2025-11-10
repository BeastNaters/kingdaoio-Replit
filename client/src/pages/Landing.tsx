import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { TrendingUp, Shield, Users } from "lucide-react";
import { WalletConnect } from "@/components/WalletConnect";

export default function Landing() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <section className="min-h-screen flex items-center justify-center relative overflow-hidden">
          <div className="absolute inset-0">
            <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl animate-pulse" />
            <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-accent/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
          </div>

          <div className="relative z-10 text-center max-w-4xl mx-auto py-20">
            <div className="mb-8 inline-block">
              <div className="flex h-20 w-20 mx-auto items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-accent p-1">
                <div className="h-full w-full rounded-xl bg-background flex items-center justify-center">
                  <span className="text-4xl font-bold font-heading bg-gradient-to-br from-primary to-accent bg-clip-text text-transparent">
                    K
                  </span>
                </div>
              </div>
            </div>

            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold font-heading mb-6 bg-gradient-to-r from-primary via-purple-400 to-accent bg-clip-text text-transparent leading-tight" data-testid="text-hero-title">
              KingDAO Treasury Dashboard
            </h1>

            <p className="text-lg sm:text-xl text-slate-300 mb-12 max-w-2xl mx-auto leading-relaxed">
              Real-time, token-gated treasury visibility for Kong NFT holders. Track DAO assets, multi-sig wallets, and community governance.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <WalletConnect />

              <Link href="/dashboard">
                <div>
                  <Button
                    variant="outline"
                    size="lg"
                    className="text-lg px-8 py-6 backdrop-blur-sm"
                    data-testid="button-enter-dashboard"
                  >
                    Enter Dashboard
                  </Button>
                </div>
              </Link>
            </div>

            <div className="mt-20 grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="rounded-2xl border border-white/10 bg-card/30 backdrop-blur-xl p-6 hover-elevate">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 mb-4">
                  <TrendingUp className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-lg font-semibold font-heading mb-2">Multi-Source Aggregation</h3>
                <p className="text-muted-foreground text-sm">
                  Real-time data from Gnosis Safe, Dune Analytics, and on-chain sources
                </p>
              </div>

              <div className="rounded-2xl border border-white/10 bg-card/30 backdrop-blur-xl p-6 hover-elevate">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-accent/10 mb-4">
                  <Shield className="h-6 w-6 text-accent" />
                </div>
                <h3 className="text-lg font-semibold font-heading mb-2">Token-Gated Access</h3>
                <p className="text-muted-foreground text-sm">
                  Exclusive access for Kong NFT holders verified on Ethereum mainnet
                </p>
              </div>

              <div className="rounded-2xl border border-white/10 bg-card/30 backdrop-blur-xl p-6 hover-elevate">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-chart-3/10 mb-4">
                  <Users className="h-6 w-6 text-chart-3" />
                </div>
                <h3 className="text-lg font-semibold font-heading mb-2">Community Governance</h3>
                <p className="text-muted-foreground text-sm">
                  Track Snapshot proposals and Discord announcements in one place
                </p>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}

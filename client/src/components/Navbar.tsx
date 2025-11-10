import { Link, useLocation } from "wouter";
import { Wallet } from "lucide-react";
import { Button } from "@/components/ui/button";

export function Navbar() {
  const [location] = useLocation();

  const navLinks = [
    { href: "/dashboard", label: "Dashboard" },
    { href: "/nfts", label: "NFTs" },
    { href: "/community", label: "Community" },
  ];

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-white/5 bg-background/80 backdrop-blur-md">
      <div className="container mx-auto flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-8">
          <Link href="/">
            <a className="flex items-center gap-2" data-testid="link-home">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-primary to-accent">
                <span className="text-lg font-bold font-heading text-white">K</span>
              </div>
              <span className="text-xl font-bold font-heading hidden sm:inline">KingDAO</span>
            </a>
          </Link>

          {location !== "/" && (
            <div className="hidden md:flex items-center gap-1">
              {navLinks.map((link) => (
                <Link key={link.href} href={link.href}>
                  <a
                    className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                      location === link.href
                        ? "text-foreground bg-white/5"
                        : "text-muted-foreground hover-elevate"
                    }`}
                    data-testid={`link-nav-${link.label.toLowerCase()}`}
                  >
                    {link.label}
                  </a>
                </Link>
              ))}
            </div>
          )}
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="default"
            className="gap-2"
            data-testid="button-connect-wallet"
          >
            <Wallet className="h-4 w-4" />
            <span className="hidden sm:inline">Connect Wallet</span>
          </Button>
        </div>
      </div>
    </nav>
  );
}

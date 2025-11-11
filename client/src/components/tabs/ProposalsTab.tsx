import { useQuery } from "@tanstack/react-query";
import { AlertBanner } from "@/components/AlertBanner";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ProposalVoting } from "@/components/ProposalVoting";
import { ExternalLink } from "lucide-react";
import type { SnapshotProposal } from "@shared/treasury-types";

export function ProposalsTab() {
  const { data: proposals, isLoading: isLoadingProposals, error: proposalsError } = useQuery<SnapshotProposal[]>({
    queryKey: ['/api/snapshot/proposals'],
  });

  const getStateColor = (state: string) => {
    switch (state) {
      case 'active':
        return 'bg-green-500/20 text-green-400 border-green-400/30';
      case 'closed':
        return 'bg-slate-500/20 text-slate-400 border-slate-400/30';
      case 'pending':
        return 'bg-yellow-500/20 text-yellow-400 border-yellow-400/30';
      default:
        return 'bg-muted/20 text-muted-foreground border-muted/30';
    }
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp * 1000).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  return (
    <div>
      {proposalsError && (
        <div className="mb-6">
          <AlertBanner
            type="error"
            message="Failed to load Snapshot proposals. Please try again later."
          />
        </div>
      )}

      {isLoadingProposals ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-32 rounded-2xl" />
          ))}
        </div>
      ) : proposals && proposals.length > 0 ? (
        <div className="space-y-4">
          {proposals.map((proposal) => (
            <Card
              key={proposal.id}
              className="rounded-2xl border border-white/10 bg-card/50 backdrop-blur-xl p-6"
              data-testid={`card-proposal-${proposal.id}`}
            >
              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-4">
                <div className="flex-1">
                  <div className="flex items-start gap-3 mb-2">
                    <h3 className="text-lg font-semibold font-heading flex-1">
                      {proposal.title}
                    </h3>
                    <Badge
                      variant="outline"
                      className={`${getStateColor(proposal.state)} rounded-full uppercase text-xs`}
                    >
                      {proposal.state}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <span>Start: {formatDate(proposal.start)}</span>
                    <span>•</span>
                    <span>End: {formatDate(proposal.end)}</span>
                  </div>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  className="gap-2 backdrop-blur-sm"
                  asChild
                >
                  <a
                    href={proposal.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    data-testid={`button-view-proposal-${proposal.id}`}
                  >
                    View on Snapshot
                    <ExternalLink className="h-3 w-3" />
                  </a>
                </Button>
              </div>
              
              <ProposalVoting proposal={proposal} />
            </Card>
          ))}
        </div>
      ) : (
        <Card className="rounded-2xl border border-white/10 bg-card/50 backdrop-blur-xl p-12 text-center">
          <p className="text-muted-foreground">No proposals found</p>
        </Card>
      )}
    </div>
  );
}

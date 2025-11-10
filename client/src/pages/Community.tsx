import { useQuery } from "@tanstack/react-query";
import { SectionHeader } from "@/components/SectionHeader";
import { AlertBanner } from "@/components/AlertBanner";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ProposalVoting } from "@/components/ProposalVoting";
import { ExternalLink, MessageSquare } from "lucide-react";
import type { SnapshotProposal, DiscordAnnouncement } from "@shared/treasury-types";

export default function Community() {
  const { data: proposals, isLoading: isLoadingProposals, error: proposalsError } = useQuery<SnapshotProposal[]>({
    queryKey: ['/api/snapshot/proposals'],
  });

  const { data: announcements, isLoading: isLoadingAnnouncements } = useQuery<DiscordAnnouncement[]>({
    queryKey: ['/api/discord/announcements'],
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
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8" data-testid="page-community">
      <div className="mb-8">
        <h1 className="text-3xl sm:text-4xl font-bold font-heading mb-2">Community Hub</h1>
        <p className="text-muted-foreground">Governance proposals and Discord announcements</p>
      </div>

      <div className="mb-12">
        <SectionHeader
          title="Snapshot Proposals"
          subtitle="kongsdao.eth governance votes"
        />

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

      <div>
        <SectionHeader
          title="Discord Announcements"
          subtitle="Latest updates from the community"
        />

        {isLoadingAnnouncements ? (
          <div className="space-y-4">
            {[1, 2, 3, 4].map((i) => (
              <Skeleton key={i} className="h-24 rounded-2xl" />
            ))}
          </div>
        ) : announcements && announcements.length > 0 ? (
          <div className="space-y-4">
            {announcements.map((announcement) => (
              <Card
                key={announcement.id}
                className="rounded-2xl border border-white/10 bg-card/50 backdrop-blur-xl p-6"
                data-testid={`card-announcement-${announcement.id}`}
              >
                <div className="flex items-start gap-4">
                  <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-accent/10">
                    <MessageSquare className="h-5 w-5 text-accent" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <h3 className="font-semibold font-heading">{announcement.title}</h3>
                      <span className="text-xs text-muted-foreground whitespace-nowrap">
                        {new Date(announcement.timestamp).toLocaleDateString()}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground mb-2">
                      {announcement.content}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Posted by {announcement.author}
                    </p>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        ) : (
          <Card className="rounded-2xl border border-white/10 bg-card/50 backdrop-blur-xl p-12 text-center">
            <p className="text-muted-foreground">No announcements available</p>
          </Card>
        )}
      </div>
    </div>
  );
}

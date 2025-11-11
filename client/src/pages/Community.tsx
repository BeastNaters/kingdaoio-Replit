import { useState, useEffect, useRef } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useAccount } from "wagmi";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { SectionHeader } from "@/components/SectionHeader";
import { AlertBanner } from "@/components/AlertBanner";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import { ProposalVoting } from "@/components/ProposalVoting";
import { ExternalLink, MessageSquare, Send } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { io, Socket } from "socket.io-client";
import type { SnapshotProposal, DiscordAnnouncementResponse } from "@shared/treasury-types";
import type { CommunityMessage } from "@shared/schema";

export default function Community() {
  const { address, isConnected } = useAccount();
  const { toast } = useToast();
  const [newMessage, setNewMessage] = useState('');
  const [socketConnected, setSocketConnected] = useState(false);
  const socketRef = useRef<Socket | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const { data: proposals, isLoading: isLoadingProposals, error: proposalsError } = useQuery<SnapshotProposal[]>({
    queryKey: ['/api/snapshot/proposals'],
  });

  const { data: announcementResponse, isLoading: isLoadingAnnouncements } = useQuery<DiscordAnnouncementResponse>({
    queryKey: ['/api/discord/announcements'],
  });

  const { data: messagesData, isLoading: isLoadingMessages } = useQuery<{success: boolean, data: CommunityMessage[]}>({
    queryKey: ['/api/community/messages', 'general'],
    enabled: isConnected,
    staleTime: 30000,
    refetchInterval: 60000,
  });

  const announcements = announcementResponse?.data || [];
  const isAnnouncementsMock = announcementResponse?.isMock || false;
  const messages = messagesData?.data || [];

  useEffect(() => {
    const socket = io();
    socketRef.current = socket;

    socket.on('connect', () => setSocketConnected(true));
    socket.on('disconnect', () => setSocketConnected(false));
    socket.on('community:new-message', (data: { channel: string, message: CommunityMessage }) => {
      if (data.channel === 'general') {
        queryClient.invalidateQueries({ queryKey: ['/api/community/messages', 'general'] });
      }
    });

    return () => socket.disconnect();
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const postMessageMutation = useMutation({
    mutationFn: async (message: string) => {
      return apiRequest('/api/community/messages', {
        method: 'POST',
        body: JSON.stringify({
          walletAddress: address,
          message,
          channel: 'general',
          username: address ? `${address.slice(0, 6)}...${address.slice(-4)}` : undefined,
        }),
      });
    },
    onSuccess: () => {
      setNewMessage('');
      queryClient.invalidateQueries({ queryKey: ['/api/community/messages', 'general'] });
      toast({ title: 'Message posted', description: 'Your message has been shared with the community.' });
    },
    onError: (error: any) => {
      const errorData = error.response?.data || error;
      toast({
        title: errorData.retryAfter ? 'Rate limit exceeded' : error.status === 403 ? 'Access denied' : 'Failed to post message',
        description: errorData.retryAfter ? `Please wait ${errorData.retryAfter} seconds` : errorData.message || 'Please try again',
        variant: 'destructive',
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !isConnected) return;
    postMessageMutation.mutate(newMessage.trim());
  };

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

      <div className="mb-12">
        <SectionHeader
          title="Community Chat"
          subtitle="Connect with fellow Kong holders (Discord fallback)"
        />

        {!isConnected && (
          <div className="mb-6">
            <AlertBanner
              type="info"
              message="Connect your wallet to participate in community chat."
            />
          </div>
        )}

        <Card className="rounded-2xl border border-white/10 bg-card/50 backdrop-blur-xl overflow-hidden">
          <div className="h-96 flex flex-col">
            <div className="flex-1 overflow-y-auto p-6 space-y-4" data-testid="chat-messages-container">
              {isLoadingMessages ? (
                <div className="space-y-3">
                  {[1, 2, 3].map((i) => (
                    <Skeleton key={i} className="h-16 rounded-lg" />
                  ))}
                </div>
              ) : messages.length > 0 ? (
                messages.map((msg) => (
                  <div
                    key={msg.id}
                    className="rounded-lg border border-white/5 bg-background/30 p-3"
                    data-testid={`message-${msg.id}`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-medium text-accent">
                        {msg.username || `${msg.walletAddress.slice(0, 6)}...${msg.walletAddress.slice(-4)}`}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {new Date(msg.createdAt).toLocaleTimeString()}
                      </span>
                    </div>
                    <p className="text-sm text-foreground">{msg.message}</p>
                  </div>
                ))
              ) : (
                <div className="flex items-center justify-center h-full text-muted-foreground">
                  <p>No messages yet. Be the first to say hello!</p>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            <div className="border-t border-white/10 p-4">
              <form onSubmit={handleSubmit} className="flex gap-2">
                <Textarea
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder={isConnected ? "Type your message..." : "Connect wallet to post"}
                  disabled={!isConnected || postMessageMutation.isPending}
                  className="resize-none min-h-0 h-10"
                  maxLength={1000}
                  data-testid="input-chat-message"
                />
                <Button
                  type="submit"
                  size="icon"
                  disabled={!isConnected || !newMessage.trim() || postMessageMutation.isPending}
                  data-testid="button-send-message"
                >
                  <Send className="h-4 w-4" />
                </Button>
              </form>
              <div className="flex items-center justify-between mt-2 text-xs text-muted-foreground">
                <span>{socketConnected ? '● Connected' : '○ Disconnected'}</span>
                <span>{newMessage.length}/1000</span>
              </div>
            </div>
          </div>
        </Card>
      </div>

      <div>
        <SectionHeader
          title="Discord Announcements"
          subtitle="Latest updates from the community"
        />

        {isAnnouncementsMock && (
          <div className="mb-6">
            <AlertBanner
              type="info"
              message="Displaying sample announcements. Configure Discord integration in Admin Panel to see real announcements."
            />
          </div>
        )}

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

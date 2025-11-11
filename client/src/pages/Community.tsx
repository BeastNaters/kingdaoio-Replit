import { useQuery } from "@tanstack/react-query";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { ProposalsTab } from "@/components/tabs/ProposalsTab";
import { AnnouncementsTab } from "@/components/tabs/AnnouncementsTab";
import { ChatTab } from "@/components/tabs/ChatTab";
import { MemberInfoTab } from "@/components/tabs/MemberInfoTab";
import type { SnapshotProposal, DiscordAnnouncementResponse } from "@shared/treasury-types";

export default function Community() {
  const { data: proposals } = useQuery<SnapshotProposal[]>({
    queryKey: ['/api/snapshot/proposals'],
  });

  const { data: announcementResponse } = useQuery<DiscordAnnouncementResponse>({
    queryKey: ['/api/discord/announcements'],
  });

  const activeProposals = proposals?.filter(p => p.state === 'active') || [];
  const announcements = announcementResponse?.data || [];

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8" data-testid="page-community">
      <div className="mb-8">
        <h1 className="text-3xl sm:text-4xl font-bold font-heading mb-2">Community Hub</h1>
        <p className="text-muted-foreground">Governance, announcements, chat, and member profiles</p>
      </div>

      <Tabs defaultValue="proposals" className="w-full">
        <TabsList className="grid w-full grid-cols-4 mb-8">
          <TabsTrigger value="proposals" className="gap-2" data-testid="tab-proposals">
            Proposals
            {activeProposals.length > 0 && (
              <Badge variant="secondary" className="ml-1 rounded-full h-5 min-w-5 px-1.5">
                {activeProposals.length}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="announcements" className="gap-2" data-testid="tab-announcements">
            Announcements
            {announcements.length > 0 && (
              <Badge variant="secondary" className="ml-1 rounded-full h-5 min-w-5 px-1.5">
                {announcements.length}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="chat" data-testid="tab-chat">
            Chat
          </TabsTrigger>
          <TabsTrigger value="member-info" data-testid="tab-member-info">
            Member Info
          </TabsTrigger>
        </TabsList>

        <TabsContent value="proposals">
          <ProposalsTab />
        </TabsContent>

        <TabsContent value="announcements">
          <AnnouncementsTab />
        </TabsContent>

        <TabsContent value="chat">
          <ChatTab />
        </TabsContent>

        <TabsContent value="member-info">
          <MemberInfoTab />
        </TabsContent>
      </Tabs>
    </div>
  );
}

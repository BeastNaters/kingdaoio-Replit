import { useQuery } from "@tanstack/react-query";
import { AlertBanner } from "@/components/AlertBanner";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { MessageSquare } from "lucide-react";
import type { DiscordAnnouncementResponse } from "@shared/treasury-types";

export function AnnouncementsTab() {
  const { data: announcementResponse, isLoading: isLoadingAnnouncements } = useQuery<DiscordAnnouncementResponse>({
    queryKey: ['/api/discord/announcements'],
  });

  const announcements = announcementResponse?.data || [];
  const isAnnouncementsMock = announcementResponse?.isMock || false;

  return (
    <div>
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
  );
}

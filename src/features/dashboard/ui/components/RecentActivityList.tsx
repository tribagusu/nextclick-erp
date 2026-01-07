/**
 * Recent Activity Component
 *
 * Displays recent activity timeline.
 */

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { FolderKanban, MessageSquare, Users, Milestone } from 'lucide-react';
import type { RecentActivity } from '../../domain/types';

interface RecentActivityListProps {
  activities: RecentActivity[];
}

const typeIcons = {
  project: FolderKanban,
  milestone: Milestone,
  communication: MessageSquare,
  client: Users,
};

export function RecentActivityList({ activities }: RecentActivityListProps) {
  if (activities.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
          <CardDescription>No recent activity</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Activity</CardTitle>
        <CardDescription>Latest updates across your workspace</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {activities.map((activity) => {
            const IconComponent = typeIcons[activity.type];
            return (
              <div key={activity.id} className="flex items-start gap-3">
                <div className="rounded-full bg-muted p-2">
                  <IconComponent className="h-4 w-4 text-muted-foreground" />
                </div>
                <div className="flex-1 space-y-1">
                  <p className="text-sm font-medium">{activity.title}</p>
                  <p className="text-sm text-muted-foreground">{activity.description}</p>
                  <p className="text-xs text-muted-foreground">
                    {new Date(activity.timestamp).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}

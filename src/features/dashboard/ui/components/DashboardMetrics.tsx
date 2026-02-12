'use client';

import type { DashboardMetrics } from '../../domain/types';
import { Skeleton } from '@/shared/components/ui/skeleton';
import { Card, CardContent, CardHeader } from '@/shared/components/ui/card';
import { MetricsCard } from './MetricsCard';
import {
  AlertCircle,
  CheckCircle,
  DollarSign,
  FolderKanban,
  MessageSquare,
  Milestone,
  UserCog,
  Users,
} from 'lucide-react';

interface DashboardMetricsProps {
  metrics?: DashboardMetrics;
  /**
   * When true, renders structural skeletons that match the final grid layout.
   */
  isLoading?: boolean;
}

function MetricsCardSkeleton() {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-4 w-4 rounded-full" />
      </CardHeader>
      <CardContent>
        <Skeleton className="mb-2 h-8 w-20" />
        <Skeleton className="h-3 w-32" />
      </CardContent>
    </Card>
  );
}

/**
 * Main metrics grid with built-in structural placeholders.
 */
export function DashboardMetrics({ metrics, isLoading }: DashboardMetricsProps) {
  const showSkeleton = isLoading || !metrics;

  if (showSkeleton) {
    // Render a fixed grid of metric cards so the layout doesn't shift
    // when the real data arrives.
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 8 }).map((_, index) => (
          <MetricsCardSkeleton key={index} />
        ))}
      </div>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <MetricsCard title="Total Clients" value={metrics.totalClients} icon={Users} />
      <MetricsCard title="Active Projects" value={metrics.activeProjects} icon={FolderKanban} />
      <MetricsCard title="Completed Projects" value={metrics.completedProjects} icon={CheckCircle} />
      <MetricsCard title="Team Members" value={metrics.totalEmployees} icon={UserCog} />
      <MetricsCard title="Pending Milestones" value={metrics.pendingMilestones} icon={Milestone} />
      <MetricsCard
        title="Recent Communications"
        value={metrics.recentCommunications}
        description="Last 7 days"
        icon={MessageSquare}
      />
      <MetricsCard
        title="Total Revenue"
        value={metrics.totalRevenue}
        icon={DollarSign}
      />
      <MetricsCard
        title="Outstanding"
        value={metrics.outstandingPayments}
        icon={AlertCircle}
      />
    </div>
  );
}



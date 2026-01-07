/**
 * Dashboard Page
 *
 * Main dashboard with metrics and project overview.
 */

'use client';

import {
  Users,
  FolderKanban,
  CheckCircle,
  UserCog,
  Milestone,
  MessageSquare,
  DollarSign,
  AlertCircle,
} from 'lucide-react';
import { Skeleton } from '@/shared/components/ui/skeleton';
import { Alert, AlertDescription } from '@/shared/components/ui/alert';

import { useDashboard } from '@/features/dashboard/ui/hooks/useDashboard';
import { MetricsCard } from '@/features/dashboard/ui/components/MetricsCard';
import { ProjectsOverview } from '@/features/dashboard/ui/components/ProjectsOverview';
import { RecentActivityList } from '@/features/dashboard/ui/components/RecentActivityList';

function formatCurrency(value: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
}

export default function DashboardPage() {
  const { data, isLoading, error } = useDashboard();

  if (error) {
    return (
      <div className="p-6">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Failed to load dashboard data. Please try again later.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="p-6 space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground">Welcome back!</p>
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <Skeleton key={i} className="h-32" />
          ))}
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <Skeleton className="h-64 col-span-2" />
          <Skeleton className="h-64" />
        </div>
      </div>
    );
  }

  const { metrics, recentProjects, recentActivity } = data!;

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground">Overview of your business metrics</p>
      </div>

      {/* Metrics Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <MetricsCard
          title="Total Clients"
          value={metrics.totalClients}
          icon={Users}
        />
        <MetricsCard
          title="Active Projects"
          value={metrics.activeProjects}
          icon={FolderKanban}
        />
        <MetricsCard
          title="Completed Projects"
          value={metrics.completedProjects}
          icon={CheckCircle}
        />
        <MetricsCard
          title="Team Members"
          value={metrics.totalEmployees}
          icon={UserCog}
        />
        <MetricsCard
          title="Pending Milestones"
          value={metrics.pendingMilestones}
          icon={Milestone}
        />
        <MetricsCard
          title="Recent Communications"
          value={metrics.recentCommunications}
          description="Last 7 days"
          icon={MessageSquare}
        />
        <MetricsCard
          title="Total Revenue"
          value={formatCurrency(metrics.totalRevenue)}
          icon={DollarSign}
        />
        <MetricsCard
          title="Outstanding"
          value={formatCurrency(metrics.outstandingPayments)}
          icon={AlertCircle}
        />
      </div>

      {/* Projects and Activity */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <div className="col-span-2">
          <ProjectsOverview projects={recentProjects} />
        </div>
        <RecentActivityList activities={recentActivity} />
      </div>
    </div>
  );
}

/**
 * Dashboard Page
 *
 * Main dashboard with metrics and project overview.
 */

'use client';

import { Skeleton } from '@/shared/components/ui/skeleton';
import { Alert, AlertDescription } from '@/shared/components/ui/alert';
import { AlertCircle } from 'lucide-react';
import { FeatureErrorBoundary } from '@/shared/components/ErrorBoundary';

import { useDashboard } from '@/features/dashboard/ui/hooks/useDashboard';
import { DashboardMetrics } from '@/features/dashboard/ui/components/DashboardMetrics';
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

  const metrics = data?.metrics;
  const recentProjects = data?.recentProjects ?? [];
  const recentActivity = data?.recentActivity ?? [];

  return (
    <div className="lg:p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground">Overview of your business metrics</p>
      </div>

      <FeatureErrorBoundary featureName="Dashboard">
        {/* Metrics Grid with structural placeholders */}
        <DashboardMetrics metrics={metrics} isLoading={isLoading} />

        {/* Projects and Activity */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {isLoading ? (
            <>
              <Skeleton className="col-span-2 h-64" />
              <Skeleton className="h-64" />
            </>
          ) : (
            <>
              <div className="col-span-2">
                <ProjectsOverview projects={recentProjects} />
              </div>
              <RecentActivityList activities={recentActivity} />
            </>
          )}
        </div>
      </FeatureErrorBoundary>
    </div>
  );
}

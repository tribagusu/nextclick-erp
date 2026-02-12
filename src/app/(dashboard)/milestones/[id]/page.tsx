/**
 * Milestone Detail Page
 */

'use client';

import { use } from 'react';
import Link from 'next/link';
import { ArrowLeft, Pencil, Calendar, Flag, CheckCircle } from 'lucide-react';

import { Button } from '@/shared/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { Skeleton } from '@/shared/components/ui/skeleton';
import { Badge } from '@/shared/components/ui/badge';
import { FeatureErrorBoundary } from '@/shared/components/ErrorBoundary';

import { useMilestone } from '@/features/milestones/ui/hooks/useMilestones';

const statusColors: Record<string, string> = {
  pending: 'bg-gray-500',
  in_progress: 'bg-blue-500',
  completed: 'bg-green-500',
  cancelled: 'bg-red-500',
};

interface MilestoneDetailPageProps {
  params: Promise<{ id: string }>;
}

export default function MilestoneDetailPage({ params }: MilestoneDetailPageProps) {
  const { id } = use(params);
  const { data: milestone, isLoading, error } = useMilestone(id);

  if (error) {
    return (
      <div className="p-6">
        <div className="rounded-md border border-destructive p-4">
          <p className="text-destructive">Failed to load milestone</p>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="lg:p-6 space-y-6">
        <div className="flex items-center gap-4">
          <Skeleton className="h-10 w-10" />
          <div className="space-y-2">
            <Skeleton className="h-8 w-64" />
            <Skeleton className="h-4 w-32" />
          </div>
        </div>
        <div className="grid gap-6 md:grid-cols-2">
          <Skeleton className="h-48" />
          <Skeleton className="h-48" />
        </div>
      </div>
    );
  }

  if (!milestone) {
    return (
      <div className="p-6">
        <div className="rounded-md border p-4">
          <p className="text-muted-foreground">Milestone not found</p>
        </div>
      </div>
    );
  }

  return (
    <div className="lg:p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/milestones">
            <Button variant="ghost" size="icon"><ArrowLeft className="h-4 w-4" /></Button>
          </Link>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-3xl font-bold">{milestone.milestone}</h1>
              <Badge className={`${statusColors[milestone.status]} text-white`}>
                {milestone.status.replace('_', ' ')}
              </Badge>
            </div>
            <p className="text-muted-foreground">Project: {milestone.project_name}</p>
          </div>
        </div>
        <Link href={`/milestones/${id}/edit`}>
          <Button><Pencil className="mr-2 h-4 w-4" />Edit</Button>
        </Link>
      </div>

      <FeatureErrorBoundary featureName="Milestone Details">
        <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Milestone Details</CardTitle>
            <CardDescription>Timeline and status</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-3">
              <Flag className="h-4 w-4 text-muted-foreground" />
              <span className="capitalize">Status: {milestone.status.replace('_', ' ')}</span>
            </div>
            {milestone.due_date && (
              <div className="flex items-center gap-3">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span>Due: {new Date(milestone.due_date).toLocaleDateString()}</span>
              </div>
            )}
            {milestone.completion_date && (
              <div className="flex items-center gap-3">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <span>Completed: {new Date(milestone.completion_date).toLocaleDateString()}</span>
              </div>
            )}
            {milestone.description && (
              <div>
                <p className="text-sm text-muted-foreground mb-1">Description</p>
                <p>{milestone.description}</p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Remarks</CardTitle>
            <CardDescription>Additional notes</CardDescription>
          </CardHeader>
          <CardContent>
            {milestone.remarks ? (
              <p>{milestone.remarks}</p>
            ) : (
              <p className="text-muted-foreground">No remarks</p>
            )}
          </CardContent>
        </Card>
        </div>
      </FeatureErrorBoundary>
    </div>
  );
}

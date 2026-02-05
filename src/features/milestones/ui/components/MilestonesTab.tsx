/**
 * Milestones Tab Component
 * 
 * Main container for project milestones with list and progress views
 */

'use client';

import { useState } from 'react';
import { Plus, Target } from 'lucide-react';

import { Button } from '@/shared/components/ui/button';
import { Badge } from '@/shared/components/ui/badge';
import { Skeleton } from '@/shared/components/ui/skeleton';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/components/ui/select';

import { useMilestones } from '../hooks/useMilestones';
import { MilestoneCard } from './MilestoneCard';
import { MilestoneProgress } from './MilestoneProgress';
import { MilestoneFormDialog } from './MilestoneFormDialog';
import { useCurrentEmployee } from '@/features/employees/ui/hooks/useEmployees';
import type { MilestoneStatus } from '@/shared/base-feature/domain/database.types';

interface MilestonesTabProps {
  projectId: string;
  canManage: boolean;
}

export function MilestonesTab({ projectId, canManage }: MilestonesTabProps) {
  const [statusFilter, setStatusFilter] = useState<MilestoneStatus | 'all'>('all');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingMilestone, setEditingMilestone] = useState<string | null>(null);
  
  // Get current employee ID for assignment checks
  const { data: currentEmployee } = useCurrentEmployee();

  const { data, isLoading } = useMilestones({
    projectId,
    status: statusFilter === 'all' ? undefined : statusFilter,
    pageSize: 100,
  });

  const milestones = data?.milestones || [];

  // Calculate progress (exclude cancelled)
  const totalCount = milestones.filter(m => m.status !== 'cancelled').length;
  const completedCount = milestones.filter(m => m.status === 'completed').length;
  const inProgressCount = milestones.filter(m => m.status === 'in_progress').length;
  const pendingCount = milestones.filter(m => m.status === 'pending').length;
  const cancelledCount = milestones.filter(m => m.status === 'cancelled').length;
  const progressPercent = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  const handleEdit = (milestoneId: string) => {
    setEditingMilestone(milestoneId);
    setDialogOpen(true);
  };

  const handleCreate = () => {
    setEditingMilestone(null);
    setDialogOpen(true);
  };

  const handleDialogClose = () => {
    setDialogOpen(false);
    setEditingMilestone(null);
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <Skeleton className="h-8 w-48" />
          <div className="flex gap-2">
            <Skeleton className="h-10 w-32" />
            <Skeleton className="h-10 w-36" />
          </div>
        </div>
        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-4">
            <Skeleton className="h-32" />
            <Skeleton className="h-32" />
          </div>
          <Skeleton className="h-48" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Target className="h-5 w-5 text-muted-foreground" />
          <h2 className="text-xl font-semibold">Project Milestones</h2>
          <Badge variant="secondary">{milestones.length}</Badge>
        </div>
        <div className="flex items-center gap-2">
          <Select
            value={statusFilter}
            onValueChange={(value) => setStatusFilter(value as MilestoneStatus | 'all')}
          >
            <SelectTrigger className="w-32">
              <SelectValue placeholder="All Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="in_progress">In Progress</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
              <SelectItem value="cancelled">Cancelled</SelectItem>
            </SelectContent>
          </Select>
          {canManage && (
            <Button onClick={handleCreate}>
              <Plus className="mr-2 h-4 w-4" />
              Add Milestone
            </Button>
          )}
        </div>
      </div>

      {/* Content */}
      {milestones.length === 0 ? (
        <EmptyState canManage={canManage} onCreate={handleCreate} />
      ) : (
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Milestone List */}
          <div className="lg:col-span-2 space-y-4">
            {milestones.map((milestone) => (
              <MilestoneCard
                key={milestone.id}
                milestone={milestone}
                projectId={projectId}
                canManage={canManage}
                onEdit={() => handleEdit(milestone.id)}
                currentEmployeeId={currentEmployee?.id}
              />
            ))}
          </div>

          {/* Progress Panel */}
          <div>
            <MilestoneProgress
              total={totalCount}
              completed={completedCount}
              inProgress={inProgressCount}
              pending={pendingCount}
              cancelled={cancelledCount}
              progressPercent={progressPercent}
            />
          </div>
        </div>
      )}

      {/* Create/Edit Dialog */}
      <MilestoneFormDialog
        open={dialogOpen}
        onOpenChange={handleDialogClose}
        projectId={projectId}
        milestoneId={editingMilestone}
      />
    </div>
  );
}

function EmptyState({ canManage, onCreate }: { canManage: boolean; onCreate: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center border-2 border-dashed rounded-lg">
      <div className="w-16 h-16 mb-4 rounded-full bg-muted flex items-center justify-center">
        <Target className="h-8 w-8 text-muted-foreground" />
      </div>
      <h3 className="text-lg font-medium">No milestones yet</h3>
      <p className="text-muted-foreground mt-1 mb-4">
        Create your first milestone to start tracking project progress
      </p>
      {canManage && (
        <Button onClick={onCreate}>
          <Plus className="mr-2 h-4 w-4" />
          Add First Milestone
        </Button>
      )}
    </div>
  );
}

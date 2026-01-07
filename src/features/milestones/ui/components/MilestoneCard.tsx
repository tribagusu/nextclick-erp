/**
 * Milestone Card Component
 *
 * Individual milestone display with status, dates, and actions.
 * Shows different action buttons based on user role and assignment status.
 */

'use client';

import { useState } from 'react';
import { Pencil, Trash2, Clock, Users, ClipboardEdit } from 'lucide-react';

import { Card, CardContent } from '@/shared/components/ui/card';
import { Badge } from '@/shared/components/ui/badge';
import { Button } from '@/shared/components/ui/button';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/shared/components/ui/alert-dialog';

import { useDeleteMilestone } from '../hooks/useMilestones';
import { useMilestoneEmployees } from '../hooks/useMilestoneEmployees';
import { MilestoneAssignmentDialog } from './MilestoneAssignmentDialog';
import { MilestoneFormDialog } from './MilestoneFormDialog';
import type { ProjectMilestone } from '@/shared/types/database.types';

interface MilestoneCardProps {
  milestone: ProjectMilestone;
  projectId: string;
  canManage: boolean;
  onEdit: () => void;
  /**
   * Current user's employee ID (if they are linked to an employee record).
   * Used to check if user is assigned to this milestone.
   */
  currentEmployeeId?: string;
}

const statusConfig: Record<string, { color: string; bgColor: string; label: string }> = {
  pending: { color: 'text-gray-600', bgColor: 'bg-gray-100', label: 'Pending' },
  in_progress: { color: 'text-blue-600', bgColor: 'bg-blue-100', label: 'In Progress' },
  completed: { color: 'text-green-600', bgColor: 'bg-green-100', label: 'Completed' },
  cancelled: { color: 'text-red-600', bgColor: 'bg-red-100', label: 'Cancelled' },
};

const statusDotColors: Record<string, string> = {
  pending: 'bg-gray-400',
  in_progress: 'bg-blue-500',
  completed: 'bg-green-500',
  cancelled: 'bg-red-500',
};

export function MilestoneCard({
  milestone,
  projectId,
  canManage,
  onEdit,
  currentEmployeeId,
}: MilestoneCardProps) {
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [assignDialogOpen, setAssignDialogOpen] = useState(false);
  const [progressDialogOpen, setProgressDialogOpen] = useState(false);
  const deleteMilestone = useDeleteMilestone();
  const { data: assigneesData } = useMilestoneEmployees(milestone.id);

  const status = statusConfig[milestone.status] || statusConfig.pending;
  const dotColor = statusDotColors[milestone.status] || statusDotColors.pending;
  const assignees = assigneesData?.employees || [];
  const assigneeCount = assignees.length;

  // Check if current employee is assigned to this milestone
  const isAssigned =
    currentEmployeeId && assignees.some((a) => a.employee_id === currentEmployeeId);

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return null;
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'short',
      day: '2-digit',
      year: 'numeric',
    });
  };

  const handleDelete = async () => {
    try {
      await deleteMilestone.mutateAsync(milestone.id);
      setDeleteDialogOpen(false);
    } catch {
      // Handle error silently - toast would be better here
    }
  };

  return (
    <>
      <Card className="relative">
        {/* Status indicator dot */}
        <div
          className={`absolute left-0 top-1/2 -translate-y-1/2 w-2 h-2 rounded-full ${dotColor} -ml-1`}
        />

        <CardContent className="pt-4 pb-4">
          <div className="flex items-start justify-between">
            <div className="flex-1 min-w-0">
              {/* Title and Status */}
              <div className="flex items-center gap-2 mb-2">
                <h3 className="font-semibold truncate">{milestone.milestone}</h3>
                <Badge className={`${status.bgColor} ${status.color} text-xs`}>
                  {milestone.status === 'completed' && '✓ '}
                  {milestone.status === 'in_progress' && '○ '}
                  {milestone.status === 'pending' && '○ '}
                  {status.label}
                </Badge>
              </div>

              {/* Description */}
              {milestone.description && (
                <p className="text-sm text-muted-foreground mb-2 line-clamp-2">
                  {milestone.description}
                </p>
              )}

              {/* Dates and Assignees */}
              <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground mb-2">
                {milestone.due_date && (
                  <div className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    <span>
                      {formatDate(milestone.due_date)}
                      {milestone.completion_date && <> → {formatDate(milestone.completion_date)}</>}
                    </span>
                  </div>
                )}
                <button
                  onClick={() => setAssignDialogOpen(true)}
                  className="flex items-center gap-1 hover:text-foreground transition-colors"
                >
                  <Users className="h-3 w-3" />
                  <span>{assigneeCount} assigned</span>
                </button>
              </div>

              {/* Remarks */}
              {milestone.remarks && (
                <p className="text-sm text-muted-foreground italic border-l-2 pl-2 mt-2">
                  &ldquo;{milestone.remarks}&rdquo;
                </p>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-1 ml-2 shrink-0">
              {/* Update Progress button for assigned employees (non-managers) */}
              {!canManage && isAssigned && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setProgressDialogOpen(true)}
                  className="h-8 gap-1"
                  title="Update milestone progress"
                >
                  <ClipboardEdit className="h-4 w-4" />
                  <span className="hidden sm:inline">Update</span>
                </Button>
              )}

              {/* Manager actions */}
              {canManage && (
                <>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setAssignDialogOpen(true)}
                    className="h-8 w-8"
                    title="Assign team members"
                  >
                    <Users className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon" onClick={onEdit} className="h-8 w-8">
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setDeleteDialogOpen(true)}
                    className="h-8 w-8 text-destructive hover:text-destructive"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Assignment Dialog */}
      <MilestoneAssignmentDialog
        open={assignDialogOpen}
        onOpenChange={setAssignDialogOpen}
        milestoneId={milestone.id}
        milestoneName={milestone.milestone}
        projectId={projectId}
      />

      {/* Progress Update Dialog (Restricted Mode for Employees) */}
      <MilestoneFormDialog
        open={progressDialogOpen}
        onOpenChange={setProgressDialogOpen}
        projectId={projectId}
        milestoneId={milestone.id}
        restrictedMode
      />

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Milestone</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete &ldquo;{milestone.milestone}&rdquo;? This action
              cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              disabled={deleteMilestone.isPending}
            >
              {deleteMilestone.isPending ? 'Deleting...' : 'Delete'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

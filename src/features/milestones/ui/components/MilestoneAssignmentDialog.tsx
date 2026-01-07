/**
 * Milestone Assignment Dialog
 * 
 * Dialog to assign project team members to a specific milestone
 */

'use client';

import { useState } from 'react';
import { Loader2, X, UserPlus } from 'lucide-react';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/shared/components/ui/dialog';
import { Button } from '@/shared/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/components/ui/select';
import { Avatar, AvatarFallback } from '@/shared/components/ui/avatar';
import { Alert, AlertDescription } from '@/shared/components/ui/alert';

import { useMilestoneEmployees, useAddMilestoneEmployee, useRemoveMilestoneEmployee } from '../hooks/useMilestoneEmployees';
import { useProjectMembers } from '@/features/project-members/ui/hooks/useProjectMembers';
import type { MilestoneEmployee } from '../../domain/milestone-employees.types';

interface MilestoneAssignmentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  milestoneId: string;
  milestoneName: string;
  projectId: string;
}

export function MilestoneAssignmentDialog({
  open,
  onOpenChange,
  milestoneId,
  milestoneName,
  projectId,
}: MilestoneAssignmentDialogProps) {
  const [selectedEmployeeId, setSelectedEmployeeId] = useState<string>('');
  const [error, setError] = useState<string | null>(null);

  const { data: assigneesData, isLoading: loadingAssignees } = useMilestoneEmployees(milestoneId);
  const { data: teamData, isLoading: loadingTeam } = useProjectMembers(projectId);

  const addEmployee = useAddMilestoneEmployee(milestoneId);
  const removeEmployee = useRemoveMilestoneEmployee(milestoneId);

  const assignees = assigneesData?.employees || [];
  const assigneeIds = new Set(assignees.map((a) => a.employee_id));

  // Filter to show only project team members not already assigned
  const availableMembers = (teamData?.members || []).filter(
    (member) => !assigneeIds.has(member.employee_id)
  );

  const handleAssign = async () => {
    if (!selectedEmployeeId) {
      setError('Please select an employee');
      return;
    }

    setError(null);
    try {
      await addEmployee.mutateAsync(selectedEmployeeId);
      setSelectedEmployeeId('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to assign employee');
    }
  };

  const handleRemove = async (employeeId: string) => {
    try {
      await removeEmployee.mutateAsync(employeeId);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to remove employee');
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Assign Team Members</DialogTitle>
          <DialogDescription>
            Assign project team members to &ldquo;{milestoneName}&rdquo;
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* Assign Team Member */}
          <div className="space-y-3">
            <h4 className="font-medium text-sm">Add Assignee</h4>

            <div className="flex gap-2">
              <Select value={selectedEmployeeId} onValueChange={setSelectedEmployeeId}>
                <SelectTrigger className="flex-1">
                  <SelectValue placeholder="Select team member" />
                </SelectTrigger>
                <SelectContent>
                  {loadingTeam ? (
                    <div className="p-2 text-center text-muted-foreground">Loading...</div>
                  ) : availableMembers.length === 0 ? (
                    <div className="p-2 text-center text-muted-foreground">
                      {(teamData?.members || []).length === 0
                        ? 'No team members on project'
                        : 'All team members assigned'}
                    </div>
                  ) : (
                    availableMembers.map((member) => (
                      <SelectItem key={member.employee_id} value={member.employee_id}>
                        {member.employee?.name || 'Unknown'}
                        {member.role && ` (${member.role})`}
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>

              <Button
                onClick={handleAssign}
                disabled={!selectedEmployeeId || addEmployee.isPending}
              >
                {addEmployee.isPending ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <UserPlus className="h-4 w-4" />
                )}
              </Button>
            </div>
          </div>

          {/* Current Assignees */}
          <div className="space-y-3">
            <h4 className="font-medium text-sm">Current Assignees</h4>

            {loadingAssignees ? (
              <div className="text-center text-muted-foreground py-4">Loading...</div>
            ) : assignees.length === 0 ? (
              <p className="text-muted-foreground text-sm">No assignees yet</p>
            ) : (
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {assignees.map((assignee) => (
                  <AssigneeRow
                    key={assignee.employee_id}
                    assignee={assignee}
                    onRemove={() => handleRemove(assignee.employee_id)}
                    isRemoving={removeEmployee.isPending}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function AssigneeRow({
  assignee,
  onRemove,
  isRemoving,
}: {
  assignee: MilestoneEmployee;
  onRemove: () => void;
  isRemoving: boolean;
}) {
  const employee = assignee.employee;
  const initials = employee?.name
    ?.split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2) || '??';

  return (
    <div className="flex items-center justify-between p-2 rounded-md hover:bg-muted/50">
      <div className="flex items-center gap-3">
        <Avatar className="h-8 w-8">
          <AvatarFallback className="text-xs">{initials}</AvatarFallback>
        </Avatar>
        <div>
          <p className="text-sm font-medium">{employee?.name || 'Unknown'}</p>
          {employee?.position && (
            <p className="text-xs text-muted-foreground">{employee.position}</p>
          )}
        </div>
      </div>
      <Button
        variant="ghost"
        size="icon"
        onClick={onRemove}
        disabled={isRemoving}
        className="h-8 w-8 text-muted-foreground hover:text-destructive"
      >
        {isRemoving ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <X className="h-4 w-4" />
        )}
      </Button>
    </div>
  );
}

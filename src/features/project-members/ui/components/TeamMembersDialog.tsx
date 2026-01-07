/**
 * Team Members Dialog Component
 * 
 * Dialog to add/remove team members from a project
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
import { Input } from '@/shared/components/ui/input';
import { Label } from '@/shared/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/components/ui/select';
import { Avatar, AvatarFallback } from '@/shared/components/ui/avatar';
import { Alert, AlertDescription } from '@/shared/components/ui/alert';

import { useProjectMembers, useAddProjectMember, useRemoveProjectMember } from '../hooks/useProjectMembers';
import { useEmployees } from '@/features/employees/ui/hooks/useEmployees';
import type { ProjectMember } from '../../domain/types';

interface TeamMembersDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  projectId: string;
}

export function TeamMembersDialog({
  open,
  onOpenChange,
  projectId,
}: TeamMembersDialogProps) {
  const [selectedEmployeeId, setSelectedEmployeeId] = useState<string>('');
  const [role, setRole] = useState<string>('');
  const [error, setError] = useState<string | null>(null);

  const { data: membersData, isLoading: loadingMembers } = useProjectMembers(projectId);
  const { data: employeesData, isLoading: loadingEmployees } = useEmployees({ pageSize: 100 });

  const addMember = useAddProjectMember(projectId);
  const removeMember = useRemoveProjectMember(projectId);

  const members = membersData?.members || [];
  const memberIds = new Set(members.map((m) => m.employee_id));
  
  // Filter employees to show only those not already team members
  const availableEmployees = (employeesData?.employees || []).filter(
    (emp) => !memberIds.has(emp.id)
  );

  const handleAddMember = async () => {
    if (!selectedEmployeeId) {
      setError('Please select an employee');
      return;
    }

    setError(null);
    try {
      await addMember.mutateAsync({
        employee_id: selectedEmployeeId,
        role: role || null,
      });
      setSelectedEmployeeId('');
      setRole('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add team member');
    }
  };

  const handleRemoveMember = async (employeeId: string) => {
    try {
      await removeMember.mutateAsync(employeeId);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to remove team member');
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Manage Team Members</DialogTitle>
          <DialogDescription>
            Add or remove team members from this project
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* Add Team Member Form */}
          <div className="space-y-4">
            <h4 className="font-medium">Add Team Member</h4>
            
            <div className="space-y-2">
              <Label>Employee</Label>
              <Select value={selectedEmployeeId} onValueChange={setSelectedEmployeeId}>
                <SelectTrigger>
                  <SelectValue placeholder="Select employee" />
                </SelectTrigger>
                <SelectContent>
                  {loadingEmployees ? (
                    <div className="p-2 text-center text-muted-foreground">Loading...</div>
                  ) : availableEmployees.length === 0 ? (
                    <div className="p-2 text-center text-muted-foreground">
                      No available employees
                    </div>
                  ) : (
                    availableEmployees.map((emp) => (
                      <SelectItem key={emp.id} value={emp.id}>
                        {emp.name} {emp.position && `(${emp.position})`}
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Role (Optional)</Label>
              <Input
                placeholder="e.g., Developer, Designer, etc."
                value={role}
                onChange={(e) => setRole(e.target.value)}
              />
            </div>

            <Button
              onClick={handleAddMember}
              disabled={!selectedEmployeeId || addMember.isPending}
              className="w-full"
            >
              {addMember.isPending ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <UserPlus className="mr-2 h-4 w-4" />
              )}
              Add Member
            </Button>
          </div>

          {/* Current Team Members */}
          <div className="space-y-3">
            <h4 className="font-medium">Current Team Members</h4>
            
            {loadingMembers ? (
              <div className="text-center text-muted-foreground py-4">Loading...</div>
            ) : members.length === 0 ? (
              <p className="text-muted-foreground text-sm">No team members assigned yet</p>
            ) : (
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {members.map((member) => (
                  <TeamMemberRow
                    key={member.employee_id}
                    member={member}
                    onRemove={() => handleRemoveMember(member.employee_id)}
                    isRemoving={removeMember.isPending}
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

function TeamMemberRow({
  member,
  onRemove,
  isRemoving,
}: {
  member: ProjectMember;
  onRemove: () => void;
  isRemoving: boolean;
}) {
  const employee = member.employee;
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
          {member.role && (
            <p className="text-xs text-muted-foreground">{member.role}</p>
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

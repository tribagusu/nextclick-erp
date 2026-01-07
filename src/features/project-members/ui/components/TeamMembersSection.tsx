/**
 * Team Members Section Component
 * 
 * Displays project team members with manage button (admin/manager only)
 */

'use client';

import { Users } from 'lucide-react';

import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { Button } from '@/shared/components/ui/button';
import { Badge } from '@/shared/components/ui/badge';
import { Skeleton } from '@/shared/components/ui/skeleton';
import { Avatar, AvatarFallback } from '@/shared/components/ui/avatar';

import { useProjectMembers } from '../hooks/useProjectMembers';
import type { ProjectMember } from '../../domain/types';

interface TeamMembersSectionProps {
  projectId: string;
  canManage: boolean;
  onManageClick: () => void;
}

export function TeamMembersSection({
  projectId,
  canManage,
  onManageClick,
}: TeamMembersSectionProps) {
  const { data, isLoading } = useProjectMembers(projectId);

  const members = data?.members || [];

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
        <div className="flex items-center gap-2">
          <Users className="h-5 w-5 text-muted-foreground" />
          <CardTitle className="text-lg">Team</CardTitle>
          <Badge variant="secondary" className="ml-1">
            {isLoading ? '...' : members.length}
          </Badge>
        </div>
        {canManage && (
          <Button variant="outline" size="sm" onClick={onManageClick}>
            Manage
          </Button>
        )}
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-center gap-3">
                <Skeleton className="h-8 w-8 rounded-full" />
                <div className="space-y-1">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-3 w-16" />
                </div>
              </div>
            ))}
          </div>
        ) : members.length === 0 ? (
          <div className="border-2 border-dashed rounded-lg py-8 px-4 text-center text-muted-foreground">
            No team members assigned
          </div>
        ) : (
          <div className="space-y-3">
            {members.map((member) => (
              <TeamMemberItem key={member.employee_id} member={member} />
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function TeamMemberItem({ member }: { member: ProjectMember }) {
  const employee = member.employee;
  const initials = employee?.name
    ?.split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2) || '??';

  return (
    <div className="flex items-center gap-3">
      <Avatar className="h-8 w-8">
        <AvatarFallback className="text-xs">{initials}</AvatarFallback>
      </Avatar>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium truncate">{employee?.name || 'Unknown'}</p>
        {member.role && (
          <p className="text-xs text-muted-foreground">{member.role}</p>
        )}
      </div>
    </div>
  );
}

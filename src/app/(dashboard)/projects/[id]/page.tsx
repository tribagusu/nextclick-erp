/**
 * Project Detail Page with Tabs Layout
 * 
 * Tabs: Project Info | Milestones
 */

'use client';

import { use, useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Pencil, Calendar, DollarSign, Flag, Clock } from 'lucide-react';

import { Button } from '@/shared/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { Skeleton } from '@/shared/components/ui/skeleton';
import { Badge } from '@/shared/components/ui/badge';
import { Progress } from '@/shared/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/shared/components/ui/tabs';

import { useProject } from '@/features/projects/ui/hooks/useProjects';
import { ProjectFormDialog } from '@/features/projects/ui/components/ProjectFormDialog';
import { TeamMembersSection } from '@/features/project-members/ui/components/TeamMembersSection';
import { TeamMembersDialog } from '@/features/project-members/ui/components/TeamMembersDialog';
import { MilestonesTab } from '@/features/milestones/ui/components/MilestonesTab';
import { canManage } from '@/shared/lib/auth/permissions';
import { useCurrentUser } from '@/features/auth/ui/hooks/useAuth';

const statusColors: Record<string, string> = {
  draft: 'bg-blue-500',
  active: 'bg-green-500',
  on_hold: 'bg-yellow-500',
  completed: 'bg-purple-500',
  cancelled: 'bg-red-500',
};

interface ProjectDetailPageProps {
  params: Promise<{ id: string }>;
}

export default function ProjectDetailPage({ params }: ProjectDetailPageProps) {
  const { id } = use(params);
  const { data: project, isLoading, error } = useProject(id);
  const { data: currentUser } = useCurrentUser();
  
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [teamDialogOpen, setTeamDialogOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('info');

  const userCanManage = currentUser?.role ? canManage(currentUser.role) : false;

  if (error) {
    return (
      <div className="p-6">
        <div className="rounded-md border border-destructive p-4">
          <p className="text-destructive">Failed to load project</p>
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
        <Skeleton className="h-10 w-64" />
        <div className="grid gap-6 md:grid-cols-2">
          <Skeleton className="h-48" />
          <Skeleton className="h-48" />
        </div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="p-6">
        <div className="rounded-md border p-4">
          <p className="text-muted-foreground">Project not found</p>
        </div>
      </div>
    );
  }

  const paymentProgress = project.total_budget > 0 
    ? Math.min(100, (project.amount_paid / project.total_budget) * 100)
    : 0;

  return (
    <div className="lg:p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/projects">
            <Button variant="ghost" size="icon"><ArrowLeft className="h-4 w-4" /></Button>
          </Link>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-3xl font-bold">{project.project_name}</h1>
              <Badge className={`${statusColors[project.status]} text-white`}>
                {project.status.replace('_', ' ')}
              </Badge>
            </div>
            <p className="text-muted-foreground">Client: {project.client_name}</p>
          </div>
        </div>
        {userCanManage && (
          <Button onClick={() => setEditDialogOpen(true)}>
            <Pencil className="mr-2 h-4 w-4" />
            Edit
          </Button>
        )}
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="info">Project Info</TabsTrigger>
          <TabsTrigger value="milestones">Milestones</TabsTrigger>
        </TabsList>

        {/* Project Info Tab */}
        <TabsContent value="info" className="space-y-6 mt-6">
          <div className="grid gap-6 md:grid-cols-2">
            {/* Project Details Card */}
            <Card>
              <CardHeader>
                <CardTitle>Project Details</CardTitle>
                <CardDescription>Timeline and priority</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-3">
                  <Flag className="h-4 w-4 text-muted-foreground" />
                  <span className="capitalize">Priority: {project.priority}</span>
                </div>
                {project.start_date && (
                  <div className="flex items-center gap-3">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span>Start: {new Date(project.start_date).toLocaleDateString()}</span>
                  </div>
                )}
                {project.end_date && (
                  <div className="flex items-center gap-3">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <span>Due: {new Date(project.end_date).toLocaleDateString()}</span>
                  </div>
                )}
                {project.description && (
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Description</p>
                    <p>{project.description}</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Financials Card */}
            <Card>
              <CardHeader>
                <CardTitle>Financials</CardTitle>
                <CardDescription>Budget and payments</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-3">
                  <DollarSign className="h-4 w-4 text-muted-foreground" />
                  <span>Budget: ${project.total_budget.toLocaleString()}</span>
                </div>
                <div className="flex items-center gap-3">
                  <DollarSign className="h-4 w-4 text-green-500" />
                  <span>Paid: ${project.amount_paid.toLocaleString()}</span>
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>Payment Progress</span>
                    <span>{Math.round(paymentProgress)}%</span>
                  </div>
                  <Progress value={paymentProgress} />
                </div>
                {project.payment_terms && (
                  <div>
                    <p className="text-sm text-muted-foreground">Terms: {project.payment_terms}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Team Members Section */}
          <TeamMembersSection
            projectId={id}
            canManage={userCanManage}
            onManageClick={() => setTeamDialogOpen(true)}
          />
        </TabsContent>

        {/* Milestones Tab */}
        <TabsContent value="milestones" className="mt-6">
          <MilestonesTab projectId={id} canManage={userCanManage} />
        </TabsContent>
      </Tabs>

      {/* Dialogs */}
      <ProjectFormDialog
        open={editDialogOpen}
        onOpenChange={setEditDialogOpen}
        project={project}
      />

      <TeamMembersDialog
        open={teamDialogOpen}
        onOpenChange={setTeamDialogOpen}
        projectId={id}
      />
    </div>
  );
}

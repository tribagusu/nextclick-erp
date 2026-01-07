/**
 * Projects Overview Component
 *
 * Displays recent projects with progress bars.
 */

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { Badge } from '@/shared/components/ui/badge';
import { Progress } from '@/shared/components/ui/progress';
import type { ProjectSummary } from '../../domain/types';

interface ProjectsOverviewProps {
  projects: ProjectSummary[];
}

const statusColors: Record<string, string> = {
  draft: 'bg-gray-500',
  active: 'bg-blue-500',
  on_hold: 'bg-yellow-500',
  completed: 'bg-green-500',
  cancelled: 'bg-red-500',
};

const priorityColors: Record<string, string> = {
  low: 'bg-slate-400',
  medium: 'bg-blue-400',
  high: 'bg-orange-400',
  urgent: 'bg-red-500',
};

export function ProjectsOverview({ projects }: ProjectsOverviewProps) {
  if (projects.length === 0) {
    return (
      <Card className="col-span-full">
        <CardHeader>
          <CardTitle>Recent Projects</CardTitle>
          <CardDescription>No projects found</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card className="col-span-full">
      <CardHeader>
        <CardTitle>Recent Projects</CardTitle>
        <CardDescription>Overview of your latest projects</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {projects.map((project) => (
            <div key={project.id} className="flex items-center gap-4">
              <div className="flex-1 space-y-1">
                <div className="flex items-center gap-2">
                  <span className="font-medium">{project.projectName}</span>
                  <Badge variant="outline" className={`${statusColors[project.status] || 'bg-gray-500'} text-white`}>
                    {project.status.replace('_', ' ')}
                  </Badge>
                  <Badge variant="outline" className={`${priorityColors[project.priority] || 'bg-gray-400'} text-white`}>
                    {project.priority}
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground">{project.clientName}</p>
              </div>
              <div className="w-32">
                <div className="flex items-center gap-2 text-sm">
                  <Progress value={project.progress} className="h-2" />
                  <span className="w-10 text-right">{project.progress}%</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

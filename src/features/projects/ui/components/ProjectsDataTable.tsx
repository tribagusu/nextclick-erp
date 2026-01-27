/**
 * Projects Data Table Component
 *
 * Table display for projects with row actions.
 */

'use client';

import { MoreHorizontal, Pencil, Trash2, Eye } from 'lucide-react';

import { Button } from '@/shared/components/ui/button';
import { Badge } from '@/shared/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/shared/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/shared/components/ui/dropdown-menu';
import { Skeleton } from '@/shared/components/ui/skeleton';

import type { Project, ProjectStatus } from '@/shared/types/database.types';

const statusColors: Record<ProjectStatus, string> = {
  draft: 'bg-blue-500',
  active: 'bg-green-500',
  on_hold: 'bg-yellow-500',
  completed: 'bg-purple-500',
  cancelled: 'bg-red-500',
};

interface ProjectsDataTableProps {
  projects: Project[];
  isLoading: boolean;
  emptyMessage: string;
  onRowClick: (projectId: string) => void;
  onEdit: (project: Project) => void;
  onDelete: (projectId: string) => void;
}

export function ProjectsDataTable({
  projects,
  isLoading,
  emptyMessage,
  onRowClick,
  onEdit,
  onDelete,
}: ProjectsDataTableProps) {
  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Project Name</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Priority</TableHead>
            <TableHead>Budget</TableHead>
            <TableHead className="w-[70px]">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {isLoading ? (
            Array.from({ length: 10 }).map((_, i) => (
              <TableRow key={i}>
                <TableCell><Skeleton className="h-6 w-32" /></TableCell>
                <TableCell><Skeleton className="h-6 w-20" /></TableCell>
                <TableCell><Skeleton className="h-6 w-16" /></TableCell>
                <TableCell><Skeleton className="h-6 w-20" /></TableCell>
                <TableCell><Skeleton className="h-6 w-8" /></TableCell>
              </TableRow>
            ))
          ) : projects.length === 0 ? (
            <TableRow>
              <TableCell colSpan={5} className="text-center text-muted-foreground py-8">
                {emptyMessage}
              </TableCell>
            </TableRow>
          ) : (
            projects.map((project) => (
              <TableRow 
                key={project.id}
                className="cursor-pointer hover:bg-muted/50"
                onClick={() => onRowClick(project.id)}
              >
                <TableCell className="font-medium">{project.project_name}</TableCell>
                <TableCell>
                  <Badge className={`${statusColors[project.status]} text-white`}>
                    {project.status.replace('_', ' ')}
                  </Badge>
                </TableCell>
                <TableCell className="capitalize">{project.priority}</TableCell>
                <TableCell>${project.total_budget?.toLocaleString() ?? 0}</TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                      <Button variant="ghost" size="icon">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={(e) => {
                        e.stopPropagation();
                        onRowClick(project.id);
                      }}>
                        <Eye className="mr-2 h-4 w-4" />
                        View
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={(e) => {
                        e.stopPropagation();
                        onEdit(project);
                      }}>
                        <Pencil className="mr-2 h-4 w-4" />
                        Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        className="text-destructive"
                        onClick={(e) => {
                          e.stopPropagation();
                          onDelete(project.id);
                        }}
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}

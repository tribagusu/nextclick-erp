/**
 * Projects Table Component
 *
 * Orchestrator component that combines toolbar, data table, and dialogs.
 */

'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { toast } from 'sonner';

import type { Project, ProjectStatus } from '@/shared/types/database.types';
import { useProjects, useDeleteProject } from '../hooks/useProjects';
import { DeleteConfirmDialog } from '@/shared/components/DeleteConfirmDialog';

import { ProjectsToolbar } from './ProjectsToolbar';
import { ProjectsDataTable } from './ProjectsDataTable';
import { ProjectsPagination } from './ProjectsPagination';
import { ProjectFormDialog } from './ProjectFormDialog';

export function ProjectsTable() {
  const router = useRouter();
  
  // State
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState<ProjectStatus | 'all'>('all');
  const [page, setPage] = useState(1);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editProject, setEditProject] = useState<Project | null>(null);

  // Data fetching
  const { data, isLoading, error } = useProjects({
    page,
    pageSize: 10,
    search: search || undefined,
    status: status !== 'all' ? status : undefined,
    sortBy: 'created_at',
    sortOrder: 'desc',
  });

  const deleteMutation = useDeleteProject();

  // Handlers
  const handleSearchChange = (value: string) => {
    setSearch(value);
    setPage(1);
  };

  const handleStatusChange = (value: ProjectStatus | 'all') => {
    setStatus(value);
    setPage(1);
  };

  const handleRowClick = (projectId: string) => {
    router.push(`/projects/${projectId}`);
  };

  const handleDelete = async () => {
    if (deleteId) {
      try {
        await deleteMutation.mutateAsync(deleteId);
        setDeleteId(null);
        toast.success('Project deleted successfully');
      } catch (error) {
        toast.error(error instanceof Error ? error.message : 'Failed to delete project');
      }
    }
  };

  // Error state
  if (error) {
    return (
      <div className="rounded-md border border-destructive p-4">
        <p className="text-destructive">Failed to load projects</p>
      </div>
    );
  }

  const totalPages = data ? Math.ceil(data.total / data.pageSize) : 0;
  const emptyMessage = search || status !== 'all' 
    ? 'No projects found' 
    : 'No projects yet. Add your first project!';

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <ProjectsToolbar
        search={search}
        onSearchChange={handleSearchChange}
        status={status}
        onStatusChange={handleStatusChange}
        onAddClick={() => setCreateDialogOpen(true)}
      />

      {/* Data Table */}
      <ProjectsDataTable
        projects={data?.projects ?? []}
        isLoading={isLoading}
        emptyMessage={emptyMessage}
        onRowClick={handleRowClick}
        onEdit={setEditProject}
        onDelete={setDeleteId}
      />

      {/* Pagination */}
      <ProjectsPagination
        page={page}
        totalPages={totalPages}
        total={data?.total ?? 0}
        pageSize={data?.pageSize ?? 10}
        onPageChange={setPage}
      />

      {/* Dialogs */}
      <DeleteConfirmDialog
        open={!!deleteId}
        onOpenChange={() => setDeleteId(null)}
        onConfirm={handleDelete}
        title="Delete Project"
        description="Are you sure you want to delete this project? This action cannot be undone."
        isLoading={deleteMutation.isPending}
      />

      {/* Create dialog (no project = create mode) */}
      <ProjectFormDialog
        open={createDialogOpen}
        onOpenChange={setCreateDialogOpen}
      />

      {/* Edit dialog (with project = edit mode) */}
      <ProjectFormDialog
        open={!!editProject}
        onOpenChange={(open) => !open && setEditProject(null)}
        project={editProject}
      />
    </div>
  );
}

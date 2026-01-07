/**
 * Projects Table Component
 *
 * Orchestrator component that combines toolbar, data table, and dialogs.
 */

'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';

import type { Project, ProjectStatus } from '@/shared/types/database.types';
import { useProjects, useDeleteProject } from '../hooks/useProjects';

import { ProjectsToolbar } from './ProjectsToolbar';
import { ProjectsDataTable } from './ProjectsDataTable';
import { ProjectsPagination } from './ProjectsPagination';
import { ProjectDeleteDialog } from './ProjectDeleteDialog';
import { ProjectFormDialog } from './ProjectFormDialog';
import { ProjectEditDialog } from './ProjectEditDialog';

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
      await deleteMutation.mutateAsync(deleteId);
      setDeleteId(null);
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
      <ProjectDeleteDialog
        open={!!deleteId}
        onOpenChange={() => setDeleteId(null)}
        onConfirm={handleDelete}
      />

      <ProjectFormDialog
        open={createDialogOpen}
        onOpenChange={setCreateDialogOpen}
      />

      <ProjectEditDialog
        open={!!editProject}
        onOpenChange={(open) => !open && setEditProject(null)}
        project={editProject}
      />
    </div>
  );
}

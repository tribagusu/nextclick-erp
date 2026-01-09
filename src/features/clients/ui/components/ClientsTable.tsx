/**
 * Clients Table Component
 *
 * Orchestrator component that combines toolbar, data table, and dialogs.
 */

'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { toast } from 'sonner';

import type { Client } from '@/shared/types/database.types';
import { useClients, useDeleteClient } from '../hooks/useClients';
import { DeleteConfirmDialog } from '@/shared/components/DeleteConfirmDialog';

import { ClientsToolbar } from './ClientsToolbar';
import { ClientsDataTable } from './ClientsDataTable';
import { ClientsPagination } from './ClientsPagination';
import { ClientFormDialog } from './ClientFormDialog';
import { ClientEditDialog } from './ClientEditDialog';

interface ClientsTableProps {
  initialSearch?: string;
}

export function ClientsTable({ initialSearch = '' }: ClientsTableProps) {
  const router = useRouter();
  
  // State
  const [search, setSearch] = useState(initialSearch);
  const [page, setPage] = useState(1);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editClient, setEditClient] = useState<Client | null>(null);

  // Data fetching
  const { data, isLoading, error } = useClients({
    page,
    pageSize: 10,
    search: search || undefined,
    sortBy: 'created_at',
    sortOrder: 'desc',
  });

  const deleteMutation = useDeleteClient();

  // Handlers
  const handleSearchChange = (value: string) => {
    setSearch(value);
    setPage(1);
  };

  const handleRowClick = (clientId: string) => {
    router.push(`/clients/${clientId}`);
  };

  const handleDelete = async () => {
    if (deleteId) {
      try {
        await deleteMutation.mutateAsync(deleteId);
        setDeleteId(null);
        toast.success('Client deleted successfully');
      } catch (error) {
        toast.error(error instanceof Error ? error.message : 'Failed to delete client');
      }
    }
  };

  // Error state
  if (error) {
    return (
      <div className="rounded-md border border-destructive p-4">
        <p className="text-destructive">Failed to load clients</p>
      </div>
    );
  }

  const totalPages = data ? Math.ceil(data.total / data.pageSize) : 0;
  const emptyMessage = search 
    ? 'No clients found matching your search' 
    : 'No clients yet. Add your first client!';

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <ClientsToolbar
        search={search}
        onSearchChange={handleSearchChange}
        onAddClick={() => setCreateDialogOpen(true)}
      />

      {/* Data Table */}
      <ClientsDataTable
        clients={data?.clients ?? []}
        isLoading={isLoading}
        emptyMessage={emptyMessage}
        onRowClick={handleRowClick}
        onEdit={setEditClient}
        onDelete={setDeleteId}
      />

      {/* Pagination */}
      <ClientsPagination
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
        title="Delete Client"
        description="Are you sure you want to delete this client? This action cannot be undone."
        isLoading={deleteMutation.isPending}
      />

      <ClientFormDialog
        open={createDialogOpen}
        onOpenChange={setCreateDialogOpen}
      />

      <ClientEditDialog
        open={!!editClient}
        onOpenChange={(open) => !open && setEditClient(null)}
        client={editClient}
      />
    </div>
  );
}

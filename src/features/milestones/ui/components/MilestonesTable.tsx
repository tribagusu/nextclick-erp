/**
 * Milestones Table Component
 */

'use client';

import Link from 'next/link';
import { MoreHorizontal, Pencil, Trash2, Eye, Search } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';

import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/components/ui/select';
import { Skeleton } from '@/shared/components/ui/skeleton';
import { DeleteConfirmDialog } from '@/shared/components/DeleteConfirmDialog';

import type { ProjectMilestone, MilestoneStatus } from '@/shared/base-feature/domain/database.types';
import { useMilestones, useDeleteMilestone } from '../hooks/useMilestones';

const statusColors: Record<MilestoneStatus, string> = {
  pending: 'bg-gray-500',
  in_progress: 'bg-blue-500',
  completed: 'bg-green-500',
  cancelled: 'bg-red-500',
};

export function MilestonesTable() {
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState<MilestoneStatus | 'all'>('all');
  const [page, setPage] = useState(1);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const { data, isLoading, error } = useMilestones({
    page,
    pageSize: 10,
    search: search || undefined,
    status: status !== 'all' ? status : undefined,
    sortBy: 'created_at',
    sortOrder: 'desc',
  });

  const deleteMutation = useDeleteMilestone();

  const handleDelete = async () => {
    if (deleteId) {
      try {
        await deleteMutation.mutateAsync(deleteId);
        setDeleteId(null);
        toast.success('Milestone deleted successfully');
      } catch (error) {
        toast.error(error instanceof Error ? error.message : 'Failed to delete milestone');
      }
    }
  };

  if (error) {
    return (
      <div className="rounded-md border border-destructive p-4">
        <p className="text-destructive">Failed to load milestones</p>
      </div>
    );
  }

  const totalPages = data ? Math.ceil(data.total / data.pageSize) : 0;

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 flex-wrap">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search milestones..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            className="pl-9"
          />
        </div>
        <Select value={status} onValueChange={(v) => { setStatus(v as MilestoneStatus | 'all'); setPage(1); }}>
          <SelectTrigger className="w-36">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="in_progress">In Progress</SelectItem>
            <SelectItem value="completed">Completed</SelectItem>
            <SelectItem value="cancelled">Cancelled</SelectItem>
          </SelectContent>
        </Select>
        <Link href="/milestones/new">
          <Button>Add Milestone</Button>
        </Link>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Milestone</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Due Date</TableHead>
              <TableHead className="w-[70px]">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <TableRow key={i}>
                  <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-8" /></TableCell>
                </TableRow>
              ))
            ) : data?.milestones.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="text-center text-muted-foreground py-8">
                  {search || status !== 'all' ? 'No milestones found' : 'No milestones yet'}
                </TableCell>
              </TableRow>
            ) : (
              data?.milestones.map((milestone: ProjectMilestone) => (
                <TableRow key={milestone.id}>
                  <TableCell className="font-medium">{milestone.milestone}</TableCell>
                  <TableCell>
                    <Badge className={`${statusColors[milestone.status]} text-white`}>
                      {milestone.status.replace('_', ' ')}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {milestone.due_date ? new Date(milestone.due_date).toLocaleDateString() : '-'}
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <Link href={`/milestones/${milestone.id}`}>
                          <DropdownMenuItem><Eye className="mr-2 h-4 w-4" />View</DropdownMenuItem>
                        </Link>
                        <Link href={`/milestones/${milestone.id}/edit`}>
                          <DropdownMenuItem><Pencil className="mr-2 h-4 w-4" />Edit</DropdownMenuItem>
                        </Link>
                        <DropdownMenuItem className="text-destructive" onClick={() => setDeleteId(milestone.id)}>
                          <Trash2 className="mr-2 h-4 w-4" />Delete
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

      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Showing {((page - 1) * (data?.pageSize ?? 10)) + 1} to {Math.min(page * (data?.pageSize ?? 10), data?.total ?? 0)} of {data?.total ?? 0}
          </p>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage(page - 1)}>Previous</Button>
            <Button variant="outline" size="sm" disabled={page >= totalPages} onClick={() => setPage(page + 1)}>Next</Button>
          </div>
        </div>
      )}

      <DeleteConfirmDialog
        open={!!deleteId}
        onOpenChange={() => setDeleteId(null)}
        onConfirm={handleDelete}
        title="Delete Milestone"
        description="Are you sure you want to delete this milestone? This action cannot be undone."
        isLoading={deleteMutation.isPending}
      />
    </div>
  );
}

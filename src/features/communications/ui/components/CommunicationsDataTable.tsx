/**
 * Communications Data Table Component
 */

'use client';

import { MoreHorizontal, Pencil, Trash2, Eye, Mail, Phone, Users } from 'lucide-react';

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

import type { CommunicationLog, CommunicationMode } from '@/shared/base-feature/domain/database.types';

const modeIcons: Record<CommunicationMode, React.ReactNode> = {
  email: <Mail className="h-4 w-4" />,
  call: <Phone className="h-4 w-4" />,
  meeting: <Users className="h-4 w-4" />,
};

const modeColors: Record<CommunicationMode, string> = {
  email: 'bg-blue-500',
  call: 'bg-green-500',
  meeting: 'bg-purple-500',
};

type CommunicationWithRelations = CommunicationLog & {
  client_name?: string;
  project_name?: string | null;
};

interface CommunicationsDataTableProps {
  communications: CommunicationWithRelations[];
  isLoading: boolean;
  emptyMessage: string;
  onRowClick: (id: string) => void;
  onEdit: (communication: CommunicationLog) => void;
  onDelete: (id: string) => void;
}

export function CommunicationsDataTable({
  communications,
  isLoading,
  emptyMessage,
  onRowClick,
  onEdit,
  onDelete,
}: CommunicationsDataTableProps) {
  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Date</TableHead>
            <TableHead>Mode</TableHead>
            <TableHead>Client</TableHead>
            <TableHead>Summary</TableHead>
            <TableHead className="w-[70px]">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {isLoading ? (
            Array.from({ length: 5 }).map((_, i) => (
              <TableRow key={i}>
                <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                <TableCell><Skeleton className="h-4 w-48" /></TableCell>
                <TableCell><Skeleton className="h-4 w-8" /></TableCell>
              </TableRow>
            ))
          ) : communications.length === 0 ? (
            <TableRow>
              <TableCell colSpan={5} className="text-center text-muted-foreground py-8">
                {emptyMessage}
              </TableCell>
            </TableRow>
          ) : (
            communications.map((comm) => (
              <TableRow 
                key={comm.id}
                className="cursor-pointer hover:bg-muted/50"
                onClick={() => onRowClick(comm.id)}
              >
                <TableCell>{new Date(comm.date).toLocaleDateString()}</TableCell>
                <TableCell>
                  <Badge className={`${modeColors[comm.mode]} text-white gap-1`}>
                    {modeIcons[comm.mode]}
                    {comm.mode}
                  </Badge>
                </TableCell>
                <TableCell className="font-medium">{comm.client_name ?? '—'}</TableCell>
                <TableCell className="max-w-xs truncate">{comm.summary}</TableCell>
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
                        onRowClick(comm.id);
                      }}>
                        <Eye className="mr-2 h-4 w-4" />
                        View
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={(e) => {
                        e.stopPropagation();
                        onEdit(comm);
                      }}>
                        <Pencil className="mr-2 h-4 w-4" />
                        Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        className="text-destructive"
                        onClick={(e) => {
                          e.stopPropagation();
                          onDelete(comm.id);
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

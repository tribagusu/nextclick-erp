/**
 * Communications Toolbar Component
 */

'use client';

import { Search, Plus } from 'lucide-react';

import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/components/ui/select';

import type { CommunicationMode } from '@/shared/base-feature/domain/database.types';

interface CommunicationsToolbarProps {
  search: string;
  onSearchChange: (value: string) => void;
  mode: CommunicationMode | 'all';
  onModeChange: (value: CommunicationMode | 'all') => void;
  onAddClick: () => void;
}

export function CommunicationsToolbar({ 
  search, 
  onSearchChange, 
  mode, 
  onModeChange, 
  onAddClick 
}: CommunicationsToolbarProps) {
  return (
    <div className="flex items-center gap-2 flex-wrap">
      <div className="relative flex-1 max-w-sm">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Search communications..."
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-9"
        />
      </div>
      <Select value={mode} onValueChange={(v) => onModeChange(v as CommunicationMode | 'all')}>
        <SelectTrigger className="w-32">
          <SelectValue placeholder="Mode" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Modes</SelectItem>
          <SelectItem value="email">Email</SelectItem>
          <SelectItem value="call">Call</SelectItem>
          <SelectItem value="meeting">Meeting</SelectItem>
        </SelectContent>
      </Select>
      <Button onClick={onAddClick}>
        <Plus className="mr-2 h-4 w-4" />
        Add Log
      </Button>
    </div>
  );
}

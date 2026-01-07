/**
 * Milestone Form Dialog Component
 * 
 * Dialog for creating and editing milestones
 */

'use client';

import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2 } from 'lucide-react';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/shared/components/ui/dialog';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import { Label } from '@/shared/components/ui/label';
import { Textarea } from '@/shared/components/ui/textarea';
import { Alert, AlertDescription } from '@/shared/components/ui/alert';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/components/ui/select';

import { useMilestone, useCreateMilestone, useUpdateMilestone } from '../hooks/useMilestones';
import { milestoneFormSchema, milestoneStatusOptions, type MilestoneFormData, transformMilestoneInput } from '../../domain/schemas';

interface MilestoneFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  projectId: string;
  milestoneId: string | null;
}

export function MilestoneFormDialog({
  open,
  onOpenChange,
  projectId,
  milestoneId,
}: MilestoneFormDialogProps) {
  const isEditing = !!milestoneId;

  const { data: milestone, isLoading: loadingMilestone } = useMilestone(milestoneId || '');
  const createMilestone = useCreateMilestone();
  const updateMilestone = useUpdateMilestone();

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<MilestoneFormData>({
    resolver: zodResolver(milestoneFormSchema),
    defaultValues: {
      project_id: projectId,
      milestone: '',
      description: '',
      due_date: '',
      completion_date: '',
      status: 'pending',
      remarks: '',
    },
  });

  const currentStatus = watch('status');
  const error = createMilestone.error || updateMilestone.error;

  // Populate form when editing
  useEffect(() => {
    if (isEditing && milestone) {
      reset({
        project_id: milestone.project_id,
        milestone: milestone.milestone,
        description: milestone.description || '',
        due_date: milestone.due_date || '',
        completion_date: milestone.completion_date || '',
        status: milestone.status,
        remarks: milestone.remarks || '',
      });
    } else if (!isEditing) {
      reset({
        project_id: projectId,
        milestone: '',
        description: '',
        due_date: '',
        completion_date: '',
        status: 'pending',
        remarks: '',
      });
    }
  }, [milestone, isEditing, projectId, reset]);

  const handleFormSubmit = async (data: MilestoneFormData) => {
    const transformed = transformMilestoneInput(data);
    
    try {
      if (isEditing && milestoneId) {
        await updateMilestone.mutateAsync({ id: milestoneId, ...transformed });
      } else {
        await createMilestone.mutateAsync(transformed);
      }
      onOpenChange(false);
    } catch {
      // Error is handled by the mutation state
    }
  };

  const isPending = createMilestone.isPending || updateMilestone.isPending;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? 'Edit Milestone' : 'Add New Milestone'}
          </DialogTitle>
          <DialogDescription>
            {isEditing
              ? 'Update milestone details'
              : 'Create a new milestone to track project progress'}
          </DialogDescription>
        </DialogHeader>

        {isEditing && loadingMilestone ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
            {error && (
              <Alert variant="destructive">
                <AlertDescription>
                  {error instanceof Error ? error.message : 'An error occurred'}
                </AlertDescription>
              </Alert>
            )}

            {/* Milestone Name */}
            <div className="space-y-2">
              <Label htmlFor="milestone">
                Milestone Name <span className="text-destructive">*</span>
              </Label>
              <Input
                id="milestone"
                placeholder="e.g., Project Planning, Backend Development"
                {...register('milestone')}
              />
              {errors.milestone && (
                <p className="text-sm text-destructive">{errors.milestone.message}</p>
              )}
            </div>

            {/* Description */}
            <div className="space-y-2">
              <Label htmlFor="description">
                Description <span className="text-destructive">*</span>
              </Label>
              <Textarea
                id="description"
                placeholder="Describe what needs to be accomplished in this milestone"
                rows={3}
                {...register('description')}
              />
              {errors.description && (
                <p className="text-sm text-destructive">{errors.description.message}</p>
              )}
            </div>

            {/* Dates */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="due_date">
                  Target Finish Date <span className="text-destructive">*</span>
                </Label>
                <Input id="due_date" type="date" {...register('due_date')} />
                {errors.due_date && (
                  <p className="text-sm text-destructive">{errors.due_date.message}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="completion_date">Completion Date</Label>
                <Input id="completion_date" type="date" {...register('completion_date')} />
              </div>
            </div>

            {/* Status */}
            <div className="space-y-2">
              <Label>Status</Label>
              <Select
                value={currentStatus}
                onValueChange={(value) => setValue('status', value as typeof currentStatus)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {milestoneStatusOptions.map((status) => (
                    <SelectItem key={status} value={status}>
                      {status.replace('_', ' ').replace(/\b\w/g, (l) => l.toUpperCase())}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Remarks */}
            <div className="space-y-2">
              <Label htmlFor="remarks">Remarks (Optional)</Label>
              <Textarea
                id="remarks"
                placeholder="Any additional notes or comments"
                rows={2}
                {...register('remarks')}
              />
            </div>

            <DialogFooter className="pt-4">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={isPending || isSubmitting}>
                {(isPending || isSubmitting) && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                {isEditing ? 'Save Changes' : 'Create Milestone'}
              </Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}

/**
 * Milestone Form Dialog Component
 *
 * Dialog for creating and editing milestones.
 * Supports restricted mode for employees where only status, remarks, and completion_date can be edited.
 */

'use client';

import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { format, parseISO } from 'date-fns';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';

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
import { DatePicker } from '@/shared/components/ui/date-picker';

import { useMilestone, useCreateMilestone, useUpdateMilestone } from '../hooks/useMilestones';
import {
  milestoneFormSchema,
  milestoneStatusOptions,
  type MilestoneFormData,
  transformMilestoneInput,
} from '../../domain/schemas';

interface MilestoneFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  projectId: string;
  milestoneId: string | null;
  /**
   * When true, only status, remarks, and completion_date can be edited.
   * Used for employees who are assigned to the milestone.
   */
  restrictedMode?: boolean;
}

export function MilestoneFormDialog({
  open,
  onOpenChange,
  projectId,
  milestoneId,
  restrictedMode = false,
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
  const currentDueDate = watch('due_date');
  const currentCompletionDate = watch('completion_date');
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
        // In restricted mode, only send the fields employees can edit
        if (restrictedMode) {
          await updateMilestone.mutateAsync({
            id: milestoneId,
            status: transformed.status,
            completion_date: transformed.completion_date,
            remarks: transformed.remarks,
          });
        } else {
          await updateMilestone.mutateAsync({ id: milestoneId, ...transformed });
        }
        toast.success('Milestone updated successfully');
      } else {
        await createMilestone.mutateAsync(transformed);
        toast.success('Milestone created successfully');
      }
      onOpenChange(false);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'An error occurred');
    }
  };

  const isPending = createMilestone.isPending || updateMilestone.isPending;

  // Convert date string to Date object for DatePicker
  const parseDateString = (dateStr: string | undefined): Date | null => {
    if (!dateStr) return null;
    try {
      return parseISO(dateStr);
    } catch {
      return null;
    }
  };

  // Convert Date object to date string for form
  const formatDateForForm = (date: Date | undefined): string => {
    if (!date) return '';
    return format(date, 'yyyy-MM-dd');
  };

  // Determine dialog title/description based on mode
  const dialogTitle = restrictedMode
    ? 'Update Milestone Progress'
    : isEditing
      ? 'Edit Milestone'
      : 'Add New Milestone';

  const dialogDescription = restrictedMode
    ? 'Update status, completion date, and remarks for this milestone'
    : isEditing
      ? 'Update milestone details'
      : 'Create a new milestone to track project progress';

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{dialogTitle}</DialogTitle>
          <DialogDescription>{dialogDescription}</DialogDescription>
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

            {/* Milestone Name - disabled in restricted mode */}
            {!restrictedMode && (
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
            )}

            {/* Description - disabled in restricted mode */}
            {!restrictedMode && (
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
            )}

            {/* Dates - due_date disabled in restricted mode */}
            <div className="grid grid-cols-2 gap-4">
              {!restrictedMode && (
                <div className="space-y-2">
                  <Label>
                    Target Finish Date <span className="text-destructive">*</span>
                  </Label>
                  <DatePicker
                    value={parseDateString(currentDueDate)}
                    onChange={(date) => setValue('due_date', formatDateForForm(date))}
                    placeholder="Select due date"
                  />
                  {errors.due_date && (
                    <p className="text-sm text-destructive">{errors.due_date.message}</p>
                  )}
                </div>
              )}
              <div className={restrictedMode ? 'col-span-2' : ''}>
                <div className="space-y-2">
                  <Label>Completion Date</Label>
                  <DatePicker
                    value={parseDateString(currentCompletionDate)}
                    onChange={(date) => setValue('completion_date', formatDateForForm(date))}
                    placeholder="Select completion date"
                  />
                </div>
              </div>
            </div>

            {/* Status - always editable */}
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

            {/* Remarks - always editable */}
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

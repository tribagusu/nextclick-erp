/**
 * Milestone Progress Component
 * 
 * Shows overall milestone progress with breakdown by status
 */

'use client';

import { TrendingUp, CheckCircle2, Clock, Circle, XCircle } from 'lucide-react';

import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { Progress } from '@/shared/components/ui/progress';

interface MilestoneProgressProps {
  total: number;
  completed: number;
  inProgress: number;
  pending: number;
  cancelled: number;
  progressPercent: number;
}

export function MilestoneProgress({
  total,
  completed,
  inProgress,
  pending,
  cancelled,
  progressPercent,
}: MilestoneProgressProps) {
  return (
    <Card className="sticky top-6">
      <CardHeader className="pb-3">
        <div className="flex items-center gap-2">
          <TrendingUp className="h-4 w-4 text-muted-foreground" />
          <CardTitle className="text-base">Milestone Progress</CardTitle>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Progress Bar */}
        <div>
          <div className="flex justify-between text-sm mb-2">
            <span className="text-muted-foreground">Overall Progress</span>
            <span className="font-medium">{progressPercent}%</span>
          </div>
          <Progress value={progressPercent} className="h-2" />
          <p className="text-xs text-muted-foreground mt-1">
            {completed} of {total} milestones completed
          </p>
        </div>

        {/* Status Breakdown */}
        <div className="grid grid-cols-2 gap-3 pt-2">
          <StatusItem
            icon={<CheckCircle2 className="h-4 w-4 text-green-500" />}
            count={completed}
            label="Completed"
          />
          <StatusItem
            icon={<Clock className="h-4 w-4 text-blue-500" />}
            count={inProgress}
            label="In Progress"
          />
          <StatusItem
            icon={<Circle className="h-4 w-4 text-gray-400" />}
            count={pending}
            label="Pending"
          />
          <StatusItem
            icon={<XCircle className="h-4 w-4 text-red-500" />}
            count={cancelled}
            label="Cancelled"
          />
        </div>
      </CardContent>
    </Card>
  );
}

function StatusItem({
  icon,
  count,
  label,
}: {
  icon: React.ReactNode;
  count: number;
  label: string;
}) {
  return (
    <div className="flex flex-col items-center p-3 rounded-lg border bg-muted/30">
      {icon}
      <span className="text-xl font-semibold mt-1">{count}</span>
      <span className="text-xs text-muted-foreground">{label}</span>
    </div>
  );
}

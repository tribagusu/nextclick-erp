/**
 * Communication Detail Page
 */

'use client';

import { use } from 'react';
import Link from 'next/link';
import { ArrowLeft, Pencil, Calendar, Mail, Phone, Users, Clock, Bell } from 'lucide-react';

import { Button } from '@/shared/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { Skeleton } from '@/shared/components/ui/skeleton';
import { Badge } from '@/shared/components/ui/badge';

import { useCommunication } from '@/features/communications/ui/hooks/useCommunications';
import type { CommunicationMode } from '@/shared/types/database.types';

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

interface CommunicationDetailPageProps {
  params: Promise<{ id: string }>;
}

export default function CommunicationDetailPage({ params }: CommunicationDetailPageProps) {
  const { id } = use(params);
  const { data: communication, isLoading, error } = useCommunication(id);

  if (error) {
    return (
      <div className="p-6">
        <div className="rounded-md border border-destructive p-4">
          <p className="text-destructive">Failed to load communication</p>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="p-6 space-y-6">
        <div className="flex items-center gap-4">
          <Skeleton className="h-10 w-10" />
          <div className="space-y-2">
            <Skeleton className="h-8 w-64" />
            <Skeleton className="h-4 w-32" />
          </div>
        </div>
        <div className="grid gap-6 md:grid-cols-2">
          <Skeleton className="h-48" />
          <Skeleton className="h-48" />
        </div>
      </div>
    );
  }

  if (!communication) {
    return (
      <div className="p-6">
        <div className="rounded-md border p-4">
          <p className="text-muted-foreground">Communication not found</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/communications">
            <Button variant="ghost" size="icon"><ArrowLeft className="h-4 w-4" /></Button>
          </Link>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-3xl font-bold">Communication Log</h1>
              <Badge className={`${modeColors[communication.mode]} text-white gap-1`}>
                {modeIcons[communication.mode]}
                {communication.mode}
              </Badge>
            </div>
            <p className="text-muted-foreground">Client: {communication.client_name}</p>
          </div>
        </div>
        <Link href={`/communications/${id}/edit`}>
          <Button><Pencil className="mr-2 h-4 w-4" />Edit</Button>
        </Link>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Details</CardTitle>
            <CardDescription>Communication information</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-3">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <span>Date: {new Date(communication.date).toLocaleDateString()}</span>
            </div>
            {communication.project_name && (
              <div className="flex items-center gap-3">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <span>Project: {communication.project_name}</span>
              </div>
            )}
            <div>
              <p className="text-sm text-muted-foreground mb-2">Summary</p>
              <p className="whitespace-pre-wrap">{communication.summary}</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Follow-up</CardTitle>
            <CardDescription>Action items</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {communication.follow_up_required ? (
              <>
                <div className="flex items-center gap-3">
                  <Bell className="h-4 w-4 text-orange-500" />
                  <Badge variant="outline" className="text-orange-600 border-orange-600">
                    Follow-up Required
                  </Badge>
                </div>
                {communication.follow_up_date && (
                  <div className="flex items-center gap-3">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span>Due: {new Date(communication.follow_up_date).toLocaleDateString()}</span>
                  </div>
                )}
              </>
            ) : (
              <p className="text-muted-foreground">No follow-up required</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

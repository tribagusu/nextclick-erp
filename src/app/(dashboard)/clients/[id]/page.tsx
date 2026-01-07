/**
 * Client Detail Page
 */

'use client';

import { use, useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Pencil, Mail, Phone, Building, MapPin, FileText, FolderKanban } from 'lucide-react';

import { Button } from '@/shared/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { Skeleton } from '@/shared/components/ui/skeleton';
import { Badge } from '@/shared/components/ui/badge';

import { useClient } from '@/features/clients/ui/hooks/useClients';
import { ClientEditDialog } from '@/features/clients/ui/components/ClientEditDialog';

interface ClientDetailPageProps {
  params: Promise<{ id: string }>;
}

export default function ClientDetailPage({ params }: ClientDetailPageProps) {
  const { id } = use(params);
  const { data: client, isLoading, error } = useClient(id);
  const [editDialogOpen, setEditDialogOpen] = useState(false);

  if (error) {
    return (
      <div className="p-6">
        <div className="rounded-md border border-destructive p-4">
          <p className="text-destructive">Failed to load client</p>
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
            <Skeleton className="h-8 w-48" />
            <Skeleton className="h-4 w-32" />
          </div>
        </div>
        <Skeleton className="h-64 w-full max-w-2xl" />
      </div>
    );
  }

  if (!client) {
    return (
      <div className="p-6">
        <div className="rounded-md border p-4">
          <p className="text-muted-foreground">Client not found</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/clients">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold">{client.name}</h1>
            <p className="text-muted-foreground">
              Client since {new Date(client.created_at).toLocaleDateString()}
            </p>
          </div>
        </div>
        <Button onClick={() => setEditDialogOpen(true)}>
          <Pencil className="mr-2 h-4 w-4" />
          Edit Client
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Contact Information */}
        <Card>
          <CardHeader>
            <CardTitle>Contact Information</CardTitle>
            <CardDescription>Client contact details</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {client.email && (
              <div className="flex items-center gap-3">
                <Mail className="h-4 w-4 text-muted-foreground" />
                <a href={`mailto:${client.email}`} className="text-primary hover:underline">
                  {client.email}
                </a>
              </div>
            )}
            {client.phone && (
              <div className="flex items-center gap-3">
                <Phone className="h-4 w-4 text-muted-foreground" />
                <a href={`tel:${client.phone}`} className="hover:underline">
                  {client.phone}
                </a>
              </div>
            )}
            {client.company_name && (
              <div className="flex items-center gap-3">
                <Building className="h-4 w-4 text-muted-foreground" />
                <span>{client.company_name}</span>
              </div>
            )}
            {client.address && (
              <div className="flex items-center gap-3">
                <MapPin className="h-4 w-4 text-muted-foreground" />
                <span>{client.address}</span>
              </div>
            )}
            {!client.email && !client.phone && !client.company_name && !client.address && (
              <p className="text-muted-foreground">No contact information available</p>
            )}
          </CardContent>
        </Card>

        {/* Stats */}
        <Card>
          <CardHeader>
            <CardTitle>Stats</CardTitle>
            <CardDescription>Client activity summary</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-3">
              <FolderKanban className="h-4 w-4 text-muted-foreground" />
              <span>{client.projectCount} Projects</span>
              {client.projectCount > 0 && (
                <Badge variant="secondary">Active</Badge>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Notes */}
        {client.notes && (
          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-4 w-4" />
                Notes
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="whitespace-pre-wrap">{client.notes}</p>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Edit Client Dialog */}
      <ClientEditDialog
        open={editDialogOpen}
        onOpenChange={setEditDialogOpen}
        client={client}
      />
    </div>
  );
}

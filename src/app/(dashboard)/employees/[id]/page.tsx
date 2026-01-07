/**
 * Employee Detail Page
 */

'use client';

import { use } from 'react';
import Link from 'next/link';
import { ArrowLeft, Pencil, Mail, Phone, Building, Briefcase, Calendar, DollarSign, FolderKanban } from 'lucide-react';

import { Button } from '@/shared/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { Skeleton } from '@/shared/components/ui/skeleton';
import { Badge } from '@/shared/components/ui/badge';

import { useEmployee } from '@/features/employees/ui/hooks/useEmployees';

const statusColors = {
  active: 'bg-green-500',
  inactive: 'bg-yellow-500',
  on_leave: 'bg-orange-500',
};

interface EmployeeDetailPageProps {
  params: Promise<{ id: string }>;
}

export default function EmployeeDetailPage({ params }: EmployeeDetailPageProps) {
  const { id } = use(params);
  const { data: employee, isLoading, error } = useEmployee(id);

  if (error) {
    return (
      <div className="p-6">
        <div className="rounded-md border border-destructive p-4">
          <p className="text-destructive">Failed to load employee</p>
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

  if (!employee) {
    return (
      <div className="p-6">
        <div className="rounded-md border p-4">
          <p className="text-muted-foreground">Employee not found</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/employees">
            <Button variant="ghost" size="icon"><ArrowLeft className="h-4 w-4" /></Button>
          </Link>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-3xl font-bold">{employee.name}</h1>
              <Badge className={`${statusColors[employee.status]} text-white`}>{employee.status}</Badge>
            </div>
            <p className="text-muted-foreground">{employee.position || 'No position set'}</p>
          </div>
        </div>
        <Link href={`/employees/${id}/edit`}>
          <Button><Pencil className="mr-2 h-4 w-4" />Edit</Button>
        </Link>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Contact Information</CardTitle>
            <CardDescription>Employee contact details</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {employee.email && (
              <div className="flex items-center gap-3">
                <Mail className="h-4 w-4 text-muted-foreground" />
                <a href={`mailto:${employee.email}`} className="text-primary hover:underline">{employee.email}</a>
              </div>
            )}
            {employee.phone && (
              <div className="flex items-center gap-3">
                <Phone className="h-4 w-4 text-muted-foreground" />
                <span>{employee.phone}</span>
              </div>
            )}
            {employee.department && (
              <div className="flex items-center gap-3">
                <Building className="h-4 w-4 text-muted-foreground" />
                <span>{employee.department}</span>
              </div>
            )}
            {!employee.email && !employee.phone && !employee.department && (
              <p className="text-muted-foreground">No contact information</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Employment Details</CardTitle>
            <CardDescription>Job and compensation</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {employee.position && (
              <div className="flex items-center gap-3">
                <Briefcase className="h-4 w-4 text-muted-foreground" />
                <span>{employee.position}</span>
              </div>
            )}
            {employee.hire_date && (
              <div className="flex items-center gap-3">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span>Hired {new Date(employee.hire_date).toLocaleDateString()}</span>
              </div>
            )}
            {employee.salary && (
              <div className="flex items-center gap-3">
                <DollarSign className="h-4 w-4 text-muted-foreground" />
                <span>${employee.salary.toLocaleString()}</span>
              </div>
            )}
            <div className="flex items-center gap-3">
              <FolderKanban className="h-4 w-4 text-muted-foreground" />
              <span>{employee.projectCount} Projects assigned</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

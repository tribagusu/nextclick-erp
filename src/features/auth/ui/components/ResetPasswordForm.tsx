/**
 * Reset Password Form Component
 *
 * Form to set new password after clicking reset link.
 */

'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2, CheckCircle } from 'lucide-react';
import Link from 'next/link';

import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import { Label } from '@/shared/components/ui/label';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/shared/components/ui/card';
import { Alert, AlertDescription } from '@/shared/components/ui/alert';

import { resetPasswordSchema, type ResetPasswordFormData } from '../../domain/schemas';
import { useResetPassword } from '../hooks/useAuth';

export function ResetPasswordForm() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<boolean>(false);
  const resetPasswordMutation = useResetPassword();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ResetPasswordFormData>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      password: '',
      confirmPassword: '',
    },
  });

  const onSubmit = async (data: ResetPasswordFormData) => {
    setError(null);

    const result = await resetPasswordMutation.mutateAsync({
      password: data.password,
      confirmPassword: data.confirmPassword,
    });

    if (!result.success) {
      setError(result.error || 'Failed to reset password');
      return;
    }

    setSuccess(true);
    // Redirect to sign in after a delay
    setTimeout(() => {
      router.push('/signin');
    }, 2000);
  };

  if (success) {
    return (
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <div className="flex items-center gap-2">
            <CheckCircle className="h-6 w-6 text-green-500" />
            <CardTitle className="text-2xl font-bold">Password Reset</CardTitle>
          </div>
          <CardDescription>
            Your password has been successfully reset.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Redirecting you to sign in...
          </p>
        </CardContent>
        <CardFooter>
          <Link href="/signin" className="w-full">
            <Button className="w-full">Sign In Now</Button>
          </Link>
        </CardFooter>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-md">
      <CardHeader className="space-y-1">
        <CardTitle className="text-2xl font-bold">Reset Password</CardTitle>
        <CardDescription>
          Enter your new password below
        </CardDescription>
      </CardHeader>

      <form onSubmit={handleSubmit(onSubmit)}>
        <CardContent className="space-y-4">
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="space-y-2">
            <Label htmlFor="password">New Password</Label>
            <Input
              id="password"
              type="password"
              autoComplete="new-password"
              {...register('password')}
            />
            {errors.password && (
              <p className="text-sm text-destructive">{errors.password.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirmPassword">Confirm Password</Label>
            <Input
              id="confirmPassword"
              type="password"
              autoComplete="new-password"
              {...register('confirmPassword')}
            />
            {errors.confirmPassword && (
              <p className="text-sm text-destructive">{errors.confirmPassword.message}</p>
            )}
          </div>
        </CardContent>

        <CardFooter>
          <Button
            type="submit"
            className="w-full"
            disabled={isSubmitting || resetPasswordMutation.isPending}
          >
            {(isSubmitting || resetPasswordMutation.isPending) && (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            )}
            Reset Password
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}

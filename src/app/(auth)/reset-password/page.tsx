/**
 * Reset Password Page
 */

import { ResetPasswordForm } from '@/features/auth/ui/components/ResetPasswordForm';

export const metadata = {
  title: 'Reset Password | Next Click ERP',
  description: 'Set your new password',
};

export default function ResetPasswordPage() {
  return <ResetPasswordForm />;
}

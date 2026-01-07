/**
 * Forgot Password Page
 */

import { ForgotPasswordForm } from '@/features/auth/ui/components/ForgotPasswordForm';

export const metadata = {
  title: 'Forgot Password | Next Click ERP',
  description: 'Reset your password',
};

export default function ForgotPasswordPage() {
  return <ForgotPasswordForm />;
}

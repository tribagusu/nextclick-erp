/**
 * Sign In Page
 */

import { SignInForm } from '@/features/auth/ui/components/SignInForm';

export const metadata = {
  title: 'Sign In | Next Click ERP',
  description: 'Sign in to your account',
};

export default function SignInPage() {
  return <SignInForm />;
}

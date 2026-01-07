/**
 * Sign Up Page
 */

import { SignUpForm } from '@/features/auth/ui/components/SignUpForm';

export const metadata = {
  title: 'Sign Up | Nextclick ERP',
  description: 'Create a new account',
};

export default function SignUpPage() {
  return <SignUpForm />;
}

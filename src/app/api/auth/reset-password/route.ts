/**
 * Auth Reset Password API Route
 * POST /api/auth/reset-password
 */

import { handleResetPassword } from '@/features/auth/api/handlers';

export const POST = handleResetPassword;

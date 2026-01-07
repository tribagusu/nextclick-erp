/**
 * Auth Forgot Password API Route
 * POST /api/auth/forgot-password
 */

import { handleForgotPassword } from '@/features/auth/api/handlers';

export const POST = handleForgotPassword;

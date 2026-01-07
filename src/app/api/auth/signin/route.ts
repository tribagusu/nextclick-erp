/**
 * Auth Sign In API Route
 * POST /api/auth/signin
 */

import { handleSignIn } from '@/features/auth/api/handlers';

export const POST = handleSignIn;

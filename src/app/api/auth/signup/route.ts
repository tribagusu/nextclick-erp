/**
 * Auth Sign Up API Route
 * POST /api/auth/signup
 */

import { handleSignUp } from '@/features/auth/api/handlers';

export const POST = handleSignUp;

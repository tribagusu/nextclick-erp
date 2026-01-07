/**
 * Auth Me API Route
 * GET /api/auth/me - Get current authenticated user
 */

import { handleGetCurrentUser } from '@/features/auth/api/handlers';

export const GET = handleGetCurrentUser;

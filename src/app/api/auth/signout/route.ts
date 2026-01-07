/**
 * Auth Sign Out API Route
 * POST /api/auth/signout
 */

import { handleSignOut } from '@/features/auth/api/handlers';

export const POST = handleSignOut;

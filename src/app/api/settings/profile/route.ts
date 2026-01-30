/**
 * Settings Profile API Route
 * /api/settings/profile
 */

import { handleGetProfile, handleUpdateProfile } from '@/features/settings/api/handlers';

export const GET = handleGetProfile;
export const PATCH = handleUpdateProfile;

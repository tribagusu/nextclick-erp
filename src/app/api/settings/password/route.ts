/**
 * Settings Password API Route
 * /api/settings/password
 */

import { handleChangePassword } from '@/features/settings/api/handlers';

export const POST = handleChangePassword;

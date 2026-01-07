/**
 * Employees API Route
 */

import { handleGetEmployees, handleCreateEmployee } from '@/features/employees/api/handlers';

export const GET = handleGetEmployees;
export const POST = handleCreateEmployee;

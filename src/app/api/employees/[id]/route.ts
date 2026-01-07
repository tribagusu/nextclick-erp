/**
 * Single Employee API Route
 */

import { handleGetEmployee, handleUpdateEmployee, handleDeleteEmployee } from '@/features/employees/api/handlers';

export const GET = handleGetEmployee;
export const PUT = handleUpdateEmployee;
export const DELETE = handleDeleteEmployee;

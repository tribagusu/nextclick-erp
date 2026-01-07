/**
 * Single Client API Route
 * GET /api/clients/[id] - Get client
 * PUT /api/clients/[id] - Update client
 * DELETE /api/clients/[id] - Delete client
 */

import { handleGetClient, handleUpdateClient, handleDeleteClient } from '@/features/clients/api/handlers';

export const GET = handleGetClient;
export const PUT = handleUpdateClient;
export const DELETE = handleDeleteClient;

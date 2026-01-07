/**
 * Clients API Route
 * GET /api/clients - List clients (paginated)
 * POST /api/clients - Create client
 */

import { handleGetClients, handleCreateClient } from '@/features/clients/api/handlers';

export const GET = handleGetClients;
export const POST = handleCreateClient;

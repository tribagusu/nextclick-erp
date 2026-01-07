/**
 * Clients Feature - API Handlers
 *
 * HTTP request handlers for client CRUD operations.
 */

import { createClient } from '@/shared/lib/supabase/server';
import { ClientService } from '../domain/services/client.service';
import {
  successResponse,
  validationErrorResponse,
  unauthorizedResponse,
  notFoundResponse,
  internalErrorResponse,
} from '@/shared/lib/api/api-utils';

/**
 * Get all clients (paginated)
 */
export async function handleGetClients(request: Request) {
  try {
    const supabase = await createClient();

    // Check authentication
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return unauthorizedResponse();
    }

    const url = new URL(request.url);
    const params = {
      page: parseInt(url.searchParams.get('page') ?? '1'),
      pageSize: parseInt(url.searchParams.get('pageSize') ?? '10'),
      search: url.searchParams.get('search') ?? undefined,
      sortBy: (url.searchParams.get('sortBy') as 'name' | 'created_at') ?? 'created_at',
      sortOrder: (url.searchParams.get('sortOrder') as 'asc' | 'desc') ?? 'desc',
    };

    const clientService = new ClientService(supabase);
    const data = await clientService.getClients(params);

    return successResponse(data);
  } catch (error) {
    console.error('Get clients error:', error);
    return internalErrorResponse();
  }
}

/**
 * Get single client by ID
 */
export async function handleGetClient(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const supabase = await createClient();

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return unauthorizedResponse();
    }

    const { id } = await params;
    const clientService = new ClientService(supabase);
    const client = await clientService.getClientWithStats(id);

    if (!client) {
      return notFoundResponse('Client');
    }

    return successResponse(client);
  } catch (error) {
    console.error('Get client error:', error);
    return internalErrorResponse();
  }
}

/**
 * Create new client
 */
export async function handleCreateClient(request: Request) {
  try {
    const supabase = await createClient();

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return unauthorizedResponse();
    }

    const body = await request.json();
    const clientService = new ClientService(supabase);
    const result = await clientService.createClient(body);

    if (!result.success) {
      return validationErrorResponse(result.error || 'Failed to create client');
    }

    return successResponse(result.client, undefined, 201);
  } catch (error) {
    console.error('Create client error:', error);
    return internalErrorResponse();
  }
}

/**
 * Update existing client
 */
export async function handleUpdateClient(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const supabase = await createClient();

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return unauthorizedResponse();
    }

    const { id } = await params;
    const body = await request.json();
    const clientService = new ClientService(supabase);
    const result = await clientService.updateClient(id, body);

    if (!result.success) {
      return validationErrorResponse(result.error || 'Failed to update client');
    }

    return successResponse(result.client);
  } catch (error) {
    console.error('Update client error:', error);
    return internalErrorResponse();
  }
}

/**
 * Delete client (soft delete)
 */
export async function handleDeleteClient(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const supabase = await createClient();

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return unauthorizedResponse();
    }

    const { id } = await params;
    const clientService = new ClientService(supabase);
    const result = await clientService.deleteClient(id);

    if (!result.success) {
      return validationErrorResponse(result.error || 'Failed to delete client');
    }

    return successResponse({ message: 'Client deleted successfully' });
  } catch (error) {
    console.error('Delete client error:', error);
    return internalErrorResponse();
  }
}

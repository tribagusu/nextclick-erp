/**
 * Client CSV Import Configuration
 *
 * Plugs into the shared CsvImportDialog with client-specific
 * columns, validation schema, and transform logic.
 */

import type { CsvImportConfig } from '@/shared/csv-import';
import { clientApiSchema, type ClientApiData } from '../domain/schemas';

/**
 * Transform a raw CSV row (all strings) into the shape clientApiSchema expects.
 * Empty strings become null for optional/nullable fields.
 */
function transformClientCsvRow(
  raw: Record<string, string>
): Record<string, unknown> {
  return {
    name: raw.name ?? '',
    email: raw.email?.trim() || null,
    phone: raw.phone?.trim() || null,
    company_name: raw.company_name ?? '',
    address: raw.address ?? '',
    notes: raw.notes?.trim() || null,
  };
}

export const clientCsvImportConfig: CsvImportConfig<ClientApiData> = {
  title: 'Import Clients from CSV',
  entityName: 'Client',
  entityNamePlural: 'Clients',
  columns: [
    { key: 'name', label: 'name', required: true },
    { key: 'company_name', label: 'company_name', required: true },
    { key: 'address', label: 'address', required: true },
    { key: 'email', label: 'email', required: false },
    { key: 'phone', label: 'phone', required: false },
    { key: 'notes', label: 'notes', required: false },
  ],
  rowSchema: clientApiSchema,
  transformRow: transformClientCsvRow,
  apiEndpoint: '/api/clients/import',
};

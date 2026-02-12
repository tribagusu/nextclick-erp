/**
 * Project CSV Import Configuration
 *
 * Plugs into the shared CsvImportDialog with project-specific
 * columns, validation schema, and transform logic.
 *
 * Key difference from clients: CSV uses `client_name` (human-readable)
 * which is resolved to `client_id` server-side.
 */

import type { CsvImportConfig } from '@/shared/csv-import';
import { projectCsvSchema, type ProjectCsvData } from '../domain/schemas';

/**
 * Transform a raw CSV row (all strings) into the shape projectCsvSchema expects.
 * Empty strings become null for optional/nullable fields.
 * Budget string is parsed to a number.
 * Status/priority are lowercased; empty values become undefined so Zod defaults apply.
 */
function transformProjectCsvRow(
  raw: Record<string, string>
): Record<string, unknown> {
  const budgetStr = raw.total_budget?.trim();

  return {
    project_name: raw.project_name ?? '',
    client_name: raw.client_name?.trim() ?? '',
    description: raw.description?.trim() || null,
    start_date: raw.start_date?.trim() || null,
    end_date: raw.end_date?.trim() || null,
    status: raw.status?.trim().toLowerCase() || undefined,
    priority: raw.priority?.trim().toLowerCase() || undefined,
    total_budget: budgetStr ? parseFloat(budgetStr) : null,
    payment_terms: raw.payment_terms?.trim() || null,
  };
}

export const projectCsvImportConfig: CsvImportConfig<ProjectCsvData> = {
  title: 'Import Projects from CSV',
  entityName: 'Project',
  entityNamePlural: 'Projects',
  columns: [
    { key: 'project_name', label: 'project_name', required: true },
    { key: 'client_name', label: 'client_name', required: true },
    { key: 'description', label: 'description', required: false },
    { key: 'status', label: 'status', required: false },
    { key: 'priority', label: 'priority', required: false },
    { key: 'start_date', label: 'start_date', required: false },
    { key: 'end_date', label: 'end_date', required: false },
    { key: 'total_budget', label: 'total_budget', required: false },
    { key: 'payment_terms', label: 'payment_terms', required: false },
  ],
  rowSchema: projectCsvSchema,
  transformRow: transformProjectCsvRow,
  apiEndpoint: '/api/projects/import',
};

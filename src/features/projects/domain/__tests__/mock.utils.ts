/**
 * Utility Functions to get mock objects for testing
 */

import { projectPriorityOptions, projectStatusOptions } from "@/features/projects/domain/schemas";
import { Project } from "@/shared/base-feature/domain/database.types";


export function getValidProjectMock(): Project {
  return {
    id: crypto.randomUUID(),
    project_name: 'Website Redesign',
    client_id: 'client-1',
    description: 'Complete website overhaul',
    status: 'draft',
    priority: 'high',
    total_budget: 50000,
    amount_paid: 0,
    start_date: '2024-01-01',
    end_date: '2024-06-01',
    payment_terms: 'Net 30',
    last_payment_date: '2024-01-01',
    created_at: '2024-01-01',
    updated_at: '2024-01-01',
    deleted_at: null,
  };
}

export function getInvalidProjectMock() {
  return {
    project_name: '',
    client_id: '',
    status: projectStatusOptions[0],
    priority: projectPriorityOptions[0],
    total_budget: '',
    amount_paid: '',
    payment_terms: 23,
  };
}

export function getInputProjectMock() {
  const { id, created_at, updated_at, deleted_at, ...input } = getValidProjectMock();
  return input;
}
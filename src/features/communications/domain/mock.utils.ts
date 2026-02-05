/**
 * Utility Functions to get mock objects for testing
 */

import { communicationModeOptions } from "@/features/communications/domain/schemas";

export function getValidCommunicationMock() {
  return {
    id: crypto.randomUUID(),
    client_id: 'client-1',
    project_id: null,
    date: '2024-01-15',
    mode: communicationModeOptions[0],
    summary: 'Discussed project requirements and timeline',
    follow_up_required: true,
    follow_up_date: '2024-01-22',
    created_at: '2024-01-15',
    updated_at: '2024-01-15',
    deleted_at: null,
  };
}

export function getInvalidCommunicationMock() {
  return {
    client_id: '',
    date: '',
    mode: 'invalid',
    summary: 'too short',
    follow_up_required: 0,
  };
}

export function getInputCommunicationMock() {
  const { id, created_at, updated_at, deleted_at, ...input } = getValidCommunicationMock();
  return input;
}
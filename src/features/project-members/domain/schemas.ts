/**
 * Project Members Feature - Validation Schemas
 */

import { z } from 'zod';

export const addProjectMemberSchema = z.object({
  project_id: z.string().uuid('Invalid project ID'),
  employee_id: z.string().uuid('Invalid employee ID'),
  role: z.string().max(100).optional().nullable(),
});

export type AddProjectMemberData = z.infer<typeof addProjectMemberSchema>;

export const removeProjectMemberSchema = z.object({
  project_id: z.string().uuid('Invalid project ID'),
  employee_id: z.string().uuid('Invalid employee ID'),
});

export type RemoveProjectMemberData = z.infer<typeof removeProjectMemberSchema>;

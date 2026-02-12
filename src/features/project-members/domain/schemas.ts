/**
 * Project Members Feature - Validation Schemas
 */

import { z } from 'zod';

export const addProjectMemberSchema = z.object({
  project_id: z.string().uuid('Please select a valid project'),
  employee_id: z.string().uuid('Please select a valid team member'),
  role: z
    .string()
    .max(100, 'Role name cannot exceed 100 characters')
    .optional()
    .nullable(),
});

export type AddProjectMemberData = z.infer<typeof addProjectMemberSchema>;

export const removeProjectMemberSchema = z.object({
  project_id: z.string().uuid('Please select a valid project'),
  employee_id: z.string().uuid('Please select a valid team member'),
});

export type RemoveProjectMemberData = z.infer<typeof removeProjectMemberSchema>;

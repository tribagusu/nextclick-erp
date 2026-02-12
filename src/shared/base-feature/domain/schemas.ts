/**
 * Base Feature - Common Validation Schemas
 */

import { z } from 'zod';

export const uuidSchema = z.object({
  id: z.uuid('Invalid UUID format'),
});
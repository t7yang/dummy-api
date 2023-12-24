import { z } from 'zod';
import { idSchema } from '../shared/schema/index.js';

export interface Cart {
  id: number;
  userId: number;
  products: number[];
}

export const cartCreateSchema = z.object({
  userId: idSchema,
  products: z.array(idSchema),
});

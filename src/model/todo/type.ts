import { z } from 'zod';
import { booleanQuerySchema, idQuerySchema, idSchema } from '../shared/schema/index.js';

export interface Todo {
  id: number;
  todo: string;
  completed: boolean;
  userId: number;
}

export const todoCreateSchema = z.object({
  todo: z.string(),
  completed: z.boolean(),
  userId: idSchema,
});

export const todosQuerySchema = z
  .object({
    completed: booleanQuerySchema.pipe(z.boolean({ coerce: true })),
    userId: z.string().pipe(idQuerySchema),
  })
  .partial();

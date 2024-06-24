import * as v from 'valibot';
import { booleanQuerySchema, idSchema } from '../shared/schema/index.js';

export interface Todo {
  id: number;
  todo: string;
  completed: boolean;
  userId: number;
}

export const todoUpdateSchema = v.object({
  todo: v.string(),
  completed: v.boolean(),
});

export const todoCreateSchema = v.object({
  ...todoUpdateSchema.entries,
  userId: idSchema,
});

export const todosQuerySchema = v.partial(v.object({ completed: booleanQuerySchema }));

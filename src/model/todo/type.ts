import * as v from 'valibot';
import { booleanQuerySchema, idQuerySchema, idSchema } from '../shared/schema/index.js';

export interface Todo {
  id: number;
  todo: string;
  completed: boolean;
  userId: number;
}

export const todoCreateSchema = v.object(
  {
    todo: v.string(),
    completed: v.boolean(),
    userId: idSchema,
  },
  v.never(),
);

export const todosQuerySchema = v.partial(
  v.object(
    {
      completed: v.transform(booleanQuerySchema, input => input === 'true'),
      userId: v.transform(v.string(), Number, idQuerySchema),
    },
    v.never(),
  ),
);

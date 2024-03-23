import * as v from 'valibot';
import { idSchema } from '../shared/schema';

export interface Cart {
  id: number;
  userId: number;
  products: number[];
}

export const cartCreateSchema = v.object(
  {
    userId: v.number([v.integer(), v.minValue(1)]),
    products: v.array(idSchema),
  },
  v.never(),
);

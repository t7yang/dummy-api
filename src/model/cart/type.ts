import * as v from 'valibot';
import { idSchema } from '../shared/schema';

export interface Cart {
  id: number;
  userId: number;
  products: number[];
}

export const cartCreateSchema = v.object({ products: v.array(idSchema) });

import { JSONFilePreset } from 'lowdb/node';
import type { Cart } from '../model/cart/type';
import type { Product } from '../model/product/type';
import type { Todo } from '../model/todo/type';
import type { User } from '../model/user/type';

const defaultData = {
  sessions: {} as Record<string, Pick<User, 'id'> & { expired: number }>,
  users: [] as User[],
  todos: [] as Todo[],
  carts: [] as Cart[],
  products: [] as Product[],
};

export const db = await JSONFilePreset(new URL('../../.db.json', import.meta.url), defaultData);

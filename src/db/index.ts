import { JSONFilePreset } from 'lowdb/node';
import { Cart } from '../model/cart/type.js';
import { Product } from '../model/product/type.js';
import { Todo } from '../model/todo/type.js';
import { type User } from '../model/user/type.js';

const defaultData = {
  sessions: {} as Record<string, Pick<User, 'id'> & { expired: number }>,
  users: [] as User[],
  todos: [] as Todo[],
  carts: [] as Cart[],
  products: [] as Product[],
};

export const db = await JSONFilePreset(new URL('../../.db.json', import.meta.url), defaultData);

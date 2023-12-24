import { Product } from '../model/product/type.js';
import { Todo } from '../model/todo/type.js';
import { User } from '../model/user/type.js';
import { db } from './index.js';

const seeds = [
  function getUsers() {
    return fetch('https://dummyjson.com/users?limit=100&skip=0')
      .then(res => res.json())
      .then(async (res: any) => {
        db.data.users = res.users as User[];
        await db.write();
        console.log('db seed: user done!');
      });
  },
  function getTodos() {
    return fetch('https://dummyjson.com/todos?limit=150&skip=0')
      .then(res => res.json())
      .then(async (res: any) => {
        db.data.todos = res.todos as Todo[];
        await db.write();
        console.log('db seed: todo done!');
      });
  },
  function getCarts() {
    return fetch('https://dummyjson.com/carts?skip=0&limit=20')
      .then(res => res.json())
      .then(async (res: any) => {
        db.data.carts = res.carts.map((cart: { id: number; userId: number; products: any[] }) => ({
          id: cart.id,
          userId: cart.userId,
          products: cart.products.map(p => p.id),
        }));
        await db.write();
        console.log('db seed: cart done');
      });
  },
  function getProducts() {
    return fetch('https://dummyjson.com/products?skip=0&limit=100')
      .then(res => res.json())
      .then(async res => {
        db.data.products = res.products as Product[];
        await db.write();
        console.log('db seed: product done');
      });
  },
];

for await (const request of seeds) {
  await request();
}

console.log('finished all seed process!');

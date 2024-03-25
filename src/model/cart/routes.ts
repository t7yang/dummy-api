import { vValidator } from '@hono/valibot-validator';
import { Hono } from 'hono';
import { db } from '../../db';
import { loginHook } from '../../routes/auth/handler';
import { getItemById, getNextId } from '../shared/calc/data';
import { idParamSchema } from '../shared/schema';
import { isAllIdExist } from '../shared/validation';
import { cartCreateSchema, type Cart } from './type';

export const cartRoutes = new Hono();

cartRoutes.use(loginHook);

cartRoutes.get('/:id', vValidator('param', idParamSchema), async ctx => {
  const id = ctx.req.valid('param').id;
  const cart = db.data.carts.find(v => v.id === id);

  return cart ? ctx.json(cart) : ctx.text('Cart not found', 404);
});

cartRoutes.get('/user/:id', vValidator('param', idParamSchema), async ctx => {
  const id = ctx.req.valid('param').id;
  const cart = db.data.carts.find(v => v.userId === id);

  if (!cart) return ctx.json(null);

  const products = new Map(db.data.products.map(p => [p.id, p]));
  const dto = Object.assign({}, cart, { products: cart.products.map(id => products.get(id)) });

  return ctx.json(dto);
});

cartRoutes.post('/', vValidator('json', cartCreateSchema), async ctx => {
  const payload = ctx.req.valid('json');
  const user = getItemById(db.data.users, payload.userId);

  if (!user) return ctx.text('Invalid userId', 400);

  const isProductIdsOk = isAllIdExist(db.data.products, payload.products);
  if (!isProductIdsOk) return ctx.text('Found invalid product id', 400);

  const newId = getNextId(db.data.carts);

  const newCart: Cart = { id: newId, ...payload };

  db.data.carts.push(newCart);
  await db.write();

  return ctx.json(newCart);
});

cartRoutes.put('/:id', vValidator('param', idParamSchema), vValidator('json', cartCreateSchema), async ctx => {
  const id = ctx.req.valid('param').id;
  const payload = ctx.req.valid('json');

  const existing = getItemById(db.data.carts, id);
  if (!existing) return ctx.text('Cart not found', 404);

  if (payload.userId) {
    const user = getItemById(db.data.users, payload.userId);
    if (!user) return ctx.text('Invalid userId', 400);
  }

  if (payload.products) {
    const isProductIdsOk = isAllIdExist(db.data.products, payload.products);
    if (!isProductIdsOk) return ctx.text('Found invalid product id', 400);
  }

  Object.assign(existing, payload);
  await db.write();
  return ctx.json(existing);
});

cartRoutes.put('/:id', vValidator('param', idParamSchema), async ctx => {
  const id = ctx.req.valid('param').id;

  // Verify if the todo with the given id exists
  const index = db.data.carts.findIndex(i => i.id === id);

  if (index === -1) return ctx.text('Cart not found', 404);

  const todo = db.data.todos.splice(index, 1)[0];
  await db.write();
  return ctx.json(todo);
});

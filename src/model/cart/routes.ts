import { vValidator } from '@hono/valibot-validator';
import { Hono } from 'hono';
import { db } from '../../db';
import { UserContext } from '../../router/context';
import { loginHook } from '../../routes/auth/handler';
import { getItemById, getNextId } from '../shared/calc/data';
import { idParamSchema } from '../shared/schema';
import { isAllIdExist } from '../shared/validation';
import { cartCreateSchema, type Cart } from './type';

export const cartRoutes = new Hono();

cartRoutes.use(loginHook);

cartRoutes.get('/my', async ctx => {
  const user = UserContext.getter(ctx);
  const cart = db.data.carts.find(v => v.userId === user.id);

  if (!cart) return ctx.json(null);

  const products = new Map(db.data.products.map(p => [p.id, p]));
  const dto = Object.assign({}, cart, { products: cart.products.map(id => products.get(id)) });

  return ctx.json(dto);
});

cartRoutes.get('/:id', vValidator('param', idParamSchema), async ctx => {
  const user = UserContext.getter(ctx);
  const id = ctx.req.valid('param').id;
  const cart = db.data.carts.find(v => v.id === id);

  if (!cart) return ctx.text('Cart not found', 404);
  if (cart.userId !== user.id) return ctx.text('Forbidden', 403);

  return ctx.json(cart);
});

cartRoutes.post('/', vValidator('json', cartCreateSchema), async ctx => {
  const user = UserContext.getter(ctx);
  const payload = ctx.req.valid('json');

  if (!user) return ctx.text('Invalid userId', 400);

  const isProductIdsOk = isAllIdExist(db.data.products, payload.products);
  if (!isProductIdsOk) return ctx.text('Found invalid product id', 400);

  const newId = getNextId(db.data.carts);

  const newCart: Cart = { id: newId, ...payload, userId: user.id };

  db.data.carts.push(newCart);
  await db.write();

  return ctx.json(newCart);
});

cartRoutes.put('/:id', vValidator('param', idParamSchema), vValidator('json', cartCreateSchema), async ctx => {
  const id = ctx.req.valid('param').id;
  const payload = ctx.req.valid('json');

  const existing = getItemById(db.data.carts, id);
  if (!existing) return ctx.text('Cart not found', 404);

  if (payload.products) {
    const isProductIdsOk = isAllIdExist(db.data.products, payload.products);
    if (!isProductIdsOk) return ctx.text('Found invalid product id', 400);
  }

  Object.assign(existing, payload);
  await db.write();
  return ctx.json(existing);
});

cartRoutes.delete('/:id', vValidator('param', idParamSchema), async ctx => {
  const user = UserContext.getter(ctx);
  const id = ctx.req.valid('param').id;

  // Verify if the todo with the given id exists
  const index = db.data.carts.findIndex(i => i.id === id);
  const cart = db.data.carts[index]!;

  if (index === -1) return ctx.text('Cart not found', 404);
  if (cart.userId !== user.id) return ctx.text('Forbidden', 403);

  db.data.carts.splice(index, 1)[0];
  await db.write();
  return ctx.json(cart);
});

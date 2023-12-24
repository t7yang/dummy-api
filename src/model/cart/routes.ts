import { FastifyInstance } from 'fastify';
import { db } from '../../db/index.js';
import { addLoginHook } from '../../routes/auth/handler.js';
import { getItemById, getNextId } from '../shared/calc/data.js';
import { idParamSchema } from '../shared/schema/index.js';
import { isAllIdExist } from '../shared/validation/index.js';
import { Cart, cartCreateSchema } from './type.js';

export const cartRoutes = async (fastify: FastifyInstance) => {
  addLoginHook(fastify);

  fastify.get('/:id', async (request, reply) => {
    const id = idParamSchema.safeParse(request.params);

    if (!id.success) return reply.status(400).send('Invalid id');

    const cart = db.data.carts.find(v => v.id === id.data.id);

    if (cart) {
      reply.send(cart);
    } else {
      reply.status(404).send('Cart not found');
    }
  });

  fastify.get('/user/:id', async (request, reply) => {
    const id = idParamSchema.safeParse(request.params);

    if (!id.success) return reply.status(400).send('Invalid id');

    const cart = db.data.carts.find(v => v.userId === id.data.id);

    if (!cart) return null;

    const products = new Map(db.data.products.map(p => [p.id, p]));
    const dto = Object.assign({}, cart, { products: cart.products.map(id => products.get(id)) });

    return dto;
  });

  fastify.post('/', async (request, reply) => {
    const payload = cartCreateSchema.safeParse(request.body);

    if (!payload.success) return reply.status(400).send('Invalid payload');

    const dto = payload.data;

    const user = getItemById(db.data.users, dto.userId);
    if (!user) return reply.status(400).send('Invalid userId');

    const isProductIdsOk = isAllIdExist(db.data.products, dto.products);
    if (!isProductIdsOk) return reply.status(400).send('Found invalid product id');

    const newId = getNextId(db.data.carts);

    const newCart: Cart = { id: newId, ...dto };

    db.data.carts.push(newCart);
    await db.write();

    reply.send(newCart);
  });

  fastify.put('/:id', async (request, reply) => {
    const id = idParamSchema.safeParse(request.params);
    const payload = cartCreateSchema.partial().safeParse(request.body);

    if (!id.success || !payload.success) return reply.status(400).send('Invalid id or payload');

    const dto = payload.data;

    const existing = getItemById(db.data.carts, id.data.id);
    if (!existing) return reply.status(404).send('Cart not found');

    if (dto.userId) {
      const user = getItemById(db.data.users, dto.userId);
      if (!user) return reply.status(400).send('Invalid userId');
    }

    if (dto.products) {
      const isProductIdsOk = isAllIdExist(db.data.products, dto.products);
      if (!isProductIdsOk) return reply.status(400).send('Found invalid product id');
    }

    Object.assign(existing, dto);
    await db.write();
    return existing;
  });

  fastify.delete('/:id', async (request, reply) => {
    const id = idParamSchema.safeParse(request.params);

    if (!id.success) return reply.status(400).send('Invalid id');

    // Verify if the todo with the given id exists
    const index = db.data.carts.findIndex(i => i.id === id.data.id);

    if (index === -1) return reply.status(404).send('Cart not found');

    const todo = db.data.todos.splice(index, 1)[0];
    await db.write();
    reply.send(todo);
  });
};

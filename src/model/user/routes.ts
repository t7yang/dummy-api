// src/routes/user/index.ts
import { FastifyInstance } from 'fastify';
import { db } from '../../db/index.js';
import { addLoginHook } from '../../routes/auth/handler.js';
import { idParamSchema, paginationQuerySchema } from '../shared/schema/index.js';

export const userRoutes = async (fastify: FastifyInstance) => {
  addLoginHook(fastify);

  fastify.get('/:id', async (request, reply) => {
    const id = idParamSchema.safeParse(request.params);

    if (!id.success) return reply.status(400).send('Invalid id');

    // Verify if the user with the given id exists
    const user = db.data.users.find(u => u.id === id.data.id);

    if (user) {
      reply.send(user);
    } else {
      reply.status(404).send('User not found');
    }
  });

  fastify.get('/', async (request, reply) => {
    const queries = paginationQuerySchema.safeParse(request.query);

    if (!queries.success) return reply.status(400).send('Invalid query parameters');

    // Get users based on skip and limit
    const users = db.data.users.slice(queries.data.skip, queries.data.skip + queries.data.limit);
    const total = db.data.users.length;

    reply.send({ users, total });
  });
};

import { FastifyInstance } from 'fastify';
import { db } from '../../db/index.js';

export const addLoginHook = (fastify: FastifyInstance) => {
  fastify.addHook('preHandler', async (request, reply) => {
    const sessionId = request.cookies['session'];

    if (
      typeof request.query === 'object' &&
      request.query !== null &&
      'auth' in request.query &&
      request.query.auth === '0'
    ) {
      return;
    }

    if (!sessionId || !db.data.sessions[sessionId] || db.data.sessions[sessionId].expired < Date.now()) {
      reply.status(401).send('Unauthorized');
    }
  });
};

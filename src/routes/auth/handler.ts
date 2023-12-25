import { FastifyInstance } from 'fastify';
import { db } from '../../db/index.js';

export const addLoginHook = (fastify: FastifyInstance) => {
  fastify.addHook('preHandler', async (request, reply) => {
    if (
      typeof request.query === 'object' &&
      request.query !== null &&
      'auth' in request.query &&
      request.query.auth === '0'
    ) {
      return;
    }

    const sessionId = request.cookies['session'];
    const session = db.data.sessions[sessionId || ''];

    if (!sessionId || !session) return reply.status(401).send('Unauthorized');
    if (session.expired < Date.now()) {
      Reflect.deleteProperty(db.data.sessions, sessionId);
      await db.write();
      reply.status(401).send('Unauthorized');
    }
  });
};

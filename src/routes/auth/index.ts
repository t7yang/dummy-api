// src/routes/auth/index.ts
import { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { db } from '../../db/index.js';

const loginSchema = z.object({
  username: z.string(),
  password: z.string(),
});

export const authRoutes = async (fastify: FastifyInstance) => {
  fastify.post('/login', async (request, reply) => {
    const payload = loginSchema.safeParse(request.body);

    if (!payload.success) return reply.status(400).send({ message: 'Invalid request payload' });

    const user = db.data.users.find(u => u.username === payload.data.username && u.password === payload.data.password);

    if (!user) return reply.status(400).send('Invalid username or password');

    const sessionId = Math.random().toString(36).substring(7);
    const expired = Date.now() + 1000 * 60 * 60 * 24;

    db.data.sessions[sessionId] = { id: user.id, expired };
    await db.write();

    reply.setCookie('session', sessionId, { expires: new Date(expired), httpOnly: true, path: '/' });

    return { message: 'Login successful' };
  });

  fastify.post('/logout', async (request, reply) => {
    const sessionId = request.cookies.session;

    if (sessionId && db.data.sessions[sessionId]) {
      Reflect.deleteProperty(db.data.sessions, sessionId);
      await db.write();
    }

    reply.send({ message: 'Logout successful' });
  });

  fastify.get('/profile', async (request, reply) => {
    const sessionId = request.cookies.session;
    const session = db.data.sessions[sessionId || ''];

    if (!sessionId || !session) return reply.status(401).send('Invalid, no session found');
    if (session.expired < Date.now()) {
      Reflect.deleteProperty(db.data.sessions, sessionId);
      await db.write();
      return reply.status(401).send('Invalid, session expired');
    }

    const user = db.data.users.find(v => v.id === session.id);

    if (!user) return reply.status(400).send('Invalid, user not existed');

    reply.send(user);
  });
};

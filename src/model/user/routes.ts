// src/routes/user/index.ts
import { vValidator } from '@hono/valibot-validator';
import { Hono } from 'hono';
import { db } from '../../db/index.js';
import { loginHook } from '../../routes/auth/handler.js';
import { idParamSchema, paginationQuerySchema } from '../shared/schema/index.js';

export const userRoutes = new Hono();

userRoutes.use(loginHook);

userRoutes.get('/:id', vValidator('param', idParamSchema), async ctx => {
  const id = ctx.req.valid('param').id;
  const user = db.data.users.find(u => u.id === id);

  return user ? ctx.json(user) : ctx.text('User not found', 404);
});

userRoutes.get('/', vValidator('query', paginationQuerySchema), async ctx => {
  const { skip, limit } = ctx.req.valid('query');
  const users = db.data.users.slice(skip, skip + limit);
  const total = db.data.users.length;

  return ctx.json({ users, total });
});

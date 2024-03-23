import { vValidator } from '@hono/valibot-validator';
import { Hono } from 'hono';
import { getSignedCookie, setSignedCookie } from 'hono/cookie';
import * as v from 'valibot';
import { db } from '../../db';
import { Cookie } from './cookie';

export const authRoutes = new Hono();

authRoutes.post(
  '/login',
  vValidator('json', v.object({ username: v.string(), password: v.string() }, v.never())),
  async ctx => {
    const { username, password } = ctx.req.valid('json');

    const user = db.data.users.find(u => u.username === username && u.password === password);

    if (!user) return ctx.text('Invalid username or password', 400);

    const sessionId = Math.random().toString(36).substring(7);
    const expired = Date.now() + 1000 * 60 * 60 * 24;

    db.data.sessions[sessionId] = { id: user.id, expired };
    await db.write();

    await setSignedCookie(ctx, Cookie.name, sessionId, Cookie.secret, {
      expires: new Date(expired),
      httpOnly: true,
      path: '/',
    });

    return ctx.json({ message: 'Login successful' });
  },
);

authRoutes.post('/logout', async ctx => {
  const sessionId = await getSignedCookie(ctx, Cookie.secret, Cookie.name);

  if (sessionId && db.data.sessions[sessionId]) {
    Reflect.deleteProperty(db.data.sessions, sessionId);
    await db.write();
  }

  return ctx.json({ message: 'Logout successful' });
});

authRoutes.get('/profile', async ctx => {
  const sessionId = await getSignedCookie(ctx, Cookie.secret, Cookie.name);
  const session = db.data.sessions[sessionId || ''];

  if (!sessionId || !session) return ctx.text('Invalid, no session found', 401);
  if (session.expired < Date.now()) {
    Reflect.deleteProperty(db.data.sessions, sessionId);
    await db.write();
    return ctx.text('Invalid, session expired', 401);
  }

  const user = db.data.users.find(v => v.id === session.id);

  if (!user) return ctx.text('Invalid, user not existed', 400);

  return ctx.json(user);
});

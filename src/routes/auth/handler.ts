import type { MiddlewareHandler } from 'hono';
import { getSignedCookie } from 'hono/cookie';
import { db } from '../../db/index.js';
import { UserContext } from '../../router/context.js';
import { Cookie } from './cookie.js';

export const loginHook: MiddlewareHandler = async (ctx, next) => {
  if (ctx.req.query()['auth'] === '0') return await next();

  const sessionId = await getSignedCookie(ctx, Cookie.secret, Cookie.name);
  const session = db.data.sessions[sessionId || ''];

  if (!sessionId || !session) return ctx.text('Unauthorized', 401);

  const user = db.data.users.find(u => u.id === session.id);
  if (session.expired < Date.now() || !user) {
    Reflect.deleteProperty(db.data.sessions, sessionId);
    await db.write();
    return ctx.text('Unauthorized', 401);
  }

  UserContext.setter(ctx, user);

  return await next();
};

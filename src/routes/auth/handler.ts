import type { MiddlewareHandler } from 'hono';
import { getSignedCookie } from 'hono/cookie';
import { db } from '../../db/index.js';
import { Cookie } from './cookie.js';

export const loginHook: MiddlewareHandler = async (ctx, next) => {
  if (ctx.req.query()['auth'] === '0') {
    await next();
    return;
  }

  const sessionId = await getSignedCookie(ctx, Cookie.secret, Cookie.name);
  const session = db.data.sessions[sessionId || ''];

  if (!sessionId || !session) return ctx.text('Unauthorized', 401);
  if (session.expired < Date.now()) {
    Reflect.deleteProperty(db.data.sessions, sessionId);
    await db.write();
    ctx.text('Unauthorized', 401);
  }
};

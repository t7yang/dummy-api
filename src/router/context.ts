import type { Context } from 'hono';
import type { User } from '../model/user/type';

const UserContextId = 'user_context';

export const UserContext = {
  getter: (ctx: Context) => {
    return ctx.get(UserContextId) as User;
  },
  setter: (ctx: Context, user: User) => {
    ctx.set(UserContextId, user);
  },
};

import { serve } from '@hono/node-server';
import { serveStatic } from '@hono/node-server/serve-static';
import { Hono } from 'hono';
import { logger } from 'hono/logger';
import { cartRoutes } from './model/cart/routes';
import { productRoutes } from './model/product/routes';
import { todoRoutes } from './model/todo/route';
import { userRoutes } from './model/user/routes';
import { authRoutes } from './routes/auth';

const app = new Hono();

app.use(logger());
app.use('/*', serveStatic({ root: './public' }));

app.route('/api/auth', authRoutes);
app.route('/api/user', userRoutes);
app.route('/api/todo', todoRoutes);
app.route('/api/cart', cartRoutes);
app.route('/api/product', productRoutes);

app.get('/', c => {
  return c.html(`<div><h1>Create an index.html under the public folder</h1></div>`);
});

app.onError((err, ctx) => {
  console.log(err);
  return ctx.text('Internal service error');
});

const port = 4000;
console.log(`Server is running on port ${port} at ${new Date()}`);

serve({ fetch: app.fetch, port });

import fastifyCookie from '@fastify/cookie';
import fastifyStatic from '@fastify/static';
import fastify from 'fastify';
import { cartRoutes } from './model/cart/routes.js';
import { productRoutes } from './model/product/routes.js';
import { todoRoutes } from './model/todo/route.js';
import { userRoutes } from './model/user/routes.js';
import { authRoutes } from './routes/auth/index.js';

const server = fastify({ logger: true });

server.register(fastifyCookie, { secret: 'iwagowfwe', hook: 'onRequest' });
server.register(fastifyStatic, { root: new URL('../public', import.meta.url) });

server.register(authRoutes, { prefix: '/auth' });
server.register(userRoutes, { prefix: '/user' });
server.register(todoRoutes, { prefix: '/todo' });
server.register(cartRoutes, { prefix: '/cart' });
server.register(productRoutes, { prefix: '/product' });

server.get('/hello', async () => {
  return `Hello World`;
});

server.listen({ port: 4000 }, (err, address) => {
  if (err) {
    console.error(err);
    process.exit(1);
  }
  console.log(`Server listening at ${address}`);
});

import { FastifyInstance } from 'fastify';
import { db } from '../../db/index.js';
import { addLoginHook } from '../../routes/auth/handler.js';
import { idParamSchema, paginationQuerySchema } from '../shared/schema/index.js';
import { productQuerySchema } from './type.js';

export const productRoutes = async (fastify: FastifyInstance) => {
  addLoginHook(fastify);

  const getProductQuerySchema = productQuerySchema.and(paginationQuerySchema);
  fastify.get('/', async (request, reply) => {
    const queries = getProductQuerySchema.safeParse(request.query);

    !queries.success && console.log(request.query, queries.error);
    if (!queries.success) return reply.status(400).send('Invalid queries');
    const { skip, limit, ...productQueries } = queries.data;

    const items = db.data.products.filter(v =>
      Object.keys(productQueries).every(key => {
        const prop = key as keyof typeof productQueries;
        switch (prop) {
          case 'keyword': {
            const keyword = productQueries[prop];
            return (
              keyword == null ||
              (Array.isArray(keyword) ? keyword : [keyword]).some(k =>
                new RegExp(`${k}`, 'i').test(v.title + ' ' + v.description),
              )
            );
          }
          case 'brand': {
            const brand = productQueries[prop];
            return brand == null || (Array.isArray(brand) ? brand : [brand]).some(b => v.brand === b);
          }
          case 'category': {
            const cat = productQueries[prop];
            return cat == null || (Array.isArray(cat) ? cat : [cat]).some(b => v.category === b);
          }
          case 'minPrice': {
            const min = productQueries[prop];
            return min == null || v.price >= min;
          }
          case 'maxPrice': {
            const max = productQueries[prop];
            return max == null || v.price <= max;
          }
          case 'minDiscount': {
            const min = productQueries[prop];
            return min == null || v.discountPercentage >= min;
          }
          case 'maxDiscount': {
            const max = productQueries[prop];
            return max == null || v.discountPercentage <= max;
          }
          case 'minRating': {
            const min = productQueries[prop];
            return min == null || v.rating >= min;
          }
          case 'maxRating': {
            const max = productQueries[prop];
            return max == null || v.rating <= max;
          }
        }
      }),
    );

    reply.send({ products: items.slice(skip, skip + limit), total: items.length });
  });

  fastify.get('/:id', async (request, reply) => {
    request.query;
    const id = idParamSchema.safeParse(request.params);

    if (!id.success) return reply.status(400).send('Invalid id');

    const item = db.data.products.find(v => v.id === id.data.id);

    if (!item) return reply.status(404).send('Product not found');

    reply.send(item);
  });
};

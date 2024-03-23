import { vValidator } from '@hono/valibot-validator';
import { Hono } from 'hono';
import * as v from 'valibot';
import { db } from '../../db/index.js';
import { loginHook } from '../../routes/auth/handler.js';
import { idParamSchema, paginationQuerySchema } from '../shared/schema/index.js';
import { productQuerySchema, type Product } from './type.js';

export const productRoutes = new Hono();

productRoutes.use(loginHook);

productRoutes.get('/autocomplete-list', async ctx => {
  const props: Record<keyof Pick<Product, 'brand' | 'category'>, Set<string>> = {
    brand: new Set(),
    category: new Set(),
  };

  for (const product of db.data.products) {
    props.brand.add(product.brand);
    props.category.add(product.category);
  }

  return ctx.json({ ...props, brand: Array.from(props.brand), category: Array.from(props.category) });
});

productRoutes.get('/:id', vValidator('param', idParamSchema), async ctx => {
  const id = ctx.req.valid('param').id;
  const item = db.data.products.find(v => v.id === id);

  if (!item) return ctx.text('Product not found', 404);

  return ctx.json(item);
});

const getProductQuerySchema = v.intersect([productQuerySchema, paginationQuerySchema]);
productRoutes.get('/', vValidator('query', getProductQuerySchema), async ctx => {
  const { skip, limit, ...productQueries } = ctx.req.valid('query');

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

  return ctx.json({ products: items.slice(skip, skip + limit), total: items.length });
});

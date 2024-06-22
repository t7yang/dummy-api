import * as v from 'valibot';

export const booleanQuerySchema = v.picklist(['true', 'false']);

export const idSchema = v.pipe(v.number(), v.integer(), v.minValue(1));

export const idQuerySchema = v.pipe(v.string(), v.transform(Number), idSchema);

export const idParamSchema = v.object({ id: idQuerySchema });

const paginationSchema = v.pipe(v.string(), v.transform(Number), v.number(), v.integer(), v.minValue(0));

export const paginationQuerySchema = v.object({
  skip: v.optional(paginationSchema, '0'),
  limit: v.optional(paginationSchema, '12'),
});

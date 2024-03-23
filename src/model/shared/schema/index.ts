import * as v from 'valibot';

export const booleanQuerySchema = v.picklist(['true', 'false']);

export const idSchema = v.number([v.integer(), v.minValue(1)]);

export const idQuerySchema = v.coerce(idSchema, Number);

export const idParamSchema = v.object({ id: idQuerySchema });

const paginationSchema = v.coerce(v.number([v.integer(), v.minValue(0)]), Number);

export const paginationQuerySchema = v.object({
  skip: v.optional(paginationSchema, 0),
  limit: v.optional(paginationSchema, 12),
});

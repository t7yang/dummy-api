import { z } from 'zod';

export const booleanQuerySchema = z.enum(['true', 'false']);

export const idSchema = z.number().int().min(1);

export const idQuerySchema = z.number({ coerce: true }).int().min(1);

export const idParamSchema = z.object({ id: idQuerySchema });

const paginationSchema = z.number({ coerce: true }).int().min(0);

export const paginationQuerySchema = z
  .object({ skip: z.string(), limit: z.string() })
  .partial()
  .default({ skip: '0', limit: '12' })
  .pipe(z.object({ skip: paginationSchema.default(0), limit: paginationSchema.default(12) }));

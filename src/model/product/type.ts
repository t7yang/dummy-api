import { z } from 'zod';

export interface Product {
  id: number;
  title: string;
  description: string;
  price: number;
  discountPercentage: number;
  rating: number;
  stock: number;
  brand: string;
  category: string;
  thumbnail: string;
  images: string[];
}

const queryText = z.string().min(1);
const number = z.number({ coerce: true }).gte(0);
const multipleTexts = z.union([z.array(queryText), queryText]);
export const productQuerySchema = z
  .object({
    keyword: multipleTexts,
    brand: multipleTexts,
    category: multipleTexts,
    minPrice: queryText,
    maxPrice: queryText,
    minDiscount: queryText,
    maxDiscount: queryText,
    minRating: queryText,
    maxRating: queryText,
  })
  .partial()
  .pipe(
    z
      .object({
        keyword: multipleTexts,
        brand: multipleTexts,
        category: multipleTexts,
        minPrice: number.int(),
        maxPrice: number.int(),
        minDiscount: number,
        maxDiscount: number,
        minRating: number,
        maxRating: number,
      })
      .partial(),
  );

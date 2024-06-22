import * as v from 'valibot';

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

const queryText = v.pipe(v.string(), v.minLength(1));
const number = v.pipe(v.string(), v.transform(Number), v.minValue(0));
const price = v.pipe(v.string(), v.minLength(1), v.transform(Number), v.minValue(0));
const multipleTexts = v.union([v.array(queryText), queryText]);

export const productQuerySchema = v.partial(
  v.object({
    keyword: multipleTexts,
    brand: multipleTexts,
    category: multipleTexts,
    minPrice: price,
    maxPrice: price,
    minDiscount: number,
    maxDiscount: number,
    minRating: number,
    maxRating: number,
  }),
);

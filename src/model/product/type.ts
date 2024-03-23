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

const queryText = v.string([v.minLength(1)]);
const number = v.coerce(v.number([v.minValue(0)]), Number);
const multipleTexts = v.union([v.array(queryText), queryText]);

export const productQuerySchema = v.partial(
  v.object(
    {
      keyword: multipleTexts,
      brand: multipleTexts,
      category: multipleTexts,
      minPrice: v.transform(v.string([v.minLength(1)]), Number, number),
      maxPrice: v.transform(v.string([v.minLength(1)]), Number, number),
      minDiscount: number,
      maxDiscount: number,
      minRating: number,
      maxRating: number,
    },
    v.never(),
  ),
);

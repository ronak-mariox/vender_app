import { OrderProduct } from '../../context/OrdersContext';

export function findFlaggedItem(products: OrderProduct[]): OrderProduct | undefined {
  if (products.length < 2) return undefined;
  return products.reduce((max, product) => (product.price > max.price ? product : max), products[0]);
}

export type ReplacementCandidate = {
  name: string;
  price: number;
  stock: number;
  matchPct: number;
  bestMatch?: boolean;
};

const FORTUNE_OIL_ALTERNATIVES: ReplacementCandidate[] = [
  { name: 'Dhara Sunflower Oil (1L)', price: 124, stock: 18, matchPct: 96, bestMatch: true },
  { name: 'Saffola Gold Oil (1L)', price: 148, stock: 7, matchPct: 92 },
  { name: 'Sundrop Oil (1L)', price: 118, stock: 24, matchPct: 88 },
];

export function replacementCandidatesFor(item: OrderProduct): ReplacementCandidate[] {
  if (item.name === 'Fortune Sunflower Oil (1L)') return FORTUNE_OIL_ALTERNATIVES;

  const prefixes = ['Store Pick', 'Premium', 'Value'];
  const multipliers = [0.94, 1.12, 0.89];
  const stocks = [18, 7, 24];
  const matches = [96, 92, 88];

  return prefixes.map((prefix, index) => ({
    name: `${prefix} ${item.name}`,
    price: Math.max(1, Math.round(item.price * multipliers[index])),
    stock: stocks[index],
    matchPct: matches[index],
    bestMatch: index === 0,
  }));
}

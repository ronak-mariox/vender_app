import { IconName } from '../icons/Icon';

export type SubcategoryOption = {
  id: string;
  name: string;
};

export type CategoryOption = {
  id: string;
  name: string;
  icon: IconName;
  subcategories: SubcategoryOption[];
};

export const CATEGORIES: CategoryOption[] = [
  {
    id: 'grocery-staples',
    name: 'Grocery & Staples',
    icon: 'package',
    subcategories: [
      { id: 'salt-sugar-jaggery', name: 'Salt, Sugar & Jaggery' },
      { id: 'rice-wheat', name: 'Rice & Wheat' },
      { id: 'flours-sooji', name: 'Flours & Sooji' },
      { id: 'dal-pulses', name: 'Dal & Pulses' },
      { id: 'dry-fruits-nuts', name: 'Dry Fruits & Nuts' },
      { id: 'masalas-spices', name: 'Masalas & Spices' },
      { id: 'edible-oils', name: 'Edible Oils' },
      { id: 'other-staples', name: 'Other Staples' },
    ],
  },
  {
    id: 'dairy-eggs',
    name: 'Dairy & Eggs',
    icon: 'shield-check',
    subcategories: [
      { id: 'milk', name: 'Milk' },
      { id: 'cheese-paneer', name: 'Cheese & Paneer' },
      { id: 'curd-yogurt', name: 'Curd & Yogurt' },
      { id: 'eggs', name: 'Eggs' },
    ],
  },
  {
    id: 'fruits-vegetables',
    name: 'Fruits & Vegetables',
    icon: 'tag',
    subcategories: [
      { id: 'fresh-fruits', name: 'Fresh Fruits' },
      { id: 'fresh-vegetables', name: 'Fresh Vegetables' },
      { id: 'exotic-produce', name: 'Exotic Produce' },
    ],
  },
  {
    id: 'snacks-beverages',
    name: 'Snacks & Beverages',
    icon: 'layers',
    subcategories: [
      { id: 'chips-namkeen', name: 'Chips & Namkeen' },
      { id: 'cold-drinks-juices', name: 'Cold Drinks & Juices' },
      { id: 'tea-coffee', name: 'Tea & Coffee' },
      { id: 'ready-to-eat', name: 'Ready to Eat' },
    ],
  },
  {
    id: 'personal-care',
    name: 'Personal Care',
    icon: 'award',
    subcategories: [
      { id: 'bath-body', name: 'Bath & Body' },
      { id: 'oral-care', name: 'Oral Care' },
      { id: 'skin-hair-care', name: 'Skin & Hair Care' },
      { id: 'fragrances', name: 'Fragrances' },
    ],
  },
  {
    id: 'household-cleaning',
    name: 'Household & Cleaning',
    icon: 'home',
    subcategories: [
      { id: 'detergents', name: 'Detergents' },
      { id: 'cleaners', name: 'Cleaners' },
      { id: 'disposables', name: 'Disposables' },
    ],
  },
  {
    id: 'baby-kids',
    name: 'Baby & Kids',
    icon: 'users',
    subcategories: [
      { id: 'baby-food', name: 'Baby Food' },
      { id: 'diapers-wipes', name: 'Diapers & Wipes' },
    ],
  },
  {
    id: 'health-wellness',
    name: 'Health & Wellness',
    icon: 'trending-up',
    subcategories: [
      { id: 'otc-medicines', name: 'OTC Medicines' },
      { id: 'health-supplements', name: 'Health Supplements' },
    ],
  },
];

export const GST_RATES = [
  { value: '0', label: '0% — Exempt (Food items, fresh produce)' },
  { value: '5', label: '5% — Packaged food, edible oils, sugar' },
  { value: '12', label: '12% — Processed food, fruit juices' },
  { value: '18', label: '18% — Personal care, household products' },
  { value: '28', label: '28% — Luxury items, aerated drinks' },
];

export const COMMON_GST_RATES = [
  { rate: '0%', description: 'Fresh produce, basic food items, salt' },
  { rate: '5%', description: 'Packaged food, edible oils, sugar' },
  { rate: '12%', description: 'Processed food, fruit juices' },
  { rate: '18%', description: 'Personal care, household products' },
  { rate: '28%', description: 'Luxury items, aerated drinks' },
];

export const WEIGHT_UNITS = ['g (grams)', 'kg (kilograms)', 'ml (millilitres)', 'L (litres)', 'pcs (pieces)'];

export const PACK_TYPES = ['Packet', 'Bottle', 'Box', 'Pouch', 'Jar', 'Can', 'Loose'];

export const POPULAR_BRANDS = [
  'Tata Consumer Products',
  'Amul',
  'Nestlé India',
  'Britannia',
  'ITC',
  'Hindustan Unilever',
  'P&G India',
  'Godrej',
];

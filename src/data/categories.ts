import { ProductCollection } from '../types/product';

/** Presentation for each backend product category (ProductCollection enum). */
export interface CategoryMeta {
  value: ProductCollection;
  label: string;
  tagline: string;
  image: string;
}

const photo = (id: string) => `https://images.unsplash.com/${id}?auto=format&fit=crop&w=900&q=75`;

export const CATEGORY_META: CategoryMeta[] = [
  { value: ProductCollection.RUNNING, label: 'Running', tagline: 'Built for distance', image: photo('photo-1476480862126-209bfaa8edc8') },
  { value: ProductCollection.LIFESTYLE, label: 'Lifestyle', tagline: 'Street-ready icons', image: photo('photo-1556906781-9a412961c28c') },
  { value: ProductCollection.BASKETBALL, label: 'Basketball', tagline: 'Court-proven grip', image: photo('photo-1546519638-68e109498ffc') },
  { value: ProductCollection.TRAINING, label: 'Training', tagline: 'Stable under load', image: photo('photo-1517836357463-d25dfeac3438') },
  { value: ProductCollection.CASUAL, label: 'Casual', tagline: 'Everyday easy', image: photo('photo-1525966222134-fcfa99b8ae77') },
  { value: ProductCollection.FOOTBALL, label: 'Football', tagline: 'Made for the pitch', image: photo('photo-1574629810360-7efbbe195018') },
  { value: ProductCollection.OTHER, label: 'More styles', tagline: 'Extras & essentials', image: photo('photo-1460353581641-37baddab0fa2') },
];

/** Photography used by the homepage hero promotion and closing call-to-action. */
export const HOME_IMAGES = {
  featuredCollection: photo('photo-1514989940723-e8e51635b782'),
  promo: photo('photo-1552346154-21d32810aba3'),
};

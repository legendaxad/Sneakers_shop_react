import { API_BASE_URL, PLACEHOLDER_IMAGE } from '../constants';
import type { DeliveryAddress } from '../types/member';

const priceFormatter = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  minimumFractionDigits: 0,
  maximumFractionDigits: 2,
});

export const formatPrice = (value: number): string => priceFormatter.format(value || 0);

export const formatDate = (value?: string): string => {
  if (!value) return '—';

  return new Date(value).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
};

/** Backend stores upload paths like `uploads/products/<uuid>.jpg`; they are served from the API origin. */
export const resolveImageUrl = (value?: string | null): string => {
  if (!value) return PLACEHOLDER_IMAGE;
  if (/^https?:\/\//.test(value)) return value;
  const normalised = value.replace(/\\/g, '/').replace(/^\.?\/+/, '');
  return `${API_BASE_URL}/${normalised}`;
};

export const formatAddress = (address?: DeliveryAddress | null): string[] => {
  if (!address) return [];
  return [
    address.recipientName,
    address.phone,
    [address.addressLine1, address.addressLine2].filter(Boolean).join(', '),
    [address.city, address.region, address.postalCode].filter(Boolean).join(', '),
    address.country,
  ].filter(Boolean);
};

export const titleCase = (value: string): string =>
  value.charAt(0).toUpperCase() + value.slice(1).toLowerCase();

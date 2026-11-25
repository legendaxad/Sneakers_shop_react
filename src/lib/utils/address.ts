import type { DeliveryAddress } from '../types/member';

export type AddressErrors = Partial<Record<keyof DeliveryAddress, string>>;

export const emptyAddress: DeliveryAddress = {
  recipientName: '',
  phone: '',
  addressLine1: '',
  addressLine2: '',
  city: '',
  region: '',
  postalCode: '',
  country: '',
};

/** Same phone rule as the backend (validation.ts). */
const PHONE_PATTERN = /^\+?[0-9\s\-()]{7,20}$/;

export const addressLimits: Record<keyof DeliveryAddress, number> = {
  recipientName: 80,
  phone: 20,
  addressLine1: 160,
  addressLine2: 160,
  city: 80,
  region: 80,
  postalCode: 20,
  country: 80,
};

export function validateAddress(address: DeliveryAddress): AddressErrors {
  const errors: AddressErrors = {};
  const required: (keyof DeliveryAddress)[] = ['recipientName', 'phone', 'addressLine1', 'city', 'country'];
  required.forEach((field) => {
    if (!address[field]?.trim()) errors[field] = 'Required';
  });
  (Object.keys(addressLimits) as (keyof DeliveryAddress)[]).forEach((field) => {
    if ((address[field]?.trim().length ?? 0) > addressLimits[field]) errors[field] = `Max ${addressLimits[field]} characters`;
  });
  if (address.phone?.trim() && !PHONE_PATTERN.test(address.phone.trim())) {
    errors.phone = 'Enter a valid phone number';
  }
  return errors;
}

/** Trim values and drop empty optional fields before sending to the API. */
export function cleanAddress(address: DeliveryAddress): DeliveryAddress {
  const cleaned: DeliveryAddress = {
    recipientName: address.recipientName.trim(),
    phone: address.phone.trim(),
    addressLine1: address.addressLine1.trim(),
    city: address.city.trim(),
    country: address.country.trim(),
  };
  if (address.addressLine2?.trim()) cleaned.addressLine2 = address.addressLine2.trim();
  if (address.region?.trim()) cleaned.region = address.region.trim();
  if (address.postalCode?.trim()) cleaned.postalCode = address.postalCode.trim();
  return cleaned;
}

export const hasAddress = (address?: DeliveryAddress | null): address is DeliveryAddress =>
  !!address && Object.keys(validateAddress({ ...emptyAddress, ...address })).length === 0;

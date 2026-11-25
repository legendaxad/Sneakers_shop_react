import { TextField } from '@mui/material';
import type { DeliveryAddress } from '../../../lib/types/member';
import { addressLimits, type AddressErrors } from '../../../lib/utils/address';

interface AddressFormProps {
  value: DeliveryAddress;
  errors?: AddressErrors;
  onChange: (value: DeliveryAddress) => void;
  disabled?: boolean;
}

const fields: { name: keyof DeliveryAddress; label: string; autoComplete: string; wide?: boolean; required?: boolean }[] = [
  { name: 'recipientName', label: 'Full name', autoComplete: 'name', required: true },
  { name: 'phone', label: 'Phone', autoComplete: 'tel', required: true },
  { name: 'addressLine1', label: 'Street address', autoComplete: 'address-line1', wide: true, required: true },
  { name: 'addressLine2', label: 'Apartment, suite, etc. (optional)', autoComplete: 'address-line2', wide: true },
  { name: 'city', label: 'City', autoComplete: 'address-level2', required: true },
  { name: 'region', label: 'State / Region (optional)', autoComplete: 'address-level1' },
  { name: 'postalCode', label: 'Postal code (optional)', autoComplete: 'postal-code' },
  { name: 'country', label: 'Country', autoComplete: 'country-name', required: true },
];

export function AddressForm({ value, errors = {}, onChange, disabled }: AddressFormProps) {
  return (
    <div className="ms-form-grid two">
      {fields.map((field) => (
        <TextField
          key={field.name}
          className={field.wide ? 'span-2' : undefined}
          label={field.label}
          name={field.name}
          required={field.required}
          disabled={disabled}
          value={value[field.name] ?? ''}
          onChange={(event) => onChange({ ...value, [field.name]: event.target.value })}
          error={!!errors[field.name]}
          helperText={errors[field.name]}
          slotProps={{ htmlInput: { autoComplete: field.autoComplete, maxLength: addressLimits[field.name] } }}
          fullWidth
        />
      ))}
    </div>
  );
}

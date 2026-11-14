import { IconButton } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';

interface QuantityStepperProps {
  value: number;
  min?: number;
  max: number;
  onChange: (value: number) => void;
  label?: string;
}

export function QuantityStepper({ value, min = 1, max, onChange, label = 'quantity' }: QuantityStepperProps) {
  return (
    <div className="ms-stepper" role="group" aria-label={label}>
      <IconButton size="small" onClick={() => onChange(value - 1)} disabled={value <= min} aria-label={`Decrease ${label}`}>
        <RemoveIcon fontSize="small" />
      </IconButton>
      <span className="ms-stepper-value" aria-live="polite">
        {value}
      </span>
      <IconButton size="small" onClick={() => onChange(value + 1)} disabled={value >= max} aria-label={`Increase ${label}`}>
        <AddIcon fontSize="small" />
      </IconButton>
    </div>
  );
}

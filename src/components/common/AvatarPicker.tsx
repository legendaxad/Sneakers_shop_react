import { useEffect, useRef, useState } from 'react';
import { Button, FormHelperText, Stack, Typography } from '@mui/material';
import PhotoCameraOutlinedIcon from '@mui/icons-material/PhotoCameraOutlined';
import DeleteOutlinedIcon from '@mui/icons-material/DeleteOutlined';
import { DEFAULT_AVATAR } from '../../constants';
import { ACCEPTED_IMAGE_TYPES, validateImageFile } from '../../utils/image';

interface AvatarPickerProps {
  file?: File;
  onChange: (file?: File) => void;
  disabled?: boolean;
}

/** Optional profile photo with preview, replace and remove. Validates type and size before upload. */
export function AvatarPicker({ file, onChange, disabled }: AvatarPickerProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!file) {
      setPreview(null);
      return;
    }
    const url = URL.createObjectURL(file);
    setPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [file]);

  const handleSelect = (selected?: File) => {
    if (inputRef.current) inputRef.current.value = ''; // allow re-selecting the same file
    if (!selected) return;
    const problem = validateImageFile(selected);
    setError(problem);
    if (!problem) onChange(selected);
  };

  return (
    <Stack direction="row" spacing={2.5} sx={{ alignItems: 'center' }} className="ms-avatar-picker">
      <img src={preview ?? DEFAULT_AVATAR} alt={file ? 'Selected profile photo preview' : 'Default profile avatar'} className="ms-avatar-preview" />
      <div>
        <Typography sx={{ fontWeight: 600 }}>Profile photo (optional)</Typography>
        <Typography variant="body2" color="text.secondary">
          JPG, PNG, WebP or GIF, up to 5 MB.
        </Typography>
        <Stack direction="row" spacing={1} sx={{ mt: 1.5, flexWrap: 'wrap', rowGap: 1 }}>
          <Button component="label" variant="outlined" size="small" startIcon={<PhotoCameraOutlinedIcon />} disabled={disabled}>
            {file ? 'Replace photo' : 'Upload photo'}
            <input
              ref={inputRef}
              type="file"
              hidden
              accept={ACCEPTED_IMAGE_TYPES.join(',')}
              aria-label="Profile photo"
              onChange={(event) => handleSelect(event.target.files?.[0])}
            />
          </Button>
          {file && (
            <Button
              size="small"
              startIcon={<DeleteOutlinedIcon />}
              onClick={() => {
                setError(null);
                onChange(undefined);
              }}
              disabled={disabled}
              sx={{ color: 'text.secondary' }}
            >
              Remove
            </Button>
          )}
        </Stack>
        {error && (
          <FormHelperText error role="alert">
            {error}
          </FormHelperText>
        )}
      </div>
    </Stack>
  );
}

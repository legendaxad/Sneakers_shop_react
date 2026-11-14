import { useEffect, useState, type FormEvent } from 'react';
import { Alert, Box, Button, Chip, IconButton, Stack, TextField, Typography } from '@mui/material';
import PhotoCameraOutlinedIcon from '@mui/icons-material/PhotoCameraOutlined';
import SaveOutlinedIcon from '@mui/icons-material/SaveOutlined';
import { AddressForm } from '../../components/common/AddressForm';
import { cleanAddress, emptyAddress, validateAddress, type AddressErrors } from '../../utils/address';
import { ErrorState, LoadingState } from '../../components/common/PageStatus';
import { SafeImage } from '../../components/common/SafeImage';
import { useDocumentTitle } from '../../app/hooks';
import { useAuthStore, useNoticeStore } from '../../app/store';
import { getApiErrorMessage, memberApi } from '../../services/api';
import type { DeliveryAddress, Member } from '../../types/member';
import '../../css/userPage.css';

interface AccountForm {
  memberNick: string;
  memberPhone: string;
  memberDesc: string;
  memberPassword: string;
}

const PHONE_PATTERN = /^\+?[0-9\s\-()]{7,20}$/;
const MAX_IMAGE_BYTES = 5 * 1024 * 1024;

export function ProfilePage() {
  useDocumentTitle('Profile');
  const setMember = useAuthStore((state) => state.setMember);
  const notify = useNoticeStore((state) => state.notify);
  const [member, setLocalMember] = useState<Member | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [account, setAccount] = useState<AccountForm>({ memberNick: '', memberPhone: '', memberDesc: '', memberPassword: '' });
  const [accountErrors, setAccountErrors] = useState<Partial<Record<keyof AccountForm, string>>>({});
  const [address, setAddress] = useState<DeliveryAddress>(emptyAddress);
  const [addressErrors, setAddressErrors] = useState<AddressErrors>({});
  const [file, setFile] = useState<File | undefined>();
  const [preview, setPreview] = useState<string | null>(null);
  const [savingAccount, setSavingAccount] = useState(false);
  const [savingAddress, setSavingAddress] = useState(false);
  const [accountMessage, setAccountMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [addressMessage, setAddressMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const applyMember = (next: Member) => {
    setLocalMember(next);
    setMember(next);
    setAccount({ memberNick: next.memberNick, memberPhone: next.memberPhone, memberDesc: next.memberDesc ?? '', memberPassword: '' });
    setAddress({ ...emptyAddress, ...(next.memberDeliveryAddress ?? {}) });
  };

  const load = async () => {
    setLoadError(null);
    try {
      applyMember(await memberApi.getProfile());
    } catch (error) {
      setLoadError(getApiErrorMessage(error));
    }
  };

  useEffect(() => {
    void load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!file) {
      setPreview(null);
      return;
    }
    const url = URL.createObjectURL(file);
    setPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [file]);

  if (loadError) return <ErrorState message={loadError} onRetry={() => void load()} />;
  if (!member) return <LoadingState label="Loading your profile…" />;

  const validateAccount = () => {
    const errors: Partial<Record<keyof AccountForm, string>> = {};
    const nick = account.memberNick.trim();
    if (nick.length < 2 || nick.length > 30) errors.memberNick = 'Nickname must be 2–30 characters';
    if (!PHONE_PATTERN.test(account.memberPhone.trim())) errors.memberPhone = 'Enter a valid phone number';
    if (account.memberDesc.length > 500) errors.memberDesc = 'Max 500 characters';
    if (account.memberPassword && account.memberPassword.length < 6) errors.memberPassword = 'Password must be at least 6 characters';
    setAccountErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const saveAccount = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setAccountMessage(null);
    if (!validateAccount()) return;
    setSavingAccount(true);
    try {
      const updated = await memberApi.updateProfile(
        {
          memberNick: account.memberNick.trim(),
          memberPhone: account.memberPhone.trim(),
          memberDesc: account.memberDesc.trim(),
          ...(account.memberPassword ? { memberPassword: account.memberPassword } : {}),
        },
        file,
      );
      applyMember(updated);
      setFile(undefined);
      setAccountMessage({ type: 'success', text: 'Profile updated.' });
      notify('Profile updated.', 'success');
    } catch (error) {
      setAccountMessage({ type: 'error', text: getApiErrorMessage(error) });
    } finally {
      setSavingAccount(false);
    }
  };

  const saveAddress = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setAddressMessage(null);
    const errors = validateAddress(address);
    setAddressErrors(errors);
    if (Object.keys(errors).length) return;
    setSavingAddress(true);
    try {
      const updated = await memberApi.updateProfile({ memberDeliveryAddress: cleanAddress(address) });
      applyMember(updated);
      setAddressMessage({ type: 'success', text: 'Default delivery address saved.' });
      notify('Delivery address saved.', 'success');
    } catch (error) {
      setAddressMessage({ type: 'error', text: getApiErrorMessage(error) });
    } finally {
      setSavingAddress(false);
    }
  };

  const onFileChange = (selected?: File) => {
    if (!selected) return;
    if (!selected.type.startsWith('image/')) {
      setAccountMessage({ type: 'error', text: 'Please choose an image file.' });
      return;
    }
    if (selected.size > MAX_IMAGE_BYTES) {
      setAccountMessage({ type: 'error', text: 'Please choose an image under 5 MB.' });
      return;
    }
    setAccountMessage(null);
    setFile(selected);
  };

  return (
    <Stack spacing={3} sx={{ maxWidth: 768, mx: 'auto' }}>
      <Box component="form" className="ms-surface ms-profile-section" onSubmit={saveAccount} noValidate>
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ alignItems: { sm: 'center' }, justifyContent: 'space-between' }}>
          <Stack direction="row" spacing={2} sx={{ alignItems: 'center' }}>
            <div className="ms-avatar-upload">
              {preview ? <img src={preview} alt="New profile preview" /> : <SafeImage src={member.memberImage} alt={member.memberNick} />}
              <IconButton component="label" className="ms-avatar-upload-button" aria-label="Change profile photo">
                <PhotoCameraOutlinedIcon sx={{ fontSize: 16 }} />
                <input type="file" accept="image/*" hidden onChange={(event) => onFileChange(event.target.files?.[0])} />
              </IconButton>
            </div>
            <div>
              <span className="ms-eyebrow">Profile</span>
              <Typography variant="h3" component="h1" sx={{ mt: 1 }}>
                {member.memberNick}
              </Typography>
              {file && (
                <Typography variant="caption" color="text.secondary">
                  New photo selected — save to upload.
                </Typography>
              )}
            </div>
          </Stack>
          <Chip label={`${member.memberPoint} points`} sx={{ alignSelf: { xs: 'flex-start', sm: 'center' } }} />
        </Stack>

        <div className="ms-form-grid two" style={{ marginTop: 32 }}>
          {accountMessage && (
            <Alert severity={accountMessage.type} className="span-2">
              {accountMessage.text}
            </Alert>
          )}
          <TextField
            label="Nickname"
            value={account.memberNick}
            onChange={(event) => setAccount({ ...account, memberNick: event.target.value })}
            error={!!accountErrors.memberNick}
            helperText={accountErrors.memberNick}
            fullWidth
          />
          <TextField
            label="Phone"
            value={account.memberPhone}
            onChange={(event) => setAccount({ ...account, memberPhone: event.target.value })}
            error={!!accountErrors.memberPhone}
            helperText={accountErrors.memberPhone}
            fullWidth
          />
          <TextField
            className="span-2"
            label="Bio"
            multiline
            rows={3}
            value={account.memberDesc}
            onChange={(event) => setAccount({ ...account, memberDesc: event.target.value })}
            error={!!accountErrors.memberDesc}
            helperText={accountErrors.memberDesc}
            fullWidth
          />
          <TextField
            className="span-2"
            label="New password"
            type="password"
            autoComplete="new-password"
            placeholder="Leave blank to keep current password"
            value={account.memberPassword}
            onChange={(event) => setAccount({ ...account, memberPassword: event.target.value })}
            error={!!accountErrors.memberPassword}
            helperText={accountErrors.memberPassword ?? 'Leave blank to keep your current password.'}
            fullWidth
          />
          <Button className="span-2" type="submit" variant="contained" size="large" startIcon={<SaveOutlinedIcon />} disabled={savingAccount}>
            {savingAccount ? 'Saving profile…' : 'Save profile'}
          </Button>
        </div>
      </Box>

      <Box component="form" className="ms-surface ms-profile-section" onSubmit={saveAddress} noValidate aria-labelledby="address-heading">
        <span className="ms-eyebrow">Delivery</span>
        <Typography id="address-heading" variant="h4" component="h2" sx={{ mt: 1, mb: 1 }}>
          Default delivery address
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
          Used to pre-fill checkout. Each order keeps its own copy, so changing this never affects past orders.
        </Typography>
        {addressMessage && (
          <Alert severity={addressMessage.type} sx={{ mb: 2 }}>
            {addressMessage.text}
          </Alert>
        )}
        <AddressForm value={address} errors={addressErrors} onChange={setAddress} disabled={savingAddress} />
        <Button type="submit" variant="contained" size="large" fullWidth sx={{ mt: 3 }} startIcon={<SaveOutlinedIcon />} disabled={savingAddress}>
          {savingAddress ? 'Saving address…' : 'Save address'}
        </Button>
      </Box>
    </Stack>
  );
}

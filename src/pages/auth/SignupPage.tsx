import { zodResolver } from '@hookform/resolvers/zod';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { z } from 'zod';
import { Alert, Button, Paper, TextField, Typography } from '@mui/material';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import { useDocumentTitle } from '../../app/hooks';
import { useAuthStore, useNoticeStore } from '../../app/store';
import { getApiErrorMessage, memberApi } from '../../services/api';
import { safeRedirect } from '../../utils/navigation';
import '../../css/userPage.css';

// Mirrors backend signup validation (Member.service.signup).
const signupSchema = z.object({
  memberNick: z.string().trim().min(2, 'Nickname must be at least 2 characters').max(30, 'Nickname must be 30 characters or fewer'),
  memberPhone: z
    .string()
    .trim()
    .regex(/^\+?[0-9\s\-()]{7,20}$/, 'Enter a valid phone number'),
  memberPassword: z.string().min(6, 'Password must be at least 6 characters').max(128, 'Password is too long'),
  memberAddress: z.string().trim().max(300, 'Address is too long').optional(),
  memberDesc: z.string().trim().max(500, 'Description is too long').optional(),
});

type SignupFormValues = z.infer<typeof signupSchema>;

export function SignupPage() {
  useDocumentTitle('Create account');
  const navigate = useNavigate();
  const location = useLocation();
  const redirectTo = safeRedirect((location.state as { from?: string } | null)?.from);
  const member = useAuthStore((state) => state.member);
  const setMember = useAuthStore((state) => state.setMember);
  const notify = useNoticeStore((state) => state.notify);
  const [serverError, setServerError] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<SignupFormValues>({
    resolver: zodResolver(signupSchema),
    defaultValues: { memberAddress: '', memberDesc: '' },
  });

  if (member && !isSubmitting) return <Navigate to={redirectTo} replace />;

  const onSubmit = async (values: SignupFormValues) => {
    setServerError(null);
    try {
      const created = await memberApi.signup({
        memberNick: values.memberNick,
        memberPhone: values.memberPhone,
        memberPassword: values.memberPassword,
        memberAddress: values.memberAddress || undefined,
        memberDesc: values.memberDesc || undefined,
      });
      setMember(created);
      notify(`Welcome to MULTI-SHOP, ${created.memberNick}!`, 'success');
      navigate(redirectTo, { replace: true });
    } catch (error) {
      setServerError(getApiErrorMessage(error));
    }
  };

  return (
    <Paper variant="outlined" className="ms-auth-card" sx={{ maxWidth: 576 }}>
      <span className="ms-eyebrow">Start now</span>
      <Typography variant="h3" component="h1" sx={{ mt: 1.5 }}>
        Create your account
      </Typography>

      <form className="ms-form-grid two" style={{ marginTop: 32 }} onSubmit={handleSubmit(onSubmit)} noValidate>
        {serverError && (
          <Alert severity="error" className="span-2">
            {serverError}
          </Alert>
        )}
        <TextField
          label="Nickname"
          autoComplete="username"
          {...register('memberNick')}
          error={!!errors.memberNick}
          helperText={errors.memberNick?.message}
          fullWidth
        />
        <TextField
          label="Phone number"
          autoComplete="tel"
          {...register('memberPhone')}
          error={!!errors.memberPhone}
          helperText={errors.memberPhone?.message}
          fullWidth
        />
        <TextField
          className="span-2"
          label="Password"
          type="password"
          autoComplete="new-password"
          {...register('memberPassword')}
          error={!!errors.memberPassword}
          helperText={errors.memberPassword?.message}
          fullWidth
        />
        <TextField
          className="span-2"
          label="Address (optional)"
          autoComplete="street-address"
          {...register('memberAddress')}
          error={!!errors.memberAddress}
          helperText={errors.memberAddress?.message ?? 'You can add a full delivery address later in your profile or at checkout.'}
          fullWidth
        />
        <TextField
          className="span-2"
          label="Profile description (optional)"
          multiline
          rows={3}
          {...register('memberDesc')}
          error={!!errors.memberDesc}
          helperText={errors.memberDesc?.message}
          fullWidth
        />
        <Button className="span-2" type="submit" variant="contained" size="large" disabled={isSubmitting} endIcon={<ArrowForwardIcon />} fullWidth>
          {isSubmitting ? 'Creating account…' : 'Create account'}
        </Button>
      </form>

      <Typography variant="body2" color="text.secondary" align="center" sx={{ mt: 3 }}>
        Already a member?{' '}
        <Link to="/login" state={location.state} style={{ fontWeight: 600 }}>
          Login here
        </Link>
      </Typography>
    </Paper>
  );
}

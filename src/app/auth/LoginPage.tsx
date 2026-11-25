import { zodResolver } from '@hookform/resolvers/zod';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { z } from 'zod';
import { Alert, Button, Paper, Stack, TextField, Typography } from '@mui/material';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import { useDocumentTitle } from '../hooks/useDocumentTitle';
import { useGlobals } from '../hooks/useGlobal';
import { useNotify } from '../hooks/useNotify';
import { getApiErrorMessage } from '../service/apiClient';
import MemberService from '../service/MemberService';
import { safeRedirect } from '../../lib/utils/navigation';
import '../../css/userPage.css';

const loginSchema = z.object({
  memberIdentity: z.string().trim().min(2, 'Please enter your nickname or phone number'),
  memberPassword: z.string().min(6, 'Password must be at least 6 characters'),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export default function LoginPage() {
  useDocumentTitle('Login');
  const navigate = useNavigate();
  const location = useLocation();
  const redirectTo = safeRedirect((location.state as { from?: string } | null)?.from);
  const { authMember: member, setAuthMember } = useGlobals();
  const notify = useNotify();
  const [serverError, setServerError] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormValues>({ resolver: zodResolver(loginSchema) });

  if (member && !isSubmitting) return <Navigate to={redirectTo} replace />;

  const onSubmit = async (values: LoginFormValues) => {
    setServerError(null);
    try {
      const loggedIn = await new MemberService().login(values);
      setAuthMember(loggedIn);
      notify(`Welcome back, ${loggedIn.memberNick}!`, 'success');
      navigate(redirectTo, { replace: true });
    } catch (error) {
      setServerError(getApiErrorMessage(error));
    }
  };

  return (
    <Paper variant="outlined" className="ms-auth-card" sx={{ maxWidth: 512 }}>
      <span className="ms-eyebrow">Welcome back</span>
      <Typography variant="h3" component="h1" sx={{ mt: 1.5 }}>
        Login to MULTI-SHOP
      </Typography>

      <Stack component="form" spacing={2.5} sx={{ mt: 4 }} onSubmit={handleSubmit(onSubmit)} noValidate>
        {serverError && <Alert severity="error">{serverError}</Alert>}
        <TextField
          label="Nickname or phone"
          placeholder="jordan88 or +123..."
          autoComplete="username"
          {...register('memberIdentity')}
          error={!!errors.memberIdentity}
          helperText={errors.memberIdentity?.message}
          fullWidth
        />
        <TextField
          label="Password"
          type="password"
          autoComplete="current-password"
          {...register('memberPassword')}
          error={!!errors.memberPassword}
          helperText={errors.memberPassword?.message}
          fullWidth
        />
        <Button type="submit" variant="contained" size="large" disabled={isSubmitting} endIcon={<ArrowForwardIcon />} fullWidth>
          {isSubmitting ? 'Signing in…' : 'Login'}
        </Button>
      </Stack>

      <Typography variant="body2" color="text.secondary" align="center" sx={{ mt: 3 }}>
        Need an account?{' '}
        <Link to="/signup" state={location.state} style={{ fontWeight: 600 }}>
          Create one
        </Link>
      </Typography>
    </Paper>
  );
}

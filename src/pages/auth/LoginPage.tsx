import { zodResolver } from '@hookform/resolvers/zod';
import { ArrowRight } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { Link, useNavigate } from 'react-router-dom';
import { z } from 'zod';
import { useAuthStore } from '../../store/authStore';
import { memberApi, getApiErrorMessage } from '../../services/api';

const loginSchema = z.object({
  memberIdentity: z.string().min(2, 'Please enter your nickname or phone number'),
  memberPassword: z.string().min(6, 'Password must be at least 6 characters'),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export function LoginPage() {
  const navigate = useNavigate();
  const setAuth = useAuthStore((state) => state.setAuth);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormValues>({ resolver: zodResolver(loginSchema) });

  const onSubmit = async (values: LoginFormValues) => {
    try {
      const response = await memberApi.login(values);
      setAuth(response.member, response.accessToken);
      navigate('/');
    } catch (error) {
      alert(getApiErrorMessage(error));
    }
  };

  return (
    <div className="mx-auto max-w-lg rounded-[30px] bg-white p-8 shadow-sm ring-1 ring-stone-200 md:p-10">
      <p className="text-[10px] uppercase tracking-[0.3em] text-stone-500">Welcome back</p>
      <h2 className="mt-3 text-3xl font-black tracking-[-0.04em] text-stone-900">Login to MULTI-SHOP</h2>

      <form className="mt-8 space-y-5" onSubmit={void handleSubmit(onSubmit)}>
        <div>
          <label className="mb-2 block text-sm font-medium text-stone-700">Nickname or phone</label>
          <input
            {...register('memberIdentity')}
            className="w-full rounded-2xl border border-stone-200 bg-stone-50 px-4 py-3 outline-none transition focus:border-stone-400"
            placeholder="jordan88 or +123..."
          />
          {errors.memberIdentity && <p className="mt-2 text-sm text-red-600">{errors.memberIdentity.message}</p>}
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-stone-700">Password</label>
          <input
            type="password"
            {...register('memberPassword')}
            className="w-full rounded-2xl border border-stone-200 bg-stone-50 px-4 py-3 outline-none transition focus:border-stone-400"
            placeholder="••••••••"
          />
          {errors.memberPassword && <p className="mt-2 text-sm text-red-600">{errors.memberPassword.message}</p>}
        </div>

        <button type="submit" disabled={isSubmitting} className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-stone-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-stone-800 disabled:cursor-not-allowed disabled:opacity-60">
          {isSubmitting ? 'Signing in...' : 'Login'}
          <ArrowRight className="h-4 w-4" />
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-stone-600">
        Need an account?{' '}
        <Link className="font-semibold text-stone-900" to="/signup">
          Create one
        </Link>
      </p>
    </div>
  );
}

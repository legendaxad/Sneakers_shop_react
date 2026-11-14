import { zodResolver } from '@hookform/resolvers/zod';
import { ArrowRight } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { Link, useNavigate } from 'react-router-dom';
import { z } from 'zod';
import { getApiErrorMessage, memberApi } from '../../services/api';
import { useAuthStore } from '../../store/authStore';

const signupSchema = z.object({
  memberNick: z.string().min(2, 'Nickname is required'),
  memberPhone: z.string().min(8, 'Phone number is required'),
  memberPassword: z.string().min(6, 'Password must be at least 6 characters'),
  memberAddress: z.string().min(4, 'Address is required').optional().or(z.literal('')),
  memberDesc: z.string().optional(),
});

type SignupFormValues = z.infer<typeof signupSchema>;

export function SignupPage() {
  const navigate = useNavigate();
  const setAuth = useAuthStore((state) => state.setAuth);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<SignupFormValues>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      memberAddress: '',
      memberDesc: '',
    },
  });

  const onSubmit = async (values: SignupFormValues) => {
    try {
      const response = await memberApi.signup(values);
      setAuth(response.member, response.accessToken);
      navigate('/');
    } catch (error) {
      alert(getApiErrorMessage(error));
    }
  };

  return (
    <div className="mx-auto max-w-xl rounded-[30px] bg-white p-8 shadow-sm ring-1 ring-stone-200 md:p-10">
      <p className="text-[10px] uppercase tracking-[0.3em] text-stone-500">Start now</p>
      <h2 className="mt-3 text-3xl font-black tracking-[-0.04em] text-stone-900">Create your account</h2>

      <form className="mt-8 grid gap-5 md:grid-cols-2" onSubmit={void handleSubmit(onSubmit)}>
        <div className="md:col-span-1">
          <label className="mb-2 block text-sm font-medium text-stone-700">Nickname</label>
          <input {...register('memberNick')} className="w-full rounded-2xl border border-stone-200 bg-stone-50 px-4 py-3 outline-none transition focus:border-stone-400" />
          {errors.memberNick && <p className="mt-2 text-sm text-red-600">{errors.memberNick.message}</p>}
        </div>

        <div className="md:col-span-1">
          <label className="mb-2 block text-sm font-medium text-stone-700">Phone number</label>
          <input {...register('memberPhone')} className="w-full rounded-2xl border border-stone-200 bg-stone-50 px-4 py-3 outline-none transition focus:border-stone-400" />
          {errors.memberPhone && <p className="mt-2 text-sm text-red-600">{errors.memberPhone.message}</p>}
        </div>

        <div className="md:col-span-2">
          <label className="mb-2 block text-sm font-medium text-stone-700">Password</label>
          <input type="password" {...register('memberPassword')} className="w-full rounded-2xl border border-stone-200 bg-stone-50 px-4 py-3 outline-none transition focus:border-stone-400" />
          {errors.memberPassword && <p className="mt-2 text-sm text-red-600">{errors.memberPassword.message}</p>}
        </div>

        <div className="md:col-span-2">
          <label className="mb-2 block text-sm font-medium text-stone-700">Address</label>
          <input {...register('memberAddress')} className="w-full rounded-2xl border border-stone-200 bg-stone-50 px-4 py-3 outline-none transition focus:border-stone-400" />
          {errors.memberAddress && <p className="mt-2 text-sm text-red-600">{errors.memberAddress.message}</p>}
        </div>

        <div className="md:col-span-2">
          <label className="mb-2 block text-sm font-medium text-stone-700">Profile description</label>
          <textarea {...register('memberDesc')} rows={4} className="w-full rounded-2xl border border-stone-200 bg-stone-50 px-4 py-3 outline-none transition focus:border-stone-400" />
        </div>

        <button type="submit" disabled={isSubmitting} className="md:col-span-2 inline-flex w-full items-center justify-center gap-2 rounded-full bg-stone-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-stone-800 disabled:cursor-not-allowed disabled:opacity-60">
          {isSubmitting ? 'Creating account...' : 'Create account'}
          <ArrowRight className="h-4 w-4" />
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-stone-600">
        Already a member?{' '}
        <Link className="font-semibold text-stone-900" to="/login">
          Login here
        </Link>
      </p>
    </div>
  );
}

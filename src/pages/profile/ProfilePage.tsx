import { useEffect, useState } from 'react';
import { Camera, Save } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { memberApi, getApiErrorMessage } from '../../services/api';
import { useAuthStore } from '../../store/authStore';
import type { Member, ProfileUpdateInput } from '../../types/member';
import { resolveImageUrl } from '../../utils/format';

const emptyForm: ProfileUpdateInput = {
  memberNick: '',
  memberPhone: '',
  memberAddress: '',
  memberDesc: '',
};

export function ProfilePage() {
  const navigate = useNavigate();
  const authMember = useAuthStore((state) => state.member);
  const setAuth = useAuthStore((state) => state.setAuth);
  const [member, setMember] = useState<Member | null>(null);
  const [form, setForm] = useState<ProfileUpdateInput>(emptyForm);
  const [isUploading, setIsUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | undefined>();

  useEffect(() => {
    if (!authMember) {
      navigate('/login');
      return;
    }

    const loadProfile = async () => {
      try {
        const nextMember = await memberApi.getProfile();
        setMember(nextMember);
        setForm({
          memberNick: nextMember.memberNick,
          memberPhone: nextMember.memberPhone,
          memberAddress: nextMember.memberAddress ?? '',
          memberDesc: nextMember.memberDesc ?? '',
        });
      } catch {
        navigate('/login');
      }
    };

    void loadProfile();
  }, [authMember, navigate]);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    try {
      setIsUploading(true);
      const updatedMember = await memberApi.updateProfile(form, selectedFile);
      setMember(updatedMember);
      setAuth(updatedMember, useAuthStore.getState().accessToken ?? undefined);
      alert('Profile updated successfully.');
    } catch (error) {
      alert(getApiErrorMessage(error));
    } finally {
      setIsUploading(false);
    }
  };

  if (!member) {
    return null;
  }

  return (
    <div className="mx-auto max-w-3xl rounded-[30px] bg-white p-6 shadow-sm ring-1 ring-stone-200 md:p-8">
      <div className="flex flex-col items-center gap-4 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-4">
          <div className="relative">
            <img
              src={resolveImageUrl(member.memberImage)}
              alt={member.memberNick}
              className="h-20 w-20 rounded-full object-cover ring-2 ring-stone-200"
            />
            <label className="absolute -bottom-1 -right-1 flex h-8 w-8 cursor-pointer items-center justify-center rounded-full bg-stone-900 text-white">
              <Camera className="h-4 w-4" />
              <input type="file" accept="image/*" className="hidden" onChange={(event) => setSelectedFile(event.target.files?.[0])} />
            </label>
          </div>
          <div>
            <p className="text-[10px] uppercase tracking-[0.28em] text-stone-500">Profile</p>
            <h2 className="mt-2 text-3xl font-black tracking-[-0.04em] text-stone-900">{member.memberNick}</h2>
          </div>
        </div>

        <div className="rounded-full bg-stone-100 px-4 py-2 text-sm font-medium text-stone-700">
          {member.memberPoint} points
        </div>
      </div>

      <form className="mt-8 grid gap-5 md:grid-cols-2" onSubmit={handleSubmit}>
        <div>
          <label className="mb-2 block text-sm font-medium text-stone-700">Nickname</label>
          <input
            value={form.memberNick ?? ''}
            onChange={(event) => setForm((current) => ({ ...current, memberNick: event.target.value }))}
            className="w-full rounded-2xl border border-stone-200 bg-stone-50 px-4 py-3 outline-none transition focus:border-stone-400"
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-stone-700">Phone</label>
          <input
            value={form.memberPhone ?? ''}
            onChange={(event) => setForm((current) => ({ ...current, memberPhone: event.target.value }))}
            className="w-full rounded-2xl border border-stone-200 bg-stone-50 px-4 py-3 outline-none transition focus:border-stone-400"
          />
        </div>

        <div className="md:col-span-2">
          <label className="mb-2 block text-sm font-medium text-stone-700">Address</label>
          <input
            value={form.memberAddress ?? ''}
            onChange={(event) => setForm((current) => ({ ...current, memberAddress: event.target.value }))}
            className="w-full rounded-2xl border border-stone-200 bg-stone-50 px-4 py-3 outline-none transition focus:border-stone-400"
          />
        </div>

        <div className="md:col-span-2">
          <label className="mb-2 block text-sm font-medium text-stone-700">Bio</label>
          <textarea
            rows={4}
            value={form.memberDesc ?? ''}
            onChange={(event) => setForm((current) => ({ ...current, memberDesc: event.target.value }))}
            className="w-full rounded-2xl border border-stone-200 bg-stone-50 px-4 py-3 outline-none transition focus:border-stone-400"
          />
        </div>

        <div className="md:col-span-2">
          <label className="mb-2 block text-sm font-medium text-stone-700">New password</label>
          <input
            type="password"
            value={form.memberPassword ?? ''}
            onChange={(event) => setForm((current) => ({ ...current, memberPassword: event.target.value }))}
            placeholder="Leave blank to keep current password"
            className="w-full rounded-2xl border border-stone-200 bg-stone-50 px-4 py-3 outline-none transition focus:border-stone-400"
          />
        </div>

        <button type="submit" disabled={isUploading} className="md:col-span-2 inline-flex w-full items-center justify-center gap-2 rounded-full bg-stone-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-stone-800 disabled:cursor-not-allowed disabled:opacity-60">
          <Save className="h-4 w-4" />
          {isUploading ? 'Saving profile...' : 'Save profile'}
        </button>
      </form>
    </div>
  );
}

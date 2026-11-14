import { create } from 'zustand';
import type { Member } from '../types/member';

interface AuthState {
  member: Member | null;
  accessToken: string | null;
  setAuth: (member: Member, accessToken?: string) => void;
  clearAuth: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  member: null,
  accessToken: null,
  setAuth: (member, accessToken) => set({ member, accessToken: accessToken ?? null }),
  clearAuth: () => set({ member: null, accessToken: null }),
}));

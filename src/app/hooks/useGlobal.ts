import { createContext, useContext } from 'react';
import type { Member } from '../../lib/types/member';

/** `checking` until the first GET /member/detail completes after page load. */
export type AuthStatus = 'checking' | 'authenticated' | 'guest';

/** Application-wide session shared through React Context (see ContextProvider). */
export interface GlobalInterface {
  authMember: Member | null;
  authStatus: AuthStatus;
  /** Store the member returned by login, signup, profile update or session restore. */
  setAuthMember: (member: Member) => void;
  /** End the local session (logout, or a 401 from the backend). */
  clearAuthMember: () => void;
}

export const GlobalContext = createContext<GlobalInterface | undefined>(undefined);

export const useGlobals = (): GlobalInterface => {
  const context = useContext(GlobalContext);
  if (context === undefined) throw new Error('useGlobals must be used within a <ContextProvider>.');
  return context;
};

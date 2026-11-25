import { useCallback, useEffect, useMemo, useState, type PropsWithChildren } from 'react';
import type { Member } from '../../lib/types/member';
import { useAppDispatch } from '../hooks';
import { GlobalContext, type AuthStatus, type GlobalInterface } from '../hooks/useGlobal';
import { setOrders } from '../screens/ordersPage/slice';
import { setUnauthorizedHandler } from '../service/apiClient';
import MemberService from '../service/MemberService';

/**
 * Owns the customer session. The `accessToken` cookie is httpOnly, so the
 * session is restored by asking the backend (GET /member/detail) on load
 * rather than reading the cookie or a localStorage copy.
 */
const ContextProvider = ({ children }: PropsWithChildren) => {
  const dispatch = useAppDispatch();
  const [authMember, setMember] = useState<Member | null>(null);
  const [authStatus, setAuthStatus] = useState<AuthStatus>('checking');

  const setAuthMember = useCallback((member: Member) => {
    setMember(member);
    setAuthStatus('authenticated');
  }, []);

  const clearAuthMember = useCallback(() => {
    setMember(null);
    setAuthStatus('guest');
    dispatch(setOrders([])); // don't keep the previous member's orders in memory
  }, [dispatch]);

  // Restore the session from the cookie on page load.
  useEffect(() => {
    let active = true;
    const restore = async () => {
      try {
        const member = await new MemberService().getMemberDetail();
        if (active) setAuthMember(member);
      } catch {
        if (active) clearAuthMember();
      }
    };
    void restore();
    return () => {
      active = false;
    };
  }, [setAuthMember, clearAuthMember]);

  // An authenticated call returning 401 means the cookie expired or the account was blocked.
  useEffect(() => setUnauthorizedHandler(clearAuthMember), [clearAuthMember]);

  const value = useMemo<GlobalInterface>(
    () => ({ authMember, authStatus, setAuthMember, clearAuthMember }),
    [authMember, authStatus, setAuthMember, clearAuthMember],
  );

  return <GlobalContext.Provider value={value}>{children}</GlobalContext.Provider>;
};

export default ContextProvider;

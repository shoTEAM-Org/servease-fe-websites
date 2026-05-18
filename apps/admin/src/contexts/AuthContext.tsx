import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { apiFetch, ApiError } from '../services/api';

export interface AuthUser {
  id: string;
  email: string;
  role: string;
  full_name?: string;
}

interface AuthContextType {
  token: string | null;
  user: AuthUser | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  verifyMfa: (otpId: string, code: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const stored = localStorage.getItem('admin_token');
    if (!stored) {
      setLoading(false);
      return;
    }
    apiFetch<AuthUser>('/api/auth/v1/me')
      .then((u) => { setToken(stored); setUser(u); })
      .catch(() => { localStorage.removeItem('admin_token'); })
      .finally(() => setLoading(false));
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    const loginRes = await apiFetch<{
      session?: { access_token: string };
      mfaRequired?: boolean;
      otpId?: string;
    }>('/api/auth/v1/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });

    if (loginRes.mfaRequired && loginRes.otpId) {
      // Caller (Login.tsx) handles navigation to /mfa-verify
      throw Object.assign(new ApiError(202, 'MFA_REQUIRED'), {
        mfaRequired: true,
        otpId: loginRes.otpId,
      });
    }

    if (!loginRes.session?.access_token) throw new ApiError(500, 'No session returned');
    const accessToken = loginRes.session.access_token;

    localStorage.setItem('admin_token', accessToken);
    try {
      const me = await apiFetch<AuthUser>('/api/auth/v1/me');
      if (me.role !== 'admin') {
        localStorage.removeItem('admin_token');
        throw new ApiError(403, 'Admin access only.');
      }
      setToken(accessToken);
      setUser(me);
    } catch (err) {
      localStorage.removeItem('admin_token');
      throw err;
    }
  }, []);

  const verifyMfa = useCallback(async (otpId: string, code: string) => {
    const res = await apiFetch<{ session: { access_token: string } }>(
      '/api/auth/v1/login/mfa',
      { method: 'POST', body: JSON.stringify({ otpId, code }) },
    );
    localStorage.setItem('admin_token', res.session.access_token);
    const me = await apiFetch<AuthUser>('/api/auth/v1/me');
    if (me.role !== 'admin') {
      localStorage.removeItem('admin_token');
      throw new ApiError(403, 'Admin access only.');
    }
    setToken(res.session.access_token);
    setUser(me);
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('admin_token');
    setToken(null);
    setUser(null);
    window.location.href = '/login';
  }, []);

  return (
    <AuthContext.Provider value={{ token, user, loading, login, verifyMfa, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextType {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}

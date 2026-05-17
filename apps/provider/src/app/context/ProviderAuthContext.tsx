import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

const API_BASE = import.meta.env.VITE_API_BASE_URL || '';
const STORAGE_KEY = 'servease.provider.session';

type VerificationStatus = 'pending' | 'under_review' | 'approved' | 'rejected';

interface ProviderUser {
  id: string;
  email: string;
  fullName: string;
  verificationStatus: VerificationStatus;
}

interface ProviderSession {
  token: string;
  user: ProviderUser;
}

interface ProviderAuthContextType {
  session: ProviderSession | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
}

const ProviderAuthContext = createContext<ProviderAuthContextType | undefined>(undefined);

export function ProviderAuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<ProviderSession | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) setSession(JSON.parse(stored));
    } catch {
      localStorage.removeItem(STORAGE_KEY);
    }
    setIsLoading(false);
  }, []);

  async function login(email: string, password: string) {
    const res = await fetch(`${API_BASE}/api/auth/v1/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password, role: 'provider' }),
    });

    const payload = await res.json();
    if (!res.ok) {
      throw new Error(payload?.message || 'Login failed. Please check your credentials.');
    }

    const raw = payload?.session ?? payload?.data ?? payload;
    const user = raw?.user ?? {};
    const newSession: ProviderSession = {
      token: raw?.access_token ?? raw?.token ?? '',
      user: {
        id: user?.id ?? '',
        email: user?.email ?? email,
        fullName: user?.full_name ?? user?.fullName ?? '',
        verificationStatus: (user?.verification_status ?? user?.verificationStatus ?? 'pending') as VerificationStatus,
      },
    };

    localStorage.setItem(STORAGE_KEY, JSON.stringify(newSession));
    setSession(newSession);
  }

  function logout() {
    localStorage.removeItem(STORAGE_KEY);
    setSession(null);
  }

  return (
    <ProviderAuthContext.Provider value={{ session, isLoading, login, logout }}>
      {children}
    </ProviderAuthContext.Provider>
  );
}

export function useProviderAuth() {
  const ctx = useContext(ProviderAuthContext);
  if (!ctx) throw new Error('useProviderAuth must be used inside ProviderAuthProvider');
  return ctx;
}

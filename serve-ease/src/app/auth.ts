const AUTH_STORAGE_KEY = 'servease.isAuthenticated';
const SESSION_STORAGE_KEY = 'servease.provider.auth';

type ProviderAuthUser = {
  id?: string;
  email?: string;
  role?: string;
};

export type ProviderAuthSession = {
  accessToken: string;
  refreshToken?: string;
  user?: ProviderAuthUser;
};

function parseStoredSession(raw: string | null): ProviderAuthSession | null {
  if (!raw) {
    return null;
  }

  try {
    const parsed = JSON.parse(raw) as Partial<ProviderAuthSession>;
    const accessToken = String(parsed.accessToken || '').trim();
    if (!accessToken) {
      return null;
    }

    return {
      accessToken,
      refreshToken: parsed.refreshToken ? String(parsed.refreshToken) : undefined,
      user:
        parsed.user && typeof parsed.user === 'object'
          ? {
              id: parsed.user.id ? String(parsed.user.id) : undefined,
              email: parsed.user.email ? String(parsed.user.email) : undefined,
              role: parsed.user.role ? String(parsed.user.role) : undefined,
            }
          : undefined,
    };
  } catch {
    return null;
  }
}

export function getStoredProviderSession(): ProviderAuthSession | null {
  if (typeof window === 'undefined') {
    return null;
  }

  return parseStoredSession(window.localStorage.getItem(SESSION_STORAGE_KEY));
}

export function persistProviderSession(session: ProviderAuthSession) {
  if (typeof window === 'undefined') {
    return;
  }

  const accessToken = String(session.accessToken || '').trim();
  if (!accessToken) {
    clearProviderSession();
    return;
  }

  window.localStorage.setItem(
    SESSION_STORAGE_KEY,
    JSON.stringify({
      accessToken,
      refreshToken: session.refreshToken,
      user: session.user,
    }),
  );
  window.localStorage.setItem(AUTH_STORAGE_KEY, 'true');
}

export function clearProviderSession() {
  if (typeof window === 'undefined') {
    return;
  }

  window.localStorage.removeItem(SESSION_STORAGE_KEY);
  window.localStorage.removeItem(AUTH_STORAGE_KEY);
}

export function isUserAuthenticated() {
  if (typeof window === 'undefined') {
    return false;
  }

  return !!getStoredProviderSession() || window.localStorage.getItem(AUTH_STORAGE_KEY) === 'true';
}

export function setUserAuthenticated(value: boolean) {
  if (typeof window === 'undefined') {
    return;
  }

  if (value) {
    window.localStorage.setItem(AUTH_STORAGE_KEY, 'true');
    return;
  }

  clearProviderSession();
}

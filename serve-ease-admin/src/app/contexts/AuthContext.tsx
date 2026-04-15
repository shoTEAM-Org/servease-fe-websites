"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";

interface Admin {
  id: string;
  name: string;
  email: string;
  role: string;
}

interface AuthContextType {
  admin: Admin | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  sessionExpired: boolean;
  clearSessionExpired: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const ADMIN_STORAGE_KEY = "servease_admin";
const AUTH_STORAGE_KEY = "servease_admin_auth";
const DEFAULT_API_BASE_URL = "http://localhost:5000";

type StoredAuth = {
  accessToken: string;
  refreshToken?: string;
};

type LoginResponse = {
  access_token?: string;
  refresh_token?: string;
  user?: {
    id?: string;
    email?: string;
    full_name?: string;
    role?: string;
  };
};

type AdminProfileResponse = {
  profile?: {
    id?: string;
    full_name?: string;
    email?: string;
  };
  message?: string;
  error?: string;
};

function getApiBaseUrl() {
  return (process.env.NEXT_PUBLIC_API_BASE_URL || DEFAULT_API_BASE_URL).replace(/\/+$/, "");
}

function getStoredAuth(): StoredAuth | null {
  const raw = localStorage.getItem(AUTH_STORAGE_KEY);
  if (!raw) return null;

  try {
    return JSON.parse(raw) as StoredAuth;
  } catch {
    localStorage.removeItem(AUTH_STORAGE_KEY);
    return null;
  }
}

function clearStoredSession() {
  localStorage.removeItem(ADMIN_STORAGE_KEY);
  localStorage.removeItem(AUTH_STORAGE_KEY);
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [admin, setAdmin] = useState<Admin | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [sessionExpired, setSessionExpired] = useState(false);

  useEffect(() => {
    const restoreSession = async () => {
      const storedAdmin = localStorage.getItem(ADMIN_STORAGE_KEY);
      const storedAuth = getStoredAuth();

      if (!storedAdmin || !storedAuth?.accessToken) {
        clearStoredSession();
        setIsLoading(false);
        return;
      }

      try {
        const parsedAdmin = JSON.parse(storedAdmin) as Admin;
        const profileResponse = await fetch(`${getApiBaseUrl()}/api/admin/v1/account/profile`, {
          method: "GET",
          headers: {
            Authorization: `Bearer ${storedAuth.accessToken}`,
          },
        });

        if (!profileResponse.ok) {
          throw new Error("Stored session is no longer valid.");
        }

        const profileData = (await profileResponse.json()) as AdminProfileResponse;
        const profile = profileData.profile;

        setAdmin({
          id: profile?.id || parsedAdmin.id,
          name: profile?.full_name || parsedAdmin.name,
          email: profile?.email || parsedAdmin.email,
          role: parsedAdmin.role || "Admin",
        });
      } catch {
        clearStoredSession();
        setSessionExpired(true);
      } finally {
        setIsLoading(false);
      }
    };

    void restoreSession();
  }, []);

  const login = async (
    email: string,
    password: string
  ): Promise<{ success: boolean; error?: string }> => {
    try {
      const loginResponse = await fetch(`${getApiBaseUrl()}/api/auth/v1/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      const loginData = (await loginResponse.json().catch(() => ({}))) as LoginResponse & { message?: string };

      if (!loginResponse.ok || !loginData.access_token) {
        return {
          success: false,
          error: typeof loginData.message === "string" ? loginData.message : "Incorrect email or password.",
        };
      }

      const profileResponse = await fetch(`${getApiBaseUrl()}/api/admin/v1/account/profile`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${loginData.access_token}`,
        },
      });

      const profileData = (await profileResponse.json().catch(() => ({}))) as AdminProfileResponse;

      if (!profileResponse.ok || !profileData.profile) {
        const profileError =
          typeof profileData.message === "string"
            ? profileData.message
            : typeof profileData.error === "string"
              ? profileData.error
              : null;

        return {
          success: false,
          error: profileError || "Access restricted. This portal is for authorized admins only.",
        };
      }

      const nextAdmin: Admin = {
        id: profileData.profile.id || loginData.user?.id || "",
        name: profileData.profile.full_name || loginData.user?.full_name || email,
        email: profileData.profile.email || loginData.user?.email || email,
        role: loginData.user?.role === "admin" ? "Admin" : loginData.user?.role || "Admin",
      };

      const nextAuth: StoredAuth = {
        accessToken: loginData.access_token,
        refreshToken: loginData.refresh_token,
      };

      setAdmin(nextAdmin);
      setSessionExpired(false);
      localStorage.setItem(ADMIN_STORAGE_KEY, JSON.stringify(nextAdmin));
      localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(nextAuth));

      return { success: true };
    } catch {
      return {
        success: false,
        error: "Could not reach the server. Check that the backend is running and the API base URL is correct.",
      };
    }
  };

  const logout = () => {
    const storedAuth = getStoredAuth();

    if (storedAuth?.accessToken) {
      void fetch(`${getApiBaseUrl()}/api/auth/v1/logout`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${storedAuth.accessToken}`,
        },
      }).catch(() => undefined);
    }

    setAdmin(null);
    clearStoredSession();
  };

  const clearSessionExpired = () => {
    setSessionExpired(false);
  };

  return (
    <AuthContext.Provider
      value={{
        admin,
        isAuthenticated: !!admin,
        isLoading,
        login,
        logout,
        sessionExpired,
        clearSessionExpired,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}

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
const ADMIN_TOKEN_STORAGE_KEY = "servease_admin_token";

function getApiBaseUrl(): string {
  return import.meta.env.VITE_API_BASE_URL || "";
}

function asRecord(value: unknown): Record<string, unknown> {
  return value && typeof value === "object" ? value as Record<string, unknown> : {};
}

function getString(value: unknown): string | undefined {
  return typeof value === "string" && value ? value : undefined;
}

function getLoginData(response: unknown): Record<string, unknown> {
  const root = asRecord(response);
  return asRecord(root.data);
}

function getAccessToken(response: unknown): string | undefined {
  const root = asRecord(response);
  const data = getLoginData(response);

  return getString(root.access_token)
    ?? getString(root.accessToken)
    ?? getString(root.token)
    ?? getString(data.access_token)
    ?? getString(data.accessToken)
    ?? getString(data.token);
}

function getAdminProfile(response: unknown, email: string): Admin {
  const root = asRecord(response);
  const data = getLoginData(response);
  const profile = asRecord(root.admin);
  const dataProfile = asRecord(data.admin);
  const user = asRecord(root.user);
  const dataUser = asRecord(data.user);
  const profileRecord = asRecord(root.profile);
  const dataProfileRecord = asRecord(data.profile);
  const adminRecord = Object.keys(profile).length
    ? profile
    : Object.keys(dataProfile).length
      ? dataProfile
      : Object.keys(user).length
        ? user
        : Object.keys(dataUser).length
          ? dataUser
          : Object.keys(profileRecord).length
            ? profileRecord
            : dataProfileRecord;

  return {
    id: getString(adminRecord.id) ?? getString(adminRecord.adminId) ?? getString(adminRecord.admin_id) ?? email,
    name: getString(adminRecord.name) ?? getString(adminRecord.fullName) ?? getString(adminRecord.full_name) ?? email,
    email: getString(adminRecord.email) ?? email,
    role: getString(adminRecord.role) ?? "Admin",
  };
}

function getLoginErrorMessage(response: unknown): string {
  const root = asRecord(response);
  const data = getLoginData(response);

  return getString(root.message)
    ?? getString(root.error)
    ?? getString(data.message)
    ?? getString(data.error)
    ?? "Incorrect email or password.";
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [admin, setAdmin] = useState<Admin | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [sessionExpired, setSessionExpired] = useState(false);

  // Check for existing session on mount
  useEffect(() => {
    const storedAdmin = localStorage.getItem(ADMIN_STORAGE_KEY);
    const storedToken = localStorage.getItem(ADMIN_TOKEN_STORAGE_KEY);

    if (storedAdmin && storedToken) {
      try {
        setAdmin(JSON.parse(storedAdmin));
      } catch (error) {
        localStorage.removeItem(ADMIN_STORAGE_KEY);
        localStorage.removeItem(ADMIN_TOKEN_STORAGE_KEY);
      }
    } else {
      localStorage.removeItem(ADMIN_STORAGE_KEY);
      localStorage.removeItem(ADMIN_TOKEN_STORAGE_KEY);
    }

    setIsLoading(false);
  }, []);

  const login = async (
    email: string,
    password: string
  ): Promise<{ success: boolean; error?: string }> => {
    const apiBaseUrl = getApiBaseUrl();
    const loginUrl = `${apiBaseUrl}/api/auth/v1/login`;

    try {
      const response = await fetch(loginUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json().catch(() => null);

      if (!response.ok) {
        return {
          success: false,
          error: getLoginErrorMessage(data),
        };
      }

      const accessToken = getAccessToken(data);
      if (!accessToken) {
        return {
          success: false,
          error: "Login response did not include an access token.",
        };
      }

      const adminProfile = getAdminProfile(data, email);
      setAdmin(adminProfile);
      localStorage.setItem(ADMIN_STORAGE_KEY, JSON.stringify(adminProfile));
      localStorage.setItem(ADMIN_TOKEN_STORAGE_KEY, accessToken);
      setSessionExpired(false);
      return { success: true };
    } catch (error) {
      console.warn("Admin login failed.", error);
      return {
        success: false,
        error: "Unable to sign in. Please try again.",
      };
    }
  };

  const logout = () => {
    setAdmin(null);
    localStorage.removeItem(ADMIN_STORAGE_KEY);
    localStorage.removeItem(ADMIN_TOKEN_STORAGE_KEY);
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

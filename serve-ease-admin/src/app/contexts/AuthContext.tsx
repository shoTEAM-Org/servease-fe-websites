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
const API_BASE = (
  process.env.NEXT_PUBLIC_API_URL ||
  process.env.NEXT_PUBLIC_GATEWAY_URL ||
  "http://localhost:5000"
).replace(/\/$/, "");

type BackendLoginResponse = {
  access_token?: string;
  refresh_token?: string;
  session?: {
    access_token?: string;
    refresh_token?: string;
    user?: {
      id?: string;
      email?: string;
      full_name?: string;
      name?: string;
      role?: string;
    };
  };
  user?: {
    id?: string;
    email?: string;
    full_name?: string;
    name?: string;
    role?: string;
  };
  message?: string;
};

// Demo credentials for testing
const DEMO_ADMIN = {
  email: "juan@servease.ph",
  password: "admin123",
  admin: {
    id: "ADM-001",
    name: "Juan Dela Cruz",
    email: "juan@servease.ph",
    role: "Super Admin",
  },
};

export function AuthProvider({ children }: { children: ReactNode }) {
  const [admin, setAdmin] = useState<Admin | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [sessionExpired, setSessionExpired] = useState(false);

  // Check for existing session on mount
  useEffect(() => {
    const storedAdmin = localStorage.getItem("servease_admin");
    if (storedAdmin) {
      try {
        setAdmin(JSON.parse(storedAdmin));
      } catch (error) {
        localStorage.removeItem("servease_admin");
      }
    }
    setIsLoading(false);
  }, []);

  const login = async (
    email: string,
    password: string
  ): Promise<{ success: boolean; error?: string }> => {
    const normalizedEmail = email.trim().toLowerCase();

    if (normalizedEmail === DEMO_ADMIN.email && password === DEMO_ADMIN.password) {
      setAdmin(DEMO_ADMIN.admin);
      localStorage.setItem("servease_admin", JSON.stringify(DEMO_ADMIN.admin));
      localStorage.removeItem("admin_access_token");
      localStorage.removeItem("admin_refresh_token");
      localStorage.removeItem("access_token");
      setSessionExpired(false);
      return { success: true };
    }

    if (normalizedEmail === "inactive@servease.ph") {
      return {
        success: false,
        error: "This admin account is inactive. Contact a Super Admin.",
      };
    }

    if (normalizedEmail === "user@servease.ph") {
      return {
        success: false,
        error: "Access restricted. This portal is for authorized admins only.",
      };
    }

    try {
      const response = await fetch(`${API_BASE}/api/auth/v1/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: normalizedEmail, password }),
      });
      const payload = (await response.json().catch(() => ({}))) as BackendLoginResponse;

      if (!response.ok) {
        return {
          success: false,
          error: payload.message || "Incorrect email or password.",
        };
      }

      const user = payload.user || payload.session?.user;
      if (String(user?.role || "").toLowerCase() !== "admin") {
        return {
          success: false,
          error: "Access restricted. This portal is for authorized admins only.",
        };
      }

      const accessToken = payload.access_token || payload.session?.access_token;
      if (!accessToken) {
        return {
          success: false,
          error: "Admin login did not return an access token.",
        };
      }

      const backendAdmin: Admin = {
        id: user?.id || normalizedEmail,
        name: user?.full_name || user?.name || normalizedEmail,
        email: user?.email || normalizedEmail,
        role: "Admin",
      };

      setAdmin(backendAdmin);
      localStorage.setItem("servease_admin", JSON.stringify(backendAdmin));
      localStorage.setItem("admin_access_token", accessToken);
      localStorage.setItem("access_token", accessToken);
      if (payload.refresh_token || payload.session?.refresh_token) {
        localStorage.setItem(
          "admin_refresh_token",
          payload.refresh_token || payload.session?.refresh_token || ""
        );
      }
      setSessionExpired(false);
      return { success: true };
    } catch {
      return {
        success: false,
        error: "Cannot reach the backend gateway. Start the backend and try again.",
      };
    }
  };

  const logout = () => {
    setAdmin(null);
    localStorage.removeItem("servease_admin");
    localStorage.removeItem("admin_access_token");
    localStorage.removeItem("admin_refresh_token");
    localStorage.removeItem("access_token");
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

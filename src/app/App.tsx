import { useEffect } from "react";
import { RouterProvider } from "react-router";
import { router } from "./routes";
import { AuthProvider } from "./contexts/AuthContext";
import { LanguageProvider } from "./contexts/LanguageContext";
import { applyAdminPreferences, readAdminPreferences } from "./utils/preferences";

// ServEase Admin Dashboard - Main Entry Point
export default function App() {
  useEffect(() => {
    const storedPreferences = readAdminPreferences();
    if (storedPreferences) {
      applyAdminPreferences(storedPreferences);
    }
  }, []);

  return (
    <AuthProvider>
      <LanguageProvider>
        <RouterProvider router={router} />
      </LanguageProvider>
    </AuthProvider>
  );
}
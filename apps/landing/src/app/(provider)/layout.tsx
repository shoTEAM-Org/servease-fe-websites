import type { Metadata } from "next";
import { Inter, Poppins } from "next/font/google";
import "./styles/globals.css"; // We'll need to ensure this exists or create it
import { ProviderDataProvider } from "@/app/(provider)/context/ProviderDataContext";
import { Toaster } from "sonner";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

const poppins = Poppins({
  weight: ["400", "500", "600", "700"],
  subsets: ["latin"],
  variable: "--font-poppins",
});

export const metadata: Metadata = {
  title: "ServEase | Provider Portal",
  description: "Manage your service business with ServEase",
};

export default function ProviderLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className={`${inter.variable} ${poppins.variable} antialiased font-sans`}>
      <ProviderDataProvider>
        {children}
        <Toaster position="top-right" richColors />
      </ProviderDataProvider>
    </div>
  );
}

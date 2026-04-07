import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { Navbar } from "@/components/marketing/Navbar";
import { Footer } from "@/components/marketing/Footer";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Revise Landing Page for ServEase",
  description: "Book Trusted Services Anytime, Anywhere",
};

export default function MarketingLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="min-h-screen flex flex-col">
      <div className="sticky top-0 z-50 bg-[#00BF63] border-b border-green-600/20 shadow-sm">
        <Navbar />
      </div>
      <main className="flex-1">
        {children}
      </main>
      <Footer />
    </div>
  );
}

"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { Menu, X, Briefcase } from "lucide-react";
import imgLogo from "@/assets/f5a6a28739bed7a9af038e3bf55db0c6b4b73bfc.png";
import { DESIGN, CSS_CLASSES } from "@/constants/design";

export function Navbar() {
  const pathname = usePathname();
  const isActive = (path: string) => pathname === path;

  return (
    <nav className="w-full px-6 md:px-16 py-4 flex items-center justify-between relative z-50">
      <Link href="/" className="flex items-center gap-2 group">
        <img 
          src={typeof imgLogo === 'string' ? imgLogo : imgLogo.src} 
          alt="ServEase Logo" 
          className="h-10 object-contain group-hover:opacity-80 transition-opacity duration-300" 
        />
      </Link>
      
      <div className="hidden md:flex items-center bg-black/20 backdrop-blur-sm rounded-full px-8 py-3 gap-8">
        {[
          { path: "/", label: "Home" },
          { path: "/about", label: "About Us" },
          { path: "/faq", label: "FAQ" },
          { path: "/contact", label: "Contact" },
        ].map((item) => (
          <Link
            key={item.path}
            href={item.path}
            className={`font-['Poppins',sans-serif] text-base no-underline transition-colors duration-300 ${
              isActive(item.path) ? "text-white font-semibold" : "text-white/80 hover:text-white"
            }`}
            aria-current={isActive(item.path) ? "page" : undefined}
          >
            {item.label}
          </Link>
        ))}
      </div>

      <div className="hidden md:flex items-center gap-6">
        <Link
          href="/login"
          className="font-['Poppins',sans-serif] text-sm font-bold text-white/80 hover:text-white transition-colors duration-300"
        >
          Login
        </Link>
        <Link
          href="/apply"
          className="font-['Poppins',sans-serif] text-sm font-bold text-white border-2 border-white/30 px-6 py-2.5 rounded-full hover:bg-white hover:text-[#00BF63] transition-all duration-300 flex items-center gap-2 shadow-lg shadow-green-900/20"
        >
          <Briefcase size={18} />
          Become a Provider
        </Link>
      </div>

      {/* Mobile menu toggle */}
      <div className="md:hidden flex items-center gap-4">
        <Link
          href="/login"
          className="font-['Poppins',sans-serif] text-sm font-bold text-white/90 hover:text-white transition-colors duration-300"
        >
          Login
        </Link>
        <MobileMenu />
      </div>
    </nav>
  );
}

function MobileMenu() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const isActive = (path: string) => pathname === path;

  return (
    <div className="md:hidden">
      <button
        onClick={() => setOpen(!open)}
        className="text-white p-2 hover:bg-white/10 rounded-lg transition-colors"
        aria-label="Toggle navigation menu"
      >
        {open ? <X size={28} /> : <Menu size={28} />}
      </button>
      {open && (
        <div className="absolute top-full left-0 right-0 bg-black/95 backdrop-blur-sm flex flex-col items-center gap-4 py-6 z-50 border-t border-white/10">
          {[
            { path: "/", label: "Home" },
            { path: "/about", label: "About Us" },
            { path: "/faq", label: "FAQ" },
            { path: "/contact", label: "Contact" },
            { path: "/login", label: "Login" },
            { path: "/apply", label: "Become a Provider" },
          ].map((item) => (
            <Link
              key={item.path}
              href={item.path}
              onClick={() => setOpen(false)}
              className={`font-['Poppins',sans-serif] text-lg no-underline transition-colors duration-300 ${
                isActive(item.path) ? "text-white font-semibold" : "text-white/80 hover:text-white"
              } ${item.path === '/login' ? 'text-[#00BF63] bg-white px-6 py-2 rounded-full mt-2' : ''}`}
              aria-current={isActive(item.path) ? "page" : undefined}
            >
              {item.label}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

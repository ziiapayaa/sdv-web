"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, ShoppingBag, User } from "lucide-react";
import { useCartStore } from "@/lib/store";

export function Navbar() {
  const pathname = usePathname();
  const { data: session } = useSession();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
  // Use Cartesian total from Zustand
  const { items } = useCartStore();
  const cartTotal = items.reduce((total, item) => total + item.quantity, 0);

  // Close mobile menu when route changes
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [pathname]);

  // Handle ESC key to close mobile menu
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setIsMobileMenuOpen(false);
      }
    };
    if (isMobileMenuOpen) {
      document.addEventListener("keydown", handleKeyDown);
    }
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isMobileMenuOpen]);

  // Prevent scroll when mobile menu is open
  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isMobileMenuOpen]);

  const isLoggedIn = !!session?.user;

  const navLinks = [
    { name: "COLLECTIONS", href: "/collections" },
    { name: "MANIFESTO", href: "/about" },
    { name: `CART (${cartTotal})`, href: "/cart" },
  ];

  return (
    <>
      <motion.nav 
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="sticky top-0 w-full z-[1000] h-[72px] px-6 lg:px-12 flex justify-between items-center bg-[#fafafa] border-b border-[#e8e8e8] shadow-[0_1px_0_rgba(0,0,0,0.03)]"
      >
        {/* DESKTOP LAYOUT (Hidden on Mobile) */}
        <div className="hidden md:flex flex-1 items-center justify-between w-full">
          {/* Kiri: Logo */}
          <Link 
            href="/" 
            className="text-xl tracking-[0.25em] font-medium text-[#111111] hover:text-[#333333] transition-colors"
          >
            SOCIÉTÉ DU VIDE
          </Link>

          {/* Kanan: Nav Links + Account */}
          <div className="flex items-center gap-10 text-xs tracking-widest font-medium">
            {navLinks.map((link) => {
              const isActive = pathname === link.href || (pathname.startsWith("/products") && link.href === "/collections");
              return (
                <Link 
                  key={link.name} 
                  href={link.href}
                  className="relative group py-2"
                >
                  <span className={`transition-colors duration-200 ease-in-out ${isActive ? "text-[#111111]" : "text-[#666666] group-hover:text-[#111111]"}`}>
                    {link.name}
                  </span>
                  <span className={`absolute left-0 bottom-0 w-full h-[1px] bg-[#111111] origin-left transition-transform duration-200 ease-in-out ${isActive ? "scale-x-100" : "scale-x-0 group-hover:scale-x-100"}`} />
                </Link>
              );
            })}
            
            {/* Account icon */}
            <Link
              href={isLoggedIn ? "/account" : "/login"}
              className="relative group py-2 flex items-center"
              aria-label={isLoggedIn ? "Account" : "Sign In"}
            >
              <User className={`w-4 h-4 transition-colors duration-200 ${pathname === "/account" ? "text-[#111111]" : "text-[#666666] group-hover:text-[#111111]"}`} strokeWidth={1.5} />
            </Link>
          </div>
        </div>

        {/* MOBILE LAYOUT (Hidden on Desktop) */}
        <div className="flex md:hidden flex-1 items-center justify-between w-full">
          {/* Kiri: Hamburger */}
          <button 
            onClick={() => setIsMobileMenuOpen(true)}
            className="p-2 -ml-2 text-[#000000] hover:text-[#333333] focus:outline-none"
            aria-label="Open Mobile Menu"
          >
            <Menu className="w-6 h-6" strokeWidth={1.5} />
          </button>

          {/* Tengah: Logo */}
          <Link 
            href="/" 
            className="text-base tracking-[0.25em] font-medium text-[#000000] flex-1 text-center"
          >
            SOCIÉTÉ DU VIDE
          </Link>

          {/* Kanan: Cart Icon */}
          <Link 
            href="/cart" 
            className="p-2 -mr-2 text-[#000000] hover:text-[#333333] relative flex items-center"
            aria-label="Cart"
          >
            <ShoppingBag className="w-5 h-5" strokeWidth={1.5} />
            {cartTotal > 0 && (
              <span className="absolute top-1.5 right-1 bg-[#000000] text-white text-[8px] font-bold px-1 py-[1px] rounded-full min-w-[14px] text-center">
                {cartTotal}
              </span>
            )}
          </Link>
        </div>
      </motion.nav>

      {/* MOBILE SLIDE MENU */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <>
            {/* Backdrop overlay */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.25, ease: "easeInOut" }}
              className="fixed inset-0 bg-black/30 z-[1005] md:hidden"
              onClick={() => setIsMobileMenuOpen(false)}
            />

            {/* Slide Panel from Right */}
            <motion.div 
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ duration: 0.25, ease: "easeInOut" }}
              className="fixed top-0 right-0 bottom-0 w-[80%] max-w-[320px] bg-[#fafafa] z-[1010] shadow-2xl flex flex-col md:hidden"
            >
              {/* Menu Header */}
              <div className="h-[72px] px-6 flex items-center justify-between border-b border-[#e8e8e8]">
                <span className="text-xs tracking-[0.2em] font-medium text-[#111111]">MENU</span>
                <button 
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="p-2 -mr-2 text-[#000000] hover:bg-gray-100 rounded-full transition-colors"
                  aria-label="Close Mobile Menu"
                >
                  <X className="w-6 h-6" strokeWidth={1.5} />
                </button>
              </div>

              {/* Menu Links */}
              <div className="flex-1 overflow-y-auto py-10 px-8 flex flex-col gap-8">
                {navLinks.map((link) => {
                  const isActive = pathname === link.href || (pathname.startsWith("/products") && link.href === "/collections");
                  return (
                    <Link 
                      key={link.name} 
                      href={link.href}
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="text-xl tracking-[0.15em] font-light uppercase group w-fit"
                    >
                      <span className={`transition-colors duration-200 ${isActive ? "text-[#111111] font-medium" : "text-[#666666] group-hover:text-[#111111]"}`}>
                        {link.name}
                      </span>
                      {isActive && <div className="mt-2 w-1/2 h-[2px] bg-[#111111]" />}
                    </Link>
                  );
                })}

                {/* Divider */}
                <div className="w-full h-[1px] bg-[#e8e8e8]" />

                {/* Account / Sign In */}
                <Link
                  href={isLoggedIn ? "/account" : "/login"}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="text-xl tracking-[0.15em] font-light uppercase group w-fit"
                >
                  <span className={`transition-colors duration-200 ${
                    pathname === "/account" ? "text-[#111111] font-medium" : "text-[#666666] group-hover:text-[#111111]"
                  }`}>
                    {isLoggedIn ? "ACCOUNT" : "SIGN IN"}
                  </span>
                </Link>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}

"use client";

import Link from "next/link";
import { ReactNode, useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";

export default function AdminLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const isLoginPage = pathname === "/admin/login";

  // Close mobile menu when route changes
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [pathname]);

  if (isLoginPage) {
    return <>{children}</>;
  }

  return (
    <div className="min-h-screen bg-[#fafafa] text-[#111111] flex">
      <aside className="w-64 border-r border-[#e8e8e8] bg-[#ffffff] p-8 hidden md:flex flex-col">
        <Link href="/" className="mb-12">
          <h2 className="text-sm tracking-[0.2em] font-medium text-[#111111]">SDV // ADMIN</h2>
        </Link>
        <nav className="flex flex-col gap-6 text-xs tracking-widest uppercase text-[#666666]">
          <Link href="/admin" className="hover:text-[#111111] transition-colors">Dashboard</Link>
          <Link href="/admin/orders" className="hover:text-[#111111] transition-colors">Orders</Link>
          <Link href="/admin/products" className="hover:text-[#111111] transition-colors">Products</Link>
          <Link href="/admin/collections" className="hover:text-[#111111] transition-colors">Collections</Link>
          <Link href="/admin/home" className="hover:text-[#111111] transition-colors">Home Settings</Link>
          <Link href="/admin/manifesto" className="hover:text-[#111111] transition-colors">Manifesto Settings</Link>
          <Link href="/api/auth/signout" className="hover:text-[#111111] transition-colors mt-auto pt-12">Sign Out</Link>
        </nav>
      </aside>

      <main className="flex-1 overflow-y-auto bg-[#fafafa]">
        {/* Mobile Header with Hamburger */}
        <div className="md:hidden p-4 border-b border-[#e8e8e8] bg-[#ffffff] text-xs tracking-widest flex justify-between items-center font-medium sticky top-0 z-[1000]">
          <button 
            onClick={() => setIsMobileMenuOpen(true)}
            className="p-2 -ml-2 text-[#111111]"
          >
            <div className="w-5 h-px bg-[#111111] mb-1.5 transition-all"></div>
            <div className="w-5 h-px bg-[#111111] transition-all"></div>
          </button>
          <span>SDV // ADMIN</span>
          <Link href="/api/auth/signout" className="hover:text-[#666666] transition-colors">LOGOUT</Link>
        </div>

        {/* Mobile Sidebar Overlay & Drawer */}
        <AnimatePresence>
          {isMobileMenuOpen && (
            <>
              {/* Backdrop */}
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.25, ease: "easeInOut" }}
                className="fixed inset-0 bg-black/30 z-[1005] md:hidden"
                onClick={() => setIsMobileMenuOpen(false)}
              />

              {/* Sliding Drawer */}
              <motion.div 
                initial={{ x: "-100%" }}
                animate={{ x: 0 }}
                exit={{ x: "-100%" }}
                transition={{ duration: 0.25, ease: "easeInOut" }}
                className="fixed top-0 left-0 bottom-0 w-[80%] max-w-[320px] bg-[#ffffff] z-[1010] shadow-2xl flex flex-col md:hidden border-r border-[#e8e8e8]"
              >
                <div className="p-6 border-b border-[#e8e8e8] flex justify-between items-center">
                  <h2 className="text-sm tracking-[0.2em] font-medium text-[#111111]">MENU</h2>
                  <button 
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="p-2 -mr-2 text-[#111111]"
                  >
                    X
                  </button>
                </div>
                
                <nav className="flex flex-col gap-6 p-6 text-sm tracking-widest uppercase text-[#666666]">
                  <Link href="/admin" onClick={() => setIsMobileMenuOpen(false)} className={`transition-colors ${pathname === "/admin" ? "text-[#111111] font-medium" : "hover:text-[#111111]"}`}>Dashboard</Link>
                  <Link href="/admin/orders" onClick={() => setIsMobileMenuOpen(false)} className={`transition-colors ${pathname.includes("/admin/orders") ? "text-[#111111] font-medium" : "hover:text-[#111111]"}`}>Orders</Link>
                  <Link href="/admin/products" onClick={() => setIsMobileMenuOpen(false)} className={`transition-colors ${pathname === "/admin/products" ? "text-[#111111] font-medium" : "hover:text-[#111111]"}`}>Products</Link>
                  <Link href="/admin/collections" onClick={() => setIsMobileMenuOpen(false)} className={`transition-colors ${pathname === "/admin/collections" ? "text-[#111111] font-medium" : "hover:text-[#111111]"}`}>Collections</Link>
                  <Link href="/admin/home" onClick={() => setIsMobileMenuOpen(false)} className={`transition-colors ${pathname === "/admin/home" ? "text-[#111111] font-medium" : "hover:text-[#111111]"}`}>Home Settings</Link>
                  <Link href="/admin/manifesto" onClick={() => setIsMobileMenuOpen(false)} className={`transition-colors ${pathname === "/admin/manifesto" ? "text-[#111111] font-medium" : "hover:text-[#111111]"}`}>Manifesto Settings</Link>
                </nav>
              </motion.div>
            </>
          )}
        </AnimatePresence>

        <div className="p-4 md:p-12">
          {children}
        </div>
      </main>
    </div>
  );
}

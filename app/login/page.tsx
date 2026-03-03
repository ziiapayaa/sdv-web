"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";

import { Suspense } from "react";

function LoginFormContext() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "/";
  
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      if (res?.error) {
        setError("Email atau password salah.");
        setLoading(false);
      } else if (res?.ok) {
        router.push(callbackUrl);
        router.refresh();
      }
    } catch {
      setError("Terjadi kesalahan. Coba lagi.");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#fafafa] px-6 py-20">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        <div className="text-center mb-12">
          <h1 className="text-2xl font-light tracking-[0.2em] uppercase text-[#111111]">
            Sign In
          </h1>
          <div className="w-10 h-[1px] bg-[#111111] mx-auto mt-4" />
          <p className="text-xs tracking-wider text-[#666666] mt-4 uppercase">
            Access your account
          </p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-6">
          {error && (
            <p className="text-red-500 text-xs tracking-widest uppercase text-center bg-red-50 p-3">
              {error}
            </p>
          )}

          <div className="flex flex-col gap-2">
            <label className="text-[10px] tracking-widest text-[#666666] uppercase">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={loading}
              className="bg-transparent border-b border-[#e8e8e8] py-3 text-sm tracking-wider focus:outline-none focus:border-[#111111] transition-colors text-[#111111] disabled:opacity-50"
              placeholder="your@email.com"
            />
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-[10px] tracking-widest text-[#666666] uppercase">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              disabled={loading}
              className="bg-transparent border-b border-[#e8e8e8] py-3 text-sm tracking-wider focus:outline-none focus:border-[#111111] transition-colors text-[#111111] disabled:opacity-50"
              placeholder="Enter your password"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="mt-4 w-full h-14 bg-[#111111] text-white text-xs tracking-[0.2em] uppercase hover:bg-[#333333] transition-colors disabled:opacity-50"
          >
            {loading ? "Signing In..." : "Sign In"}
          </button>

          <div className="flex flex-col gap-3 items-center">
            <Link href="/forgot-password" className="text-xs tracking-wider text-[#999999] hover:text-[#111111] transition-colors">
              Forgot Password?
            </Link>
            <p className="text-xs tracking-wider text-[#666666]">
              Don&apos;t have an account?{" "}
              <Link href="/register" className="text-[#111111] underline underline-offset-4 hover:text-[#333333]">
                Create Account
              </Link>
            </p>
          </div>
        </form>
      </motion.div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <>
      <Navbar />
      <Suspense fallback={
        <div className="min-h-screen flex items-center justify-center bg-[#fafafa] px-6 py-20">
          <div className="w-8 h-8 border-2 border-black border-t-transparent rounded-full animate-spin" />
        </div>
      }>
        <LoginFormContext />
      </Suspense>
      <Footer />
    </>
  );
}

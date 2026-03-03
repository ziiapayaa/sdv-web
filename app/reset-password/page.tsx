"use client";

import { useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";

function ResetPasswordForm() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get("token") || "";
  const email = searchParams.get("email") || "";

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, email, password, confirmPassword }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error);
        setLoading(false);
        return;
      }

      setSuccess(true);
      setTimeout(() => router.push("/login"), 3000);
    } catch {
      setError("Terjadi kesalahan. Coba lagi.");
      setLoading(false);
    }
  };

  if (!token || !email) {
    return (
      <div className="text-center">
        <p className="text-sm tracking-wider text-red-500 mb-6">
          Link reset tidak valid. Silakan minta reset ulang.
        </p>
        <Link
          href="/forgot-password"
          className="text-xs tracking-[0.15em] uppercase text-[#111111] underline underline-offset-4"
        >
          Request New Link
        </Link>
      </div>
    );
  }

  return (
    <>
      <div className="text-center mb-12">
        <h1 className="text-2xl font-light tracking-[0.2em] uppercase text-[#111111]">
          New Password
        </h1>
        <div className="w-10 h-[1px] bg-[#111111] mx-auto mt-4" />
        <p className="text-xs tracking-wider text-[#666666] mt-4 uppercase">
          Enter your new password
        </p>
      </div>

      {success ? (
        <div className="text-center">
          <div className="bg-green-50 border border-green-200 p-6 mb-6">
            <p className="text-sm tracking-wider text-green-700">
              Password berhasil direset! Redirecting ke login...
            </p>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="flex flex-col gap-6">
          {error && (
            <p className="text-red-500 text-xs tracking-widest uppercase text-center bg-red-50 p-3">
              {error}
            </p>
          )}

          <div className="flex flex-col gap-2">
            <label className="text-[10px] tracking-widest text-[#666666] uppercase">New Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={8}
              disabled={loading}
              className="bg-transparent border-b border-[#e8e8e8] py-3 text-sm tracking-wider focus:outline-none focus:border-[#111111] transition-colors text-[#111111] disabled:opacity-50"
              placeholder="Minimum 8 characters"
            />
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-[10px] tracking-widest text-[#666666] uppercase">Confirm Password</label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              minLength={8}
              disabled={loading}
              className="bg-transparent border-b border-[#e8e8e8] py-3 text-sm tracking-wider focus:outline-none focus:border-[#111111] transition-colors text-[#111111] disabled:opacity-50"
              placeholder="Re-enter your password"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="mt-4 w-full h-14 bg-[#111111] text-white text-xs tracking-[0.2em] uppercase hover:bg-[#333333] transition-colors disabled:opacity-50"
          >
            {loading ? "Resetting..." : "Reset Password"}
          </button>
        </form>
      )}
    </>
  );
}

export default function ResetPasswordPage() {
  return (
    <>
      <Navbar />
      <div className="min-h-screen flex items-center justify-center bg-[#fafafa] px-6 py-20">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md"
        >
          <Suspense fallback={<div className="text-center text-xs text-[#999]">Loading...</div>}>
            <ResetPasswordForm />
          </Suspense>
        </motion.div>
      </div>
      <Footer />
    </>
  );
}

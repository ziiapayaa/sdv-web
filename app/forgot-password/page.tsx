"use client";

import { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error);
        setLoading(false);
        return;
      }

      setSent(true);
    } catch {
      setError("Terjadi kesalahan. Coba lagi.");
      setLoading(false);
    }
  };

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
          <div className="text-center mb-12">
            <h1 className="text-2xl font-light tracking-[0.2em] uppercase text-[#111111]">
              Reset Password
            </h1>
            <div className="w-10 h-[1px] bg-[#111111] mx-auto mt-4" />
            <p className="text-xs tracking-wider text-[#666666] mt-4 uppercase">
              Enter your email to receive a reset link
            </p>
          </div>

          {sent ? (
            <div className="text-center">
              <div className="bg-green-50 border border-green-200 p-6 mb-6">
                <p className="text-sm tracking-wider text-green-700">
                  Jika email terdaftar, link reset password telah dikirim ke <strong>{email}</strong>.
                </p>
                <p className="text-xs tracking-wider text-green-600 mt-3">
                  Cek inbox dan folder spam. Link berlaku 1 jam.
                </p>
              </div>
              <Link
                href="/login"
                className="text-xs tracking-[0.15em] uppercase text-[#111111] underline underline-offset-4"
              >
                Back to Sign In
              </Link>
            </div>
          ) : (
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

              <button
                type="submit"
                disabled={loading}
                className="mt-4 w-full h-14 bg-[#111111] text-white text-xs tracking-[0.2em] uppercase hover:bg-[#333333] transition-colors disabled:opacity-50"
              >
                {loading ? "Sending..." : "Send Reset Link"}
              </button>

              <p className="text-center text-xs tracking-wider text-[#666666]">
                Remember your password?{" "}
                <Link href="/login" className="text-[#111111] underline underline-offset-4 hover:text-[#333333]">
                  Sign In
                </Link>
              </p>
            </form>
          )}
        </motion.div>
      </div>
      <Footer />
    </>
  );
}

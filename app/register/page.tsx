"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";

export default function RegisterPage() {
  const router = useRouter();
  const [form, setForm] = useState({ name: "", email: "", password: "", confirmPassword: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error);
        setLoading(false);
        return;
      }

      // Auto login after register
      const loginRes = await signIn("credentials", {
        email: form.email,
        password: form.password,
        redirect: false,
      });

      if (loginRes?.ok) {
        router.push("/");
        router.refresh();
      } else {
        // Register succeeded but login failed — redirect to login
        router.push("/login");
      }
    } catch {
      setError("Something went wrong. Please try again.");
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
              Create Account
            </h1>
            <div className="w-10 h-[1px] bg-[#111111] mx-auto mt-4" />
            <p className="text-xs tracking-wider text-[#666666] mt-4 uppercase">
              Join to access exclusive drops
            </p>
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col gap-6">
            {error && (
              <p className="text-red-500 text-xs tracking-widest uppercase text-center bg-red-50 p-3">
                {error}
              </p>
            )}

            <div className="flex flex-col gap-2">
              <label className="text-[10px] tracking-widest text-[#666666] uppercase">Full Name</label>
              <input
                type="text"
                name="name"
                value={form.name}
                onChange={handleChange}
                required
                disabled={loading}
                className="bg-transparent border-b border-[#e8e8e8] py-3 text-sm tracking-wider focus:outline-none focus:border-[#111111] transition-colors text-[#111111] disabled:opacity-50"
                placeholder="Your full name"
              />
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-[10px] tracking-widest text-[#666666] uppercase">Email</label>
              <input
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
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
                name="password"
                value={form.password}
                onChange={handleChange}
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
                name="confirmPassword"
                value={form.confirmPassword}
                onChange={handleChange}
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
              {loading ? "Creating Account..." : "Create Account"}
            </button>

            <p className="text-center text-xs tracking-wider text-[#666666]">
              Already have an account?{" "}
              <Link href="/login" className="text-[#111111] underline underline-offset-4 hover:text-[#333333]">
                Sign In
              </Link>
            </p>
          </form>
        </motion.div>
      </div>
      <Footer />
    </>
  );
}

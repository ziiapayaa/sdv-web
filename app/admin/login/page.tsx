"use client";

import { signIn } from "next-auth/react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";

export default function AdminLogin() {
  const router = useRouter();
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
        redirect: false,  // Handle redirect manually so we can show errors
      });

      if (res?.error) {
        setError("Invalid credentials. The void rejects you.");
        setLoading(false);
      } else if (res?.ok) {
        router.push("/admin");
        router.refresh();
      }
    } catch {
      setError("Something went wrong. Try again.");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#fafafa] p-6 text-[#111111]">
      <div className="w-full max-w-sm text-center bg-[#ffffff] p-8 border border-[#e8e8e8] shadow-sm">
        <h1 className="text-xl tracking-[0.3em] font-medium mb-12 uppercase text-[#111111]">Société du Vide<br/>Admin</h1>
        
        <form onSubmit={handleSubmit} className="flex flex-col gap-6 text-left">
          {error && <p className="text-red-500 text-xs tracking-widest uppercase text-center">{error}</p>}
          
          <div className="flex flex-col gap-2">
            <label className="text-[10px] tracking-widest text-[#666666] uppercase">Email</label>
            <input 
              type="email" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={loading}
              className="bg-transparent border-b border-[#e8e8e8] py-2 text-sm tracking-wider focus:outline-none focus:border-[#111111] transition-colors text-[#111111] disabled:opacity-50"
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
              className="bg-transparent border-b border-[#e8e8e8] py-2 text-sm tracking-wider focus:outline-none focus:border-[#111111] transition-colors text-[#111111] disabled:opacity-50"
            />
          </div>

          <Button 
            type="submit" 
            disabled={loading}
            className="mt-8 bg-[#111111] hover:bg-[#333333] text-white disabled:opacity-50"
          >
            {loading ? "Authenticating..." : "Enter"}
          </Button>

          <a href="/forgot-password" className="block text-center text-xs tracking-wider text-[#999999] hover:text-[#111111] transition-colors mt-4">
            Forgot Password?
          </a>
        </form>
      </div>
    </div>
  );
}


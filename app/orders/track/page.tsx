"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Search, Loader2, Package, Clock, CheckCircle, XCircle, Truck } from "lucide-react";

type OrderResult = {
  id: string;
  name: string;
  email: string;
  lifecycle: string;
  paymentStatus: string;
  totalAmount: number;
  trackingNumber?: string;
  createdAt: string;
  product?: { title: string };
};

const lifecycleIcons: Record<string, React.ReactNode> = {
  RESERVED: <Clock className="w-6 h-6 text-[#666666]" />,
  PAID: <CheckCircle className="w-6 h-6 text-green-600" />,
  SHIPPED: <Truck className="w-6 h-6 text-blue-600" />,
  COMPLETED: <CheckCircle className="w-6 h-6 text-green-800" />,
  EXPIRED: <XCircle className="w-6 h-6 text-[#999999]" />,
  FAILED: <XCircle className="w-6 h-6 text-red-600" />,
};

const lifecycleLabels: Record<string, string> = {
  RESERVED: "Waiting for Payment",
  PAID: "Payment Confirmed",
  SHIPPED: "Shipped",
  COMPLETED: "Delivered",
  EXPIRED: "Expired",
  FAILED: "Payment Failed",
};

export default function TrackOrderPage() {
  const [email, setEmail] = useState("");
  const [orderId, setOrderId] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<OrderResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleTrack = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !orderId) return;

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const res = await fetch(`/api/order/${orderId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email })
      });

      if (!res.ok) {
        throw new Error("Order not found. Please check your email and order ID.");
      }

      const data = await res.json();
      setResult(data);
    } catch (err: unknown) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Navbar />
      <main className="min-h-screen pt-28 pb-12 flex flex-col items-center bg-[#ffffff] text-[#000000]">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="w-full max-w-[600px] px-6"
        >
          <header className="mb-12 text-center">
            <h1 className="text-2xl md:text-3xl font-light tracking-[0.2em] uppercase">Track Order</h1>
            <div className="w-12 h-[1px] bg-black mt-4 mx-auto"></div>
            <p className="text-xs tracking-widest text-[#666666] mt-6 uppercase">
              Enter your email and order ID to check your order status
            </p>
          </header>

          <form onSubmit={handleTrack} className="space-y-6 mb-12">
            <div className="space-y-2">
              <label className="text-[10px] tracking-widest uppercase text-[#666666]">Email Address *</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full border-b border-[#eaeaea] pb-2 text-sm focus:outline-none focus:border-black transition-colors bg-transparent"
                placeholder="Enter the email used during checkout"
              />
            </div>

            <div className="space-y-2">
              <label className="text-[10px] tracking-widest uppercase text-[#666666]">Order ID *</label>
              <input
                type="text"
                value={orderId}
                onChange={(e) => setOrderId(e.target.value)}
                required
                className="w-full border-b border-[#eaeaea] pb-2 text-sm focus:outline-none focus:border-black transition-colors bg-transparent font-mono"
                placeholder="e.g. cm8abc123..."
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full h-14 bg-[#000000] text-white flex items-center justify-center gap-3 text-xs tracking-[0.2em] uppercase hover:bg-[#333333] transition-colors disabled:opacity-50"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
              {loading ? "Searching..." : "Track Order"}
            </button>
          </form>

          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="p-6 border border-red-200 bg-red-50 text-center mb-8"
              >
                <p className="text-xs tracking-widest text-red-800 uppercase">{error}</p>
              </motion.div>
            )}

            {result && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="bg-[#fcfcfc] border border-[#eaeaea] p-8 space-y-6"
              >
                <div className="flex items-center gap-4 border-b border-[#eaeaea] pb-6">
                  {lifecycleIcons[result.lifecycle] || <Package className="w-6 h-6" />}
                  <div>
                    <p className="text-sm font-medium tracking-widest uppercase">
                      {lifecycleLabels[result.lifecycle] || result.lifecycle}
                    </p>
                    <p className="text-[10px] text-[#666666] tracking-wider mt-1">
                      Order #{result.id.substring(0, 8).toUpperCase()}
                    </p>
                  </div>
                </div>

                {result.product && (
                  <div className="flex justify-between text-sm tracking-wider">
                    <span className="text-[#666666]">Product</span>
                    <span className="font-medium">{result.product.title}</span>
                  </div>
                )}

                <div className="flex justify-between text-sm tracking-wider">
                  <span className="text-[#666666]">Total</span>
                  <span className="font-medium">
                    {new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(result.totalAmount)}
                  </span>
                </div>

                <div className="flex justify-between text-sm tracking-wider">
                  <span className="text-[#666666]">Date</span>
                  <span className="font-medium">
                    {new Date(result.createdAt).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })}
                  </span>
                </div>

                {result.trackingNumber && (
                  <div className="flex justify-between text-sm tracking-wider pt-4 border-t border-[#eaeaea]">
                    <span className="text-[#666666]">Tracking</span>
                    <span className="font-medium font-mono text-blue-600">{result.trackingNumber}</span>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </main>
      <Footer />
    </>
  );
}

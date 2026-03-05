"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Search, Loader2, Package, Clock, CheckCircle, XCircle, Truck, ShoppingBag, CreditCard, Box } from "lucide-react";

type OrderResult = {
  id: string;
  name: string;
  email: string;
  lifecycle: string;
  paymentStatus: string;
  totalAmount: number;
  currency: string;
  trackingNumber?: string;
  createdAt: string;
  size?: string;
  quantity?: number;
  product?: { title: string; images?: { url: string }[] } | null;
};

// Timeline steps in order
const TIMELINE_STEPS = [
  { key: "RESERVED", label: "Order Placed", icon: ShoppingBag },
  { key: "PAID", label: "Payment Confirmed", icon: CreditCard },
  { key: "SHIPPED", label: "Shipped", icon: Truck },
  { key: "COMPLETED", label: "Delivered", icon: Box },
];

function getStepIndex(lifecycle: string): number {
  const idx = TIMELINE_STEPS.findIndex(s => s.key === lifecycle);
  return idx >= 0 ? idx : -1;
}

const lifecycleMessages: Record<string, string> = {
  RESERVED: "Your order has been placed. Please complete your payment to proceed.",
  PAID: "Payment confirmed! Your order is being prepared for shipping.",
  SHIPPED: "Your order is on the way! Check the tracking number below.",
  COMPLETED: "Your order has been delivered. Thank you for shopping with us!",
  EXPIRED: "This order has expired. The payment window has closed.",
  FAILED: "Payment failed. Please try again or contact support.",
  REFUNDED: "This order has been refunded to your original payment method.",
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

  const isFailed = result?.lifecycle === "FAILED" || result?.lifecycle === "EXPIRED" || result?.lifecycle === "REFUNDED";
  const currentStepIdx = result ? getStepIndex(result.lifecycle) : -1;

  return (
    <>
      <Navbar />
      <main className="min-h-screen pt-28 pb-12 flex flex-col items-center bg-[#ffffff] text-[#000000]">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="w-full max-w-[640px] px-6"
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
                placeholder="e.g. CMWDR56B"
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
                className="space-y-6"
              >
                {/* Order Header */}
                <div className="bg-[#fcfcfc] border border-[#eaeaea] p-6 md:p-8">
                  <div className="flex items-center gap-3 mb-1">
                    {isFailed ? (
                      <XCircle className={`w-5 h-5 flex-shrink-0 ${result.lifecycle === "REFUNDED" ? "text-purple-600" : result.lifecycle === "EXPIRED" ? "text-[#999999]" : "text-red-600"}`} />
                    ) : (
                      <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
                    )}
                    <h2 className="text-sm font-medium tracking-widest uppercase">
                      {result.lifecycle === "RESERVED" ? "Waiting for Payment"
                        : result.lifecycle === "PAID" ? "Payment Confirmed"
                        : result.lifecycle === "SHIPPED" ? "Order Shipped"
                        : result.lifecycle === "COMPLETED" ? "Order Delivered"
                        : result.lifecycle === "EXPIRED" ? "Order Expired"
                        : result.lifecycle === "REFUNDED" ? "Order Refunded"
                        : "Payment Failed"}
                    </h2>
                  </div>
                  <p className="text-xs text-[#888888] tracking-wider ml-8">
                    Order #{result.id.substring(0, 8).toUpperCase()}
                  </p>
                  <p className="text-xs text-[#666666] mt-3 leading-relaxed ml-8">
                    {lifecycleMessages[result.lifecycle] || ""}
                  </p>
                </div>

                {/* Progress Timeline */}
                {!isFailed && (
                  <div className="bg-[#fcfcfc] border border-[#eaeaea] p-6 md:p-8">
                    <h3 className="text-[10px] tracking-[0.2em] uppercase text-[#666666] mb-6">Order Progress</h3>
                    
                    {/* Desktop Timeline */}
                    <div className="hidden sm:flex items-center justify-between w-full">
                      {TIMELINE_STEPS.map((step, idx) => {
                        const StepIcon = step.icon;
                        const isActive = idx <= currentStepIdx;
                        const isCurrent = idx === currentStepIdx;
                        const isLast = idx === TIMELINE_STEPS.length - 1;
                        
                        return (
                          <React.Fragment key={step.key}>
                            {/* Step Circle & Label */}
                            <div className="flex flex-col items-center relative z-10 w-24">
                              <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-all duration-500 ${
                                isCurrent ? 'bg-[#111111] text-white ring-4 ring-[#111111]/10' 
                                : isActive ? 'bg-[#111111] text-white' 
                                : 'bg-[#e8e8e8] text-[#999999]'
                              }`}>
                                <StepIcon className="w-3.5 h-3.5" />
                              </div>
                              <span className={`text-[9px] tracking-widest uppercase mt-3 text-center leading-tight absolute top-8 w-24 ${
                                isActive ? 'text-[#111111] font-medium' : 'text-[#aaa]'
                              }`}>
                                {step.label}
                              </span>
                            </div>

                            {/* Connecting Line (drawn between circles) */}
                            {!isLast && (
                              <div className="flex-1 h-[2px] mx-2 relative bg-[#e8e8e8]">
                                <div 
                                  className="absolute top-0 left-0 h-full bg-[#111111] transition-all duration-700"
                                  style={{ width: currentStepIdx > idx ? '100%' : '0%' }}
                                />
                              </div>
                            )}
                          </React.Fragment>
                        );
                      })}
                    </div>
                    {/* Add spacer since absolute text was used */}
                    <div className="hidden sm:block h-10 w-full" />

                    {/* Mobile Timeline (Vertical) */}
                    <div className="sm:hidden flex flex-col gap-0">
                      {TIMELINE_STEPS.map((step, idx) => {
                        const StepIcon = step.icon;
                        const isActive = idx <= currentStepIdx;
                        const isCurrent = idx === currentStepIdx;
                        const isLast = idx === TIMELINE_STEPS.length - 1;
                        return (
                          <div key={step.key} className="flex items-start gap-4">
                            <div className="flex flex-col items-center">
                              <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 transition-all ${
                                isCurrent ? 'bg-[#111111] text-white ring-4 ring-[#111111]/10'
                                : isActive ? 'bg-[#111111] text-white'
                                : 'bg-[#e8e8e8] text-[#999999]'
                              }`}>
                                <StepIcon className="w-3.5 h-3.5" />
                              </div>
                              {!isLast && (
                                <div className={`w-[2px] h-8 ${isActive && idx < currentStepIdx ? 'bg-[#111111]' : 'bg-[#e8e8e8]'}`} />
                              )}
                            </div>
                            <div className="pt-1.5 pb-4">
                              <span className={`text-xs tracking-widest uppercase ${
                                isActive ? 'text-[#111111] font-medium' : 'text-[#aaa]'
                              }`}>
                                {step.label}
                              </span>
                              {isCurrent && (
                                <span className="block text-[10px] text-[#888] mt-0.5 normal-case tracking-normal">Current status</span>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Order Details */}
                <div className="bg-[#fcfcfc] border border-[#eaeaea] p-6 md:p-8 space-y-4">
                  <h3 className="text-[10px] tracking-[0.2em] uppercase text-[#666666] border-b border-[#eaeaea] pb-4">Order Details</h3>

                  <div className="flex justify-between text-sm tracking-wider">
                    <span className="text-[#666666]">Customer</span>
                    <span className="font-medium">{result.name}</span>
                  </div>

                  {result.product && (
                    <div className="flex justify-between text-sm tracking-wider">
                      <span className="text-[#666666]">Product</span>
                      <span className="font-medium">{result.product.title}</span>
                    </div>
                  )}

                  {result.size && (
                    <div className="flex justify-between text-sm tracking-wider">
                      <span className="text-[#666666]">Size</span>
                      <span className="font-medium">{result.size}</span>
                    </div>
                  )}

                  {result.quantity && (
                    <div className="flex justify-between text-sm tracking-wider">
                      <span className="text-[#666666]">Quantity</span>
                      <span className="font-medium">{result.quantity}</span>
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

                  <div className="flex justify-between text-sm tracking-wider">
                    <span className="text-[#666666]">Payment</span>
                    <span className={`text-[10px] tracking-wider uppercase px-2 py-0.5 border ${
                      result.paymentStatus === "PAID" ? "bg-green-50 text-green-800 border-green-200"
                      : result.paymentStatus === "UNPAID" ? "bg-yellow-50 text-yellow-800 border-yellow-200"
                      : result.paymentStatus === "REFUNDED" ? "bg-purple-50 text-purple-800 border-purple-200"
                      : "bg-red-50 text-red-800 border-red-200"
                    }`}>
                      {result.paymentStatus}
                    </span>
                  </div>
                </div>

                {/* Tracking Number */}
                {result.trackingNumber && (
                  <div className="bg-[#fcfcfc] border border-[#eaeaea] p-6 md:p-8">
                    <h3 className="text-[10px] tracking-[0.2em] uppercase text-[#666666] mb-4">Shipping Tracking</h3>
                    <div className="flex items-center gap-3">
                      <Truck className="w-5 h-5 text-[#111111]" />
                      <span className="font-mono text-sm font-medium tracking-wider text-blue-600">
                        {result.trackingNumber}
                      </span>
                    </div>
                    <p className="text-[10px] text-[#999999] mt-2 tracking-wider">
                      Use this tracking number to check your shipment status with the courier.
                    </p>
                  </div>
                )}

                {/* Failed/Expired Status Card */}
                {isFailed && (
                  <div className={`border p-6 md:p-8 ${
                    result.lifecycle === "REFUNDED" ? "border-purple-200 bg-purple-50"
                    : result.lifecycle === "EXPIRED" ? "border-gray-200 bg-gray-50"
                    : "border-red-200 bg-red-50"
                  }`}>
                    <div className="flex items-center gap-3">
                      <XCircle className={`w-5 h-5 ${
                        result.lifecycle === "REFUNDED" ? "text-purple-600"
                        : result.lifecycle === "EXPIRED" ? "text-gray-500"
                        : "text-red-600"
                      }`} />
                      <p className={`text-xs tracking-widest uppercase font-medium ${
                        result.lifecycle === "REFUNDED" ? "text-purple-800"
                        : result.lifecycle === "EXPIRED" ? "text-gray-700"
                        : "text-red-800"
                      }`}>
                        {result.lifecycle === "REFUNDED" ? "Refund Processed" 
                        : result.lifecycle === "EXPIRED" ? "Order Expired"
                        : "Payment Failed"}
                      </p>
                    </div>
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

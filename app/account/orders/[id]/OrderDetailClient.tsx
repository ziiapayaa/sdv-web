"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { ArrowLeft, Package, CreditCard, Truck, MapPin, Copy, Check } from "lucide-react";
import { useState } from "react";

interface OrderDetailProps {
  order: {
    id: string;
    email: string;
    name: string;
    phone: string;
    address: string;
    quantity: number;
    size: string | null;
    subtotalAmount: number;
    discountAmount: number;
    shippingAmount: number;
    totalAmount: number;
    lifecycle: string;
    paymentStatus: string;
    trackingNumber: string | null;
    createdAt: Date;
    product: {
      title: string;
      slug: string;
      price: number;
      images: { url: string; isPrimary: boolean }[];
    };
  };
}

function getLifecycleBadge(lifecycle: string) {
  const map: Record<string, { color: string; label: string }> = {
    RESERVED: { color: "bg-yellow-50 text-yellow-700 border-yellow-200", label: "Menunggu Pembayaran" },
    PAID: { color: "bg-green-50 text-green-700 border-green-200", label: "Dibayar" },
    SHIPPED: { color: "bg-blue-50 text-blue-700 border-blue-200", label: "Dikirim" },
    COMPLETED: { color: "bg-emerald-50 text-emerald-700 border-emerald-200", label: "Selesai" },
    FAILED: { color: "bg-red-50 text-red-700 border-red-200", label: "Gagal" },
    EXPIRED: { color: "bg-gray-50 text-gray-500 border-gray-200", label: "Expired" },
    REFUNDED: { color: "bg-purple-50 text-purple-700 border-purple-200", label: "Refund" },
  };
  return map[lifecycle] || { color: "bg-gray-50 text-gray-500 border-gray-200", label: lifecycle };
}

function getSteps(lifecycle: string) {
  const steps = [
    { key: "RESERVED", label: "Order Placed" },
    { key: "PAID", label: "Payment" },
    { key: "SHIPPED", label: "Shipped" },
    { key: "COMPLETED", label: "Completed" },
  ];
  const order = ["RESERVED", "PAID", "SHIPPED", "COMPLETED"];
  const currentIdx = order.indexOf(lifecycle);
  return steps.map((s, i) => ({ ...s, done: i <= currentIdx, active: i === currentIdx }));
}

export function OrderDetailClient({ order }: OrderDetailProps) {
  const [copied, setCopied] = useState(false);

  const formatPrice = (amount: number) =>
    new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(amount);

  const badge = getLifecycleBadge(order.lifecycle);
  const isFailed = ["FAILED", "EXPIRED", "REFUNDED"].includes(order.lifecycle);
  const steps = isFailed ? [] : getSteps(order.lifecycle);
  const primaryImage = order.product.images.find(img => img.isPrimary)?.url || order.product.images[0]?.url;

  const copyOrderId = () => {
    navigator.clipboard.writeText(order.id);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <>
      <Navbar />
      <main className="min-h-screen pt-28 pb-16 bg-[#fafafa]">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="max-w-[800px] mx-auto px-6"
        >
          {/* Back Link */}
          <Link
            href="/account"
            className="inline-flex items-center gap-2 text-xs tracking-[0.15em] uppercase text-[#666666] hover:text-[#111111] transition-colors mb-8"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Back to Account
          </Link>

          {/* Header */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
            <div>
              <h1 className="text-xl font-light tracking-[0.15em] uppercase text-[#111111]">
                Order Detail
              </h1>
              <div className="flex items-center gap-2 mt-2">
                <p className="text-xs tracking-wider text-[#999999] font-mono">
                  #{order.id.substring(0, 8).toUpperCase()}
                </p>
                <button onClick={copyOrderId} className="text-[#999999] hover:text-[#111111] transition-colors">
                  {copied ? <Check className="w-3 h-3 text-green-600" /> : <Copy className="w-3 h-3" />}
                </button>
              </div>
            </div>
            <span className={`text-[10px] tracking-widest uppercase px-3 py-1.5 border ${badge.color}`}>
              {badge.label}
            </span>
          </div>

          {/* Progress Steps (for active orders only) */}
          {steps.length > 0 && (
            <div className="bg-white border border-[#e8e8e8] p-6 mb-6">
              <div className="flex items-center justify-between relative">
                {/* Line behind */}
                <div className="absolute top-3 left-0 right-0 h-[1px] bg-[#e8e8e8]" />
                {steps.map((step, i) => (
                  <div key={step.key} className="flex flex-col items-center relative z-10">
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[8px] font-medium ${
                      step.done ? "bg-[#111111] text-white" : "bg-[#e8e8e8] text-[#999999]"
                    }`}>
                      {step.done ? "✓" : i + 1}
                    </div>
                    <span className={`text-[9px] tracking-widest uppercase mt-2 ${
                      step.active ? "text-[#111111] font-medium" : step.done ? "text-[#666666]" : "text-[#cccccc]"
                    }`}>
                      {step.label}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Product */}
          <div className="bg-white border border-[#e8e8e8] p-6 mb-6">
            <div className="flex items-center gap-2 mb-5">
              <Package className="w-4 h-4 text-[#666666]" strokeWidth={1.5} />
              <span className="text-[10px] tracking-[0.2em] uppercase font-medium text-[#666666]">Product</span>
            </div>
            <div className="flex gap-5">
              {primaryImage && (
                <div className="relative w-20 h-24 flex-shrink-0 bg-[#f0f0f0]">
                  <Image src={primaryImage} alt={order.product.title} fill className="object-cover" sizes="80px" />
                </div>
              )}
              <div className="flex-1 flex flex-col justify-center gap-1.5">
                <Link href={`/products/${order.product.slug}`} className="text-sm tracking-wider text-[#111111] font-medium hover:underline underline-offset-4">
                  {order.product.title}
                </Link>
                {order.size && (
                  <p className="text-xs tracking-wider text-[#666666]">Size: <span className="font-medium">{order.size}</span></p>
                )}
                <p className="text-xs tracking-wider text-[#666666]">Qty: {order.quantity}</p>
                <p className="text-xs tracking-wider text-[#666666]">{formatPrice(order.product.price)} per item</p>
              </div>
            </div>
          </div>

          {/* Payment Summary */}
          <div className="bg-white border border-[#e8e8e8] p-6 mb-6">
            <div className="flex items-center gap-2 mb-5">
              <CreditCard className="w-4 h-4 text-[#666666]" strokeWidth={1.5} />
              <span className="text-[10px] tracking-[0.2em] uppercase font-medium text-[#666666]">Payment</span>
            </div>
            <div className="flex flex-col gap-3">
              <div className="flex justify-between text-xs tracking-wider">
                <span className="text-[#666666]">Subtotal</span>
                <span className="text-[#111111]">{formatPrice(order.subtotalAmount)}</span>
              </div>
              {order.discountAmount > 0 && (
                <div className="flex justify-between text-xs tracking-wider">
                  <span className="text-[#666666]">Discount</span>
                  <span className="text-green-600">-{formatPrice(order.discountAmount)}</span>
                </div>
              )}
              <div className="flex justify-between text-xs tracking-wider">
                <span className="text-[#666666]">Shipping</span>
                <span className="text-[#111111]">{order.shippingAmount > 0 ? formatPrice(order.shippingAmount) : "Free"}</span>
              </div>
              <div className="border-t border-[#e8e8e8] pt-3 flex justify-between text-sm tracking-wider">
                <span className="text-[#111111] font-medium">Total</span>
                <span className="text-[#111111] font-medium">{formatPrice(order.totalAmount)}</span>
              </div>
            </div>
          </div>

          {/* Shipping & Tracking */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-6">
            <div className="bg-white border border-[#e8e8e8] p-6">
              <div className="flex items-center gap-2 mb-5">
                <MapPin className="w-4 h-4 text-[#666666]" strokeWidth={1.5} />
                <span className="text-[10px] tracking-[0.2em] uppercase font-medium text-[#666666]">Shipping To</span>
              </div>
              <div className="flex flex-col gap-1.5">
                <p className="text-sm tracking-wider text-[#111111]">{order.name}</p>
                <p className="text-xs tracking-wider text-[#666666]">{order.phone}</p>
                <p className="text-xs tracking-wider text-[#666666] leading-relaxed">{order.address}</p>
              </div>
            </div>
            <div className="bg-white border border-[#e8e8e8] p-6">
              <div className="flex items-center gap-2 mb-5">
                <Truck className="w-4 h-4 text-[#666666]" strokeWidth={1.5} />
                <span className="text-[10px] tracking-[0.2em] uppercase font-medium text-[#666666]">Tracking</span>
              </div>
              {order.trackingNumber ? (
                <div className="flex flex-col gap-1.5">
                  <p className="text-sm tracking-wider text-[#111111] font-mono">{order.trackingNumber}</p>
                  <p className="text-[10px] tracking-wider text-[#999999]">Check with your carrier for updates</p>
                </div>
              ) : (
                <p className="text-xs tracking-wider text-[#999999]">
                  {order.lifecycle === "PAID" ? "Tracking will be updated soon" : "Not available yet"}
                </p>
              )}
            </div>
          </div>

          {/* Order Date */}
          <p className="text-center text-[10px] tracking-widest text-[#cccccc] uppercase">
            Ordered on {new Date(order.createdAt).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit" })}
          </p>
        </motion.div>
      </main>
      <Footer />
    </>
  );
}

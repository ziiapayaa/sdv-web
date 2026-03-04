"use client";

import { signOut } from "next-auth/react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";

interface OrderWithProduct {
  id: string;
  lifecycle: string;
  totalAmount: number;
  quantity: number;
  createdAt: Date;
  trackingNumber: string | null;
  product: {
    title: string;
    slug: string;
    images: { url: string }[];
  } | null;
}

interface AccountClientProps {
  user: { name?: string | null; email?: string | null };
  orders: OrderWithProduct[];
}

function getLifecycleBadge(lifecycle: string) {
  const colors: Record<string, string> = {
    RESERVED: "bg-yellow-50 text-yellow-700 border-yellow-200",
    PAID: "bg-green-50 text-green-700 border-green-200",
    SHIPPED: "bg-blue-50 text-blue-700 border-blue-200",
    COMPLETED: "bg-emerald-50 text-emerald-700 border-emerald-200",
    FAILED: "bg-red-50 text-red-700 border-red-200",
    EXPIRED: "bg-gray-50 text-gray-500 border-gray-200",
    REFUNDED: "bg-purple-50 text-purple-700 border-purple-200",
  };
  return colors[lifecycle] || "bg-gray-50 text-gray-500 border-gray-200";
}

export function AccountClient({ user, orders }: AccountClientProps) {
  const formatPrice = (amount: number) =>
    new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(amount);

  return (
    <>
      <Navbar />
      <main className="min-h-screen pt-28 pb-16 bg-[#fafafa]">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="max-w-[900px] mx-auto px-6"
        >
          {/* Profile Header */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 mb-12">
            <div>
              <h1 className="text-2xl font-light tracking-[0.2em] uppercase text-[#111111]">
                My Account
              </h1>
              <div className="w-10 h-[1px] bg-[#111111] mt-3" />
              <p className="text-sm tracking-wider text-[#666666] mt-4">{user.name}</p>
              <p className="text-xs tracking-wider text-[#999999]">{user.email}</p>
            </div>
            <button
              onClick={() => signOut({ callbackUrl: "/" })}
              className="text-xs tracking-[0.15em] uppercase text-[#666666] hover:text-[#111111] border border-[#e8e8e8] px-6 py-3 transition-colors"
            >
              Sign Out
            </button>
          </div>

          {/* Orders */}
          <div>
            <h2 className="text-xs tracking-[0.2em] font-medium uppercase text-[#111111] mb-6 border-b border-[#e8e8e8] pb-4">
              Order History ({orders.length})
            </h2>

            {orders.length === 0 ? (
              <div className="text-center py-16">
                <p className="text-sm tracking-wider text-[#999999] mb-6">You haven&apos;t placed any orders yet.</p>
                <Link
                  href="/collections"
                  className="inline-block text-xs tracking-[0.15em] uppercase bg-[#111111] text-white px-8 py-3 hover:bg-[#333333] transition-colors"
                >
                  Browse Collections
                </Link>
              </div>
            ) : (
              <div className="flex flex-col gap-4">
                {orders.map((order) => (
                  <Link
                    key={order.id}
                    href={`/account/orders/${order.id}`}
                    className="bg-white border border-[#e8e8e8] p-6 flex flex-col sm:flex-row justify-between gap-4 hover:border-[#111111] transition-colors group"
                  >
                    <div className="flex-1 flex flex-col gap-2">
                      <div className="flex items-center gap-3">
                        <p className="text-sm tracking-wider text-[#111111] font-medium">
                          {order.product?.title || "[Deleted Product]"}
                        </p>
                        <span
                          className={`text-[9px] tracking-widest uppercase px-2 py-1 border ${getLifecycleBadge(order.lifecycle)}`}
                        >
                          {order.lifecycle}
                        </span>
                      </div>
                      <p className="text-xs tracking-wider text-[#999999]">
                        Order #{order.id.split("-")[0]} · Qty: {order.quantity}
                      </p>
                      <p className="text-xs tracking-wider text-[#666666]">
                        {new Date(order.createdAt).toLocaleDateString("id-ID", {
                          day: "numeric", month: "long", year: "numeric"
                        })}
                      </p>
                      {order.trackingNumber && (
                        <p className="text-xs tracking-wider text-[#111111]">
                          Tracking: <span className="font-medium">{order.trackingNumber}</span>
                        </p>
                      )}
                    </div>
                    <div className="flex flex-col items-end justify-center gap-2">
                      <p className="text-sm tracking-wider text-[#111111] font-medium">
                        {formatPrice(order.totalAmount)}
                      </p>
                      <span className="text-[9px] tracking-widest uppercase text-[#cccccc] group-hover:text-[#111111] transition-colors">
                        View Detail →
                      </span>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </motion.div>
      </main>
      <Footer />
    </>
  );
}

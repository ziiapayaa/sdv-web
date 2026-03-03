"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import Link from "next/link";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { XCircle, Loader2 } from "lucide-react";

import { Suspense } from "react";

function CheckoutFailedContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const orderId = searchParams.get("order_id");
  
  const [mounted, setMounted] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setMounted(true);
    if (!orderId) {
      router.push("/");
      return;
    }

    const verifyFailure = async () => {
      try {
        const email = sessionStorage.getItem("sdv-checkout-email");
        if (!email) {
          router.push("/");
          return;
        }

        const res = await fetch(`/api/order/${orderId}`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email })
        });
        if (!res.ok) throw new Error("Order not found");
        
        const data = await res.json();
        
        if (data.lifecycle !== "FAILED") {
          router.push(`/checkout/success?order_id=${orderId}`);
          return;
        }
      } catch (err) {
        console.error(err);
        router.push("/");
      } finally {
        setLoading(false);
      }
    };

    verifyFailure();
  }, [orderId, router]);

  if (!mounted || !orderId) return null;

  if (loading) {
    return (
      <main className="min-h-screen pt-32 pb-12 flex flex-col items-center justify-center bg-[#ffffff] text-[#000000]">
        <Loader2 className="w-8 h-8 animate-spin text-[#666666]" />
      </main>
    );
  }

  return (
    <main className="min-h-screen pt-32 pb-12 flex flex-col items-center bg-[#ffffff] text-[#000000]">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.8 }}
        className="w-full max-w-[600px] px-6 text-center space-y-8"
      >
        <div className="flex justify-center mb-8">
          <XCircle className="w-20 h-20 text-red-800" strokeWidth={1} />
        </div>
        
        <h1 className="text-2xl md:text-4xl font-light tracking-[0.2em] uppercase">
          Payment Failed
        </h1>
        
        <p className="text-sm tracking-widest text-[#666666] leading-relaxed">
          We couldn&apos;t process your payment. This could be due to a declined card, insufficient funds, or a network error. Your items are still saved in your cart.
        </p>

        <div className="pt-8 flex flex-col sm:flex-row items-center justify-center gap-6 cursor-pointer">
           <Link 
            href="/checkout"
            className="w-full sm:w-auto px-12 h-14 bg-[#000000] text-white flex items-center justify-center text-xs tracking-[0.2em] uppercase hover:bg-[#333333] transition-colors"
          >
            Try Again
          </Link>
           <Link 
            href="/cart"
            className="w-full sm:w-auto px-12 h-14 border border-[#000000] text-black flex items-center justify-center text-xs tracking-[0.2em] uppercase hover:bg-[#000000] hover:text-white transition-colors"
          >
            Return to Cart
          </Link>
        </div>
      </motion.div>
    </main>
  );
}

export default function CheckoutFailedPage() {
  return (
    <>
      <Navbar />
      <Suspense fallback={
        <main className="min-h-screen pt-32 pb-12 flex flex-col items-center justify-center bg-[#ffffff] text-[#000000]">
          <Loader2 className="w-8 h-8 animate-spin text-[#666666]" />
        </main>
      }>
        <CheckoutFailedContent />
      </Suspense>
      <Footer />
    </>
  );
}

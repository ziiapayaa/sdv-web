"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import Link from "next/link";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { CheckCircle, Clock, Loader2, CreditCard } from "lucide-react";
import { CountdownTimer } from "@/components/ui/CountdownTimer";
import Script from "next/script";

import { Suspense } from "react";

function CheckoutSuccessContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const orderId = searchParams.get("order_id");
  
  const [mounted, setMounted] = useState(false);
  const [loading, setLoading] = useState(true);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [orderDetails, setOrderDetails] = useState<any | null>(null);

  useEffect(() => {
    setMounted(true);
    if (!orderId) {
      router.push("/");
      return;
    }

    // Explicit Server Validation with ownership check
    const fetchOrder = async () => {
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
        
        // Strict guard
        if (data.lifecycle === "FAILED") {
          router.push(`/checkout/failed?order_id=${orderId}`);
          return;
        }

        setOrderDetails(data);
      } catch (err) {
        console.error(err);
        router.push("/");
      } finally {
        setLoading(false);
      }
    };

    fetchOrder();
  }, [orderId, router]);

  if (!mounted || !orderId) return null;

  if (loading) {
    return (
      <main className="min-h-screen pt-32 pb-12 flex flex-col items-center justify-center bg-[#ffffff] text-[#000000]">
        <Loader2 className="w-8 h-8 animate-spin text-[#666666]" />
      </main>
    );
  }

  if (!orderDetails) return null;

  // Determine realistic status based on DB, not URL
  const isPending = orderDetails.paymentStatus === "UNPAID";

  return (
    <main className="min-h-screen pt-32 pb-12 flex flex-col items-center bg-[#ffffff] text-[#000000]">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.8 }}
        className="w-full max-w-[600px] px-6 text-center space-y-8"
      >
        <div className="flex justify-center mb-8">
          {isPending ? (
            <Clock className="w-20 h-20 text-[#666666]" strokeWidth={1} />
          ) : (
            <CheckCircle className="w-20 h-20 text-black" strokeWidth={1} />
          )}
        </div>
        
        <h1 className="text-2xl md:text-4xl font-light tracking-[0.2em] uppercase">
          {isPending ? "Waiting for payment" : "Payment successful"}
        </h1>
        
        <p className="text-sm tracking-widest text-[#666666] leading-relaxed">
          {isPending 
            ? "You have a pending payment. Please complete your payment using the instructions provided by your selected payment method."
            : "Thank you for your purchase. We've received your order and will begin processing it shortly."}
        </p>

        {isPending && orderDetails.reservationExpiresAt && (
          <div className="my-8">
            <CountdownTimer 
              expiresAt={new Date(orderDetails.reservationExpiresAt as string)} 
              onRefreshStatus={() => window.location.reload()} 
            />
          </div>
        )}

        {/* Pay Now Button */}
        {isPending && orderDetails.snapToken && (
          <>
            <Script 
              src="https://app.sandbox.midtrans.com/snap/snap.js"
              data-client-key={process.env.NEXT_PUBLIC_MIDTRANS_CLIENT_KEY || 'SB-Mid-client-DUMMY'}
              strategy="afterInteractive"
            />
            <button
              onClick={() => {
                if (!(window as any).snap) {
                  alert("Payment system is loading, please try again in a moment.");
                  return;
                }
                (window as any).snap.pay(orderDetails.snapToken, {
                  onSuccess: () => window.location.reload(),
                  onPending: () => window.location.reload(),
                  onError: () => alert("Payment failed. Please try again."),
                  onClose: () => {},
                });
              }}
              className="w-full sm:w-auto px-12 h-14 bg-[#000000] text-white flex items-center justify-center gap-3 text-xs tracking-[0.2em] uppercase hover:bg-[#333333] transition-colors"
            >
              <CreditCard className="w-4 h-4" />
              Pay Now
            </button>
          </>
        )}

        <div className="bg-[#fcfcfc] border border-[#eaeaea] p-6 text-left my-10 space-y-4">
          <h2 className="text-[10px] tracking-[0.2em] uppercase text-[#666666] border-b border-[#eaeaea] pb-4">Order Details</h2>
          <div className="flex justify-between items-center text-sm tracking-widest pt-2">
            <span className="text-[#666666]">Order Number:</span>
            <span className="font-medium text-black">{orderId.split("-")[0].toUpperCase()}</span>
          </div>
          <div className="flex justify-between items-center text-sm tracking-widest pt-2">
            <span className="text-[#666666]">Name:</span>
            <span className="font-medium text-black">{orderDetails.name as string}</span>
          </div>
          <div className="flex justify-between items-center text-sm tracking-widest pt-2">
             <span className="text-[#666666]">Total Amount:</span>
             <span className="font-medium text-black">
               {new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(orderDetails.totalAmount as number)}
             </span>
          </div>
        </div>

        <div className="pt-8 flex flex-col sm:flex-row items-center justify-center gap-6 cursor-pointer">
           <Link 
            href="/collections"
            className="w-full sm:w-auto px-12 h-14 border border-[#000000] text-black flex items-center justify-center text-xs tracking-[0.2em] uppercase hover:bg-[#000000] hover:text-white transition-colors"
          >
            Continue Shopping
          </Link>
        </div>
      </motion.div>
    </main>
  );
}

export default function CheckoutSuccessPage() {
  return (
    <>
      <Navbar />
      <Suspense fallback={
        <main className="min-h-screen pt-32 pb-12 flex flex-col items-center justify-center bg-[#ffffff] text-[#000000]">
          <Loader2 className="w-8 h-8 animate-spin text-[#666666]" />
        </main>
      }>
        <CheckoutSuccessContent />
      </Suspense>
      <Footer />
    </>
  );
}

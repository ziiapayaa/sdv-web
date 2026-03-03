"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { motion } from "framer-motion";
import Script from "next/script";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { useCartStore } from "@/lib/store";



export default function CheckoutPage() {
  const router = useRouter();
  const { data: session } = useSession();
  const { items, totalPrice, clearCart } = useCartStore();
  const [mounted, setMounted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  // Form State — email/name auto-filled from session
  const [formData, setFormData] = useState({
    phone: "",
    address: ""
  });
  
  const [errors, setErrors] = useState<Partial<typeof formData>>({});

  useEffect(() => {
    setMounted(true);
  }, []);

  // Redirect to cart if empty
  useEffect(() => {
    if (mounted && items.length === 0) {
      router.push("/cart");
    }
  }, [mounted, items, router]);

  const validateForm = () => {
    const newErrors: Partial<typeof formData> = {};
    if (!formData.phone.trim() || formData.phone.length < 8) newErrors.phone = "Valid phone number is required";
    if (!formData.address.trim() || formData.address.length < 10) newErrors.address = "Complete address is required";
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name as keyof typeof formData]) {
      setErrors(prev => ({ ...prev, [name]: undefined }));
    }
  };

  const handleCheckout = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setIsLoading(true);

    try {
      const response = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'X-Requested-With': 'XMLHttpRequest'
        },
        body: JSON.stringify({
          items,
          phone: formData.phone,
          address: formData.address,
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Checkout failed");
      }

      // 2. Trigger Midtrans Snap safely
      if (!window.snap) {
        throw new Error("Midtrans Snap is not loaded yet. Please refresh the page.");
      }

      window.snap.pay(data.snapToken, {
        onSuccess: function() {
          clearCart();
          router.push(`/checkout/success?order_id=${data.orderId}`);
        },
        onPending: function() {
          clearCart(); // Clearing cart for pending (like bank transfer), they can pay later
          router.push(`/checkout/success?order_id=${data.orderId}`);
        },
        onError: function(result) {
          console.error("Payment error:", result);
          // Don't clear cart on error so they can retry
          router.push(`/checkout/failed?order_id=${data.orderId}`);
        },
        onClose: function() {
          setIsLoading(false);
          // Force them to the pending page securely instead of staying on checkout with a dirty cart state
          router.push(`/checkout/success?order_id=${data.orderId}`);
        }
      });

    } catch (error: unknown) {
      console.error("Checkout process Error:", error);
      const err = error as Error;
      alert(err.message || "Failed to initiate checkout");
      setIsLoading(false); 
    }
  };

  if (!mounted || items.length === 0) return null;

  const clientKey = process.env.NEXT_PUBLIC_MIDTRANS_CLIENT_KEY || 'SB-Mid-client-DUMMY';
  const isProdKey = clientKey.startsWith('Mid-client-');
  
  const snapScriptUrl = isProdKey
    ? 'https://app.midtrans.com/snap/snap.js'
    : 'https://app.sandbox.midtrans.com/snap/snap.js';

  return (
    <>
      <Navbar />
      <Script 
        src={snapScriptUrl}
        strategy="afterInteractive"
        data-client-key={clientKey}
      />
      <main className="min-h-screen pt-28 pb-12 flex flex-col items-center bg-[#ffffff] text-[#000000]">
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="w-full max-w-[1000px] px-6 md:px-12 flex-1"
        >
          <header className="mb-12 text-center md:text-left">
            <h1 className="text-2xl md:text-3xl font-light tracking-[0.2em] uppercase">Checkout</h1>
            <div className="w-12 h-[1px] bg-black mt-4 mx-auto md:mx-0"></div>
          </header>

          <div className="flex flex-col lg:flex-row gap-16">
            
            {/* Left: Form */}
            <div className="w-full lg:w-[60%]">
              <h2 className="text-xs tracking-[0.2em] font-medium uppercase mb-8">Shipping Information</h2>
              
              {/* Logged-in user info */}
              <div className="mb-8 bg-[#f8f8f8] border border-[#e8e8e8] p-5 flex flex-col gap-3">
                <p className="text-[10px] tracking-widest text-[#999999] uppercase">Logged in as</p>
                <p className="text-sm tracking-wider text-[#111111] font-medium">{session?.user?.name || "—"}</p>
                <p className="text-xs tracking-wider text-[#666666]">{session?.user?.email || "—"}</p>
              </div>
              
              <form onSubmit={handleCheckout} className="space-y-6">

                <div className="space-y-2">
                  <label className="text-[10px] tracking-widest uppercase text-[#666666]">Phone *</label>
                  <input 
                    type="tel" 
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    disabled={isLoading}
                    className={`w-full border-b ${errors.phone ? 'border-red-500' : 'border-[#eaeaea]'} pb-2 text-sm focus:outline-none focus:border-black transition-colors rounded-none bg-transparent`}
                    placeholder="e.g. +628123456789"
                  />
                  {errors.phone && <p className="text-[10px] text-red-500">{errors.phone}</p>}
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] tracking-widest uppercase text-[#666666]">Complete Address *</label>
                  <textarea 
                    name="address"
                    value={formData.address}
                    onChange={handleInputChange}
                    disabled={isLoading}
                    rows={3}
                    className={`w-full border-b ${errors.address ? 'border-red-500' : 'border-[#eaeaea]'} pb-2 text-sm focus:outline-none focus:border-black transition-colors rounded-none bg-transparent resize-none`}
                    placeholder="Street name, Building, Apartment No, City, Postal Code"
                  />
                  {errors.address && <p className="text-[10px] text-red-500">{errors.address}</p>}
                </div>

                <button 
                  type="submit"
                  disabled={isLoading}
                  className="w-full h-14 bg-[#000000] text-white flex items-center justify-center text-xs tracking-[0.2em] uppercase hover:bg-[#333333] transition-colors mt-8 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? "Processing..." : "Continue to Payment"}
                </button>
              </form>
            </div>

            {/* Right: Order Summary */}
            <div className="w-full lg:w-[40%]">
              <div className="bg-[#fcfcfc] border border-[#eaeaea] p-8 sticky top-32 flex flex-col gap-6">
                <h2 className="text-xs tracking-[0.2em] font-medium uppercase border-b border-[#eaeaea] pb-4">Order Summary</h2>
                
                <div className="flex flex-col gap-4 max-h-[40vh] overflow-y-auto">
                  {items.map(item => (
                    <div key={item.id} className="flex justify-between text-xs tracking-wider">
                      <div className="flex flex-col">
                        <span className="font-medium text-[#333333]">{item.product.title}</span>
                        <span className="text-[10px] text-[#666666] mt-1">Qty: {item.quantity} | Size: {item.size}</span>
                      </div>
                      <span className="text-[#333333]">
                        {new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(item.product.price * item.quantity)}
                      </span>
                    </div>
                  ))}
                </div>

                <div className="border-t border-[#eaeaea] pt-4 mt-2 space-y-3">
                  <div className="flex justify-between text-xs tracking-widest text-[#333333]">
                    <span>Subtotal</span>
                    <span>{new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(totalPrice())}</span>
                  </div>
                  <div className="flex justify-between text-xs tracking-widest text-[#333333]">
                    <span>Shipping</span>
                    <span>Free</span>
                  </div>
                  
                  <div className="flex justify-between text-sm tracking-widest font-medium border-t border-[#eaeaea] pt-4 mt-2">
                    <span>TOTAL</span>
                    <span>{new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(totalPrice())}</span>
                  </div>
                </div>

              </div>
            </div>

          </div>
        </motion.div>
      </main>
      <Footer />
    </>
  );
}

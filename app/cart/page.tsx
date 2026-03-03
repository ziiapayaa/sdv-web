"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import Image from "next/image";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { useCartStore } from "@/lib/store";
import { X } from "lucide-react";

export default function Cart() {
  const { items, removeItem, updateQuantity, totalPrice } = useCartStore();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <>
        <Navbar />
        <main className="min-h-screen pt-20 pb-12 flex flex-col items-center bg-[#ffffff] text-[#000000]">
          <div className="flex-1 w-full" />
        </main>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Navbar />
      <main className="min-h-screen pt-20 pb-12 flex flex-col items-center bg-[#ffffff] text-[#000000]">

      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1 }}
        className="w-full max-w-[1200px] px-6 md:px-12 flex-1"
      >
        <header className="mb-16 md:mb-24 text-center mt-6">
          <h1 className="text-3xl md:text-5xl font-light tracking-widest uppercase">Shopping Cart</h1>
        </header>

        {items.length === 0 ? (
          <div className="flex flex-col items-center justify-center space-y-8 my-20">
            <p className="text-[#666666] tracking-widest text-sm uppercase">Your cart is currently empty.</p>
            <Link 
              href="/collections"
              className="px-8 py-3 border border-[#000000] text-xs tracking-widest uppercase hover:bg-[#000000] hover:text-white transition-colors"
            >
              Discover Collections
            </Link>
          </div>
        ) : (
          <div className="flex flex-col lg:flex-row gap-16">
            {/* Cart Items */}
            <div className="w-full lg:w-[65%] flex flex-col gap-8">
              {/* Header Row */}
              <div className="hidden md:grid grid-cols-12 gap-4 pb-4 border-b border-[#eaeaea] text-[10px] tracking-widest text-[#666666] uppercase">
                <div className="col-span-6">Product</div>
                <div className="col-span-3 text-center">Quantity</div>
                <div className="col-span-3 text-right">Total</div>
              </div>

              {/* Items List */}
              <div className="flex flex-col gap-8">
                {items.map((item) => (
                  <div key={item.id} className="grid grid-cols-1 md:grid-cols-12 gap-4 md:items-center py-4 border-b border-[#eaeaea]">
                    {/* Mobile: Remove button at top right */}
                    <div className="md:hidden flex justify-end">
                      <button onClick={() => removeItem(item.id)} className="text-[#666666] hover:text-[#000000]">
                        <X size={16} />
                      </button>
                    </div>
                    
                    {/* Product Info */}
                    <div className="col-span-1 md:col-span-6 flex gap-6">
                      <div className="w-24 h-32 bg-[#f5f5f5] flex-shrink-0 relative overflow-hidden">
                        {item.product.images && item.product.images.length > 0 ? (
                          <Image 
                            src={item.product.images.find(img => img.isPrimary)?.url || item.product.images[0].url} 
                            alt={item.product.title} 
                            fill 
                            sizes="96px" 
                            className="object-cover" 
                          />
                        ) : (
                          <div className="absolute inset-0 flex items-center justify-center text-[#666666] text-[8px] tracking-widest">
                            [ IMG ]
                          </div>
                        )}
                      </div>
                      <div className="flex flex-col justify-center gap-2">
                        <Link href={`/products/${item.product.slug}`} className="text-xs tracking-[0.15em] font-medium hover:underline">
                          {item.product.title}
                        </Link>
                        <span className="text-[10px] text-[#666666] tracking-wider uppercase">Size: {item.size}</span>
                        <span className="text-[10px] text-[#333333] tracking-widest">
                          {new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(item.product.price)}
                        </span>
                        
                        {/* Mobile Remove Button (Desktop has it at end) */}
                        <button onClick={() => removeItem(item.id)} className="hidden md:block mt-2 text-[10px] text-[#000000] underline tracking-widest w-fit hover:opacity-70">
                          REMOVE
                        </button>
                      </div>
                    </div>

                    {/* Quantity */}
                    <div className="col-span-1 md:col-span-3 flex md:justify-center items-center mt-4 md:mt-0">
                      <span className="md:hidden text-xs tracking-widest uppercase mr-4">QTY:</span>
                      <div className="flex items-center border border-[#eaeaea] w-24 h-10">
                        <button 
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          className="flex-1 h-full flex items-center justify-center hover:bg-[#f5f5f5] transition-colors"
                        >-</button>
                        <span className="flex-1 h-full flex items-center justify-center text-xs">{item.quantity}</span>
                        <button 
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          className="flex-1 h-full flex items-center justify-center hover:bg-[#f5f5f5] transition-colors"
                        >+</button>
                      </div>
                    </div>

                    {/* Total */}
                    <div className="col-span-1 md:col-span-3 flex md:justify-end items-center mt-2 md:mt-0">
                      <span className="md:hidden text-xs tracking-widest uppercase mr-4 flex-1">Total:</span>
                      <span className="text-sm font-medium tracking-widest">
                        {new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(item.product.price * item.quantity)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Order Summary */}
            <div className="w-full lg:w-[35%]">
              <div className="bg-[#fcfcfc] border border-[#eaeaea] p-8 sticky top-32 flex flex-col gap-6">
                <h2 className="text-xs tracking-[0.2em] font-medium uppercase border-b border-[#eaeaea] pb-4">Order Summary</h2>
                
                <div className="flex justify-between text-xs tracking-widest text-[#333333]">
                  <span>Subtotal</span>
                  <span>{new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(totalPrice())}</span>
                </div>
                
                <div className="flex justify-between text-xs tracking-widest text-[#333333]">
                  <span>Shipping</span>
                  <span>Calculated at checkout</span>
                </div>

                <div className="flex justify-between text-sm tracking-widest font-medium border-t border-[#eaeaea] pt-4 mt-2">
                  <span>TOTAL</span>
                  <span>{new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(totalPrice())}</span>
                </div>

                <p className="text-[10px] text-[#666666] leading-relaxed">
                  Taxes and shipping calculated at checkout. Expected delivery 3-5 business days.
                </p>

                <Link 
                  href="/checkout"
                  className="w-full h-14 bg-[#000000] text-white flex items-center justify-center text-xs tracking-[0.2em] uppercase hover:bg-[#333333] transition-colors mt-4"
                >
                  Checkout
                </Link>
              </div>
            </div>
          </div>
        )}
      </motion.div>
      </main>
      <Footer />
    </>
  );
}

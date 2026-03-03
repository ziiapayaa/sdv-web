"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Product } from "@prisma/client";
import { useCartStore } from "@/lib/store";
import Image from "next/image";
import { useRouter } from "next/navigation";


interface ProductDetailClientProps {
  product: Product & {
    images: { url: string; isPrimary: boolean }[],
    collection?: { title: string } | null,
    variants: { size: string; stock: number }[]
  };
}

export function ProductDetailClient({ product }: ProductDetailClientProps) {
  const [quantity, setQuantity] = useState(1);
  const [selectedSize, setSelectedSize] = useState("");
  const [now, setNow] = useState(new Date());
  
  const addItem = useCartStore((state) => state.addItem);
  const router = useRouter();

  const defaultImage = product.images.find(img => img.isPrimary)?.url || (product.images.length > 0 ? product.images[0].url : null);
  const [mainImage, setMainImage] = useState<string | null>(defaultImage);
  const [isLoading, setIsLoading] = useState(false);
  const [openAccordion, setOpenAccordion] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const showError = (msg: string) => {
    setError(msg);
    setTimeout(() => setError(null), 5000);
  };

  // Hydration safety for dates
  useEffect(() => {
    setNow(new Date());
    const interval = setInterval(() => setNow(new Date()), 60000); // update every minute
    return () => clearInterval(interval);
  }, []);

  const totalStock = product.variants.reduce((sum, v) => sum + v.stock, 0);
  const isUpcoming = product.dropStatus === "UPCOMING" && product.dropDate && new Date(product.dropDate) > now;
  const isSoldOut = totalStock <= 0 || product.dropStatus === "SOLD_OUT";
  const canBuy = !isUpcoming && !isSoldOut;

  // Get stock for selected size
  const selectedVariant = product.variants.find(v => v.size === selectedSize);
  const selectedStock = selectedVariant?.stock ?? 0;

  // Format drop date for display
  const formattedDropDate = product.dropDate ? new Intl.DateTimeFormat('en-US', {
    month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
  }).format(new Date(product.dropDate)) : null;

  const getButtonText = () => {
    if (isUpcoming) return `COMING SOON - ${formattedDropDate}`;
    if (isSoldOut) return "SOLD OUT";
    return "ADD TO CART";
  };

  const handleAddToCart = () => {
    if (!canBuy) return;
    if (!selectedSize) {
      showError("Please select a size first.");
      return;
    }
    
    setError(null);
    addItem({
      id: `${product.id}-${selectedSize}`,
      product: {
        ...product,
        images: product.images.map(img => ({ url: img.url, isPrimary: img.isPrimary }))
      },
      quantity,
      size: selectedSize
    });
  };

  const handleQuantityChange = (delta: number) => {
    const newQty = quantity + delta;
    const maxQty = selectedStock > 0 ? selectedStock : 1;
    if (newQty >= 1 && newQty <= maxQty) {
      setQuantity(newQty);
    }
  };

  const handleBuyNow = async () => {
    if (!canBuy) return;
    if (!selectedSize) {
      showError("Please select a size first.");
      return;
    }

    setError(null);
    setIsLoading(true);
    
    // Add to cart and redirect to checkout — no hardcoded guest data
    addItem({
      id: `${product.id}-${selectedSize}`,
      product: {
        ...product,
        images: product.images.map(img => ({ url: img.url, isPrimary: img.isPrimary }))
      },
      quantity,
      size: selectedSize
    });
    
    router.push("/checkout");
  };

  const toggleAccordion = (section: string) => {
    setOpenAccordion(openAccordion === section ? null : section);
  };

  return (
    <>
      <div className="w-full flex justify-center bg-[#ffffff] min-h-[80vh]">
      <div className="w-full max-w-[1200px] flex flex-col md:flex-row gap-8 md:gap-12 px-6 py-6 md:py-12">
        {/* Left Gallery */}
        <div className="w-full md:w-1/2 max-w-[650px] flex flex-col gap-4">
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1 }}
            className="w-full aspect-[3/4] bg-[#f7f7f7] flex items-center justify-center text-[#666666] text-xs tracking-widest relative overflow-hidden group"
          >
            {mainImage ? (
              <Image src={mainImage} alt={product.title} fill className="object-cover" priority sizes="(max-width: 768px) 100vw, 50vw" />
            ) : (
              <span>[ NO IMAGE AVAILABLE ]</span>
            )}
            
            {/* Status Overlays */}
            {isUpcoming && (
              <div className="absolute top-4 right-4 bg-white text-black text-[10px] tracking-widest uppercase px-3 py-1 font-medium z-10">
                Dropping {formattedDropDate}
              </div>
            )}
            {isSoldOut && !isUpcoming && (
              <div className="absolute top-4 right-4 bg-black text-white text-[10px] tracking-widest uppercase px-3 py-1 font-medium z-10">
                Archived / Sold Out
              </div>
            )}
          </motion.div>
          
          {/* Thumbnails */}
          {product.images && product.images.length > 1 && (
            <div className="flex gap-4 overflow-x-auto snap-x snap-mandatory custom-scrollbar pb-2">
              {product.images.map((img, idx) => (
                <button 
                  key={idx} 
                  onClick={() => setMainImage(img.url)}
                  className={`w-20 md:w-24 aspect-[3/4] flex-shrink-0 snap-start relative bg-[#f7f7f7] flex items-center justify-center transition-all ${mainImage === img.url ? 'border-2 border-[#111111]' : 'border border-transparent hover:border-[#cccccc]'}`}
                >
                  <Image src={img.url} alt={`${product.title} thumbnail ${idx + 1}`} fill className="object-cover" sizes="96px" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Right Info Details */}
        <div className="w-full md:w-1/2 flex flex-col text-[#111111] md:py-8 lg:sticky lg:top-24 lg:h-max">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            {product.collection && (
              <h2 className="text-xs tracking-[0.2em] mb-2 text-[#666666] uppercase">{product.collection.title}</h2>
            )}
            <h1 className="text-2xl md:text-3xl font-light uppercase mb-6 leading-tight tracking-[0.05em]">
              {product.title}
            </h1>

            <p className="text-lg md:text-xl font-medium mb-10 text-[#333333]">
              {new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(product.price)}
            </p>

            {/* Sizes */}
            <div className={`mb-8 ${!canBuy && 'opacity-50 pointer-events-none'}`}>
              <div className="flex justify-between items-center mb-4">
                <span className="text-xs tracking-widest uppercase font-medium">Select Size</span>
                <button className="text-[10px] text-[#666666] tracking-widest underline underline-offset-4 hover:text-[#111111]">Size Guide</button>
              </div>
              <div className="flex gap-3">
                {product.variants.map((variant) => {
                  const outOfStock = variant.stock <= 0;
                  return (
                    <button 
                      key={variant.size}
                      onClick={() => { if (!outOfStock) { setSelectedSize(variant.size); setQuantity(1); } }}
                      disabled={outOfStock}
                      className={`w-12 h-12 border flex items-center justify-center text-xs tracking-widest transition-all relative ${
                        outOfStock
                          ? 'border-[#e8e8e8] text-[#ccc] cursor-not-allowed'
                          : selectedSize === variant.size
                            ? 'border-[#111111] bg-[#111111] text-white'
                            : 'border-[#e8e8e8] hover:border-[#111111] hover:bg-[#111111] hover:text-white'
                      }`}
                    >
                      {variant.size}
                      {outOfStock && (
                        <span className="absolute inset-0 flex items-center justify-center">
                          <span className="w-[1px] h-[60%] bg-[#ccc] rotate-45 absolute" />
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Quantity */}
            <div className={`mb-10 ${!canBuy && 'opacity-50 pointer-events-none'}`}>
              <div className="flex justify-between items-center mb-4">
                <span className="text-xs tracking-widest uppercase font-medium block">Quantity</span>
                {canBuy && selectedSize && (
                  <span className={`text-[10px] tracking-widest uppercase ${selectedStock < 10 ? 'text-red-500 font-medium' : 'text-[#666666]'}`}>
                    {selectedStock < 10 ? `ONLY ${selectedStock} LEFT` : `${selectedStock} Available`}
                  </span>
                )}
              </div>
              <div className="flex items-center border border-[#e8e8e8] w-32 h-12">
                <button 
                  onClick={() => handleQuantityChange(-1)}
                  className="flex-1 h-full flex items-center justify-center hover:bg-[#f7f7f7] transition-colors"
                >-</button>
                <span className="flex-1 h-full flex items-center justify-center text-sm">{quantity}</span>
                <button 
                  onClick={() => handleQuantityChange(1)}
                  className="flex-1 h-full flex items-center justify-center hover:bg-[#f7f7f7] transition-colors"
                >+</button>
              </div>
            </div>

            {/* Action Buttons & Countdown */}
            <AnimatePresence>
              {error && (
                <motion.div 
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="mb-6 p-4 border border-red-500 bg-red-50 text-red-800 text-xs tracking-widest uppercase font-medium text-center"
                >
                  {error}
                </motion.div>
              )}
            </AnimatePresence>

            {isUpcoming ? (
              <div className="flex flex-col mb-12 border border-[#111111] bg-[#111111] p-6 text-white text-center">
                <span className="text-[10px] tracking-[0.3em] text-[#999999] uppercase mb-4">Dropping In</span>
                <div className="flex justify-center items-center gap-4 text-3xl font-light tracking-widest font-mono">
                  <div className="flex flex-col">
                    <span>{String(Math.floor((new Date(product.dropDate!).getTime() - now.getTime()) / (1000 * 60 * 60 * 24))).padStart(2, '0')}</span>
                    <span className="text-[10px] text-[#666666] tracking-widest mt-1 uppercase">Days</span>
                  </div>
                  <span className="text-[#666666] pb-5">:</span>
                  <div className="flex flex-col">
                    <span>{String(Math.floor(((new Date(product.dropDate!).getTime() - now.getTime()) / (1000 * 60 * 60)) % 24)).padStart(2, '0')}</span>
                    <span className="text-[10px] text-[#666666] tracking-widest mt-1 uppercase">Hrs</span>
                  </div>
                  <span className="text-[#666666] pb-5">:</span>
                  <div className="flex flex-col">
                    <span>{String(Math.floor(((new Date(product.dropDate!).getTime() - now.getTime()) / 1000 / 60) % 60)).padStart(2, '0')}</span>
                    <span className="text-[10px] text-[#666666] tracking-widest mt-1 uppercase">Min</span>
                  </div>
                  <span className="text-[#666666] pb-5">:</span>
                  <div className="flex flex-col">
                    <span>{String(Math.floor(((new Date(product.dropDate!).getTime() - now.getTime()) / 1000) % 60)).padStart(2, '0')}</span>
                    <span className="text-[10px] text-[#666666] tracking-widest mt-1 uppercase">Sec</span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex flex-col gap-4 mb-12">
                <button 
                  onClick={handleAddToCart}
                  disabled={!canBuy || isLoading}
                  className={`w-full h-14 border border-[#111111] flex items-center justify-center text-xs tracking-widest uppercase font-medium transition-colors ${canBuy && !isLoading ? 'hover:bg-[#fafafa]' : 'opacity-50 cursor-not-allowed bg-[#f5f5f5] text-[#999999] border-[#e8e8e8]'}`}
                >
                  {isSoldOut ? 'SOLD OUT' : 'ADD TO CART'}
                </button>
                {canBuy && (
                  <button 
                    onClick={handleBuyNow}
                    disabled={isLoading}
                    className="w-full h-14 bg-[#111111] text-white flex items-center justify-center text-xs tracking-widest uppercase font-medium hover:bg-[#333333] transition-colors disabled:opacity-50"
                  >
                    {isLoading ? "PROCESSING..." : "BUY NOW"}
                  </button>
                )}
              </div>
            )}
            
            <div className="text-sm text-[#333333] leading-relaxed font-light mb-12 space-y-4">
              <p>{product.description}</p>
            </div>

            <div className="border-t border-[#e8e8e8] pt-8 space-y-2 text-xs tracking-widest text-[#111111] uppercase flex flex-col font-medium">
              
              <div className="border-b border-[#e8e8e8] pb-2">
                <button onClick={() => toggleAccordion("details")} className="w-full text-left flex justify-between items-center group py-2">
                  Details & Care
                  <span className="text-[#666666] group-hover:text-[#111111]">{openAccordion === "details" ? "-" : "+"}</span>
                </button>
                <AnimatePresence>
                  {openAccordion === "details" && (
                    <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                      <div className="py-4 text-[#666666] font-light normal-case tracking-normal text-sm leading-relaxed">
                        <p className="mb-2">Crafted from premium 100% heavyweight cotton (280gsm), ensuring structured silhouette and durability.</p>
                        <ul className="list-disc pl-4 space-y-1">
                          <li>Machine wash cold with like colors</li>
                          <li>Do not bleach</li>
                          <li>Tumble dry low or hang dry</li>
                          <li>Iron on reverse side only</li>
                        </ul>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              <div className="border-b border-[#e8e8e8] pb-2">
                <button onClick={() => toggleAccordion("shipping")} className="w-full text-left flex justify-between items-center group py-2">
                  Shipping & Returns
                  <span className="text-[#666666] group-hover:text-[#111111]">{openAccordion === "shipping" ? "-" : "+"}</span>
                </button>
                <AnimatePresence>
                  {openAccordion === "shipping" && (
                    <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                      <div className="py-4 text-[#666666] font-light normal-case tracking-normal text-sm leading-relaxed">
                        <p className="font-medium text-[#111111] mb-1">Domestic Shipping (Indonesia)</p>
                        <p className="mb-4">Standard Delivery: 2-3 business days. Express Delivery available at checkout.</p>
                        
                        <p className="font-medium text-[#111111] mb-1">Returns Policy</p>
                        <p>Items can be returned within 14 days of delivery. Must be unworn, unwashed with original tags attached. Limited drop items are final sale unless defective.</p>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

            </div>
          </motion.div>
        </div>
      </div>
      </div>
    </>
  );
}

"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { Product } from "@prisma/client";
import Image from "next/image";

interface CollectionsGridProps {
  products: (Product & { images: { url: string; isPrimary: boolean }[] })[];
  title?: string;
  subtitle?: string;
}

export function CollectionsGrid({ products, title = "All Archives", subtitle = "SOCIÉTÉ DU VIDE" }: CollectionsGridProps) {
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    setNow(new Date());
    const interval = setInterval(() => setNow(new Date()), 60000); // 1 min update
    return () => clearInterval(interval);
  }, []);

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 1 }}
      className="w-full max-w-[1600px] px-6 md:px-12"
    >
      <header className="mb-24 text-center">
        <h1 className="text-sm tracking-[0.4em] mb-4 text-[#666666] uppercase">{subtitle}</h1>
        <h2 className="text-3xl md:text-5xl font-light tracking-widest uppercase text-[#111111]">{title}</h2>
      </header>

      <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-x-4 gap-y-12 md:gap-x-8 md:gap-y-16">
        {products.map((product, index) => {
          const isUpcoming = product.dropStatus === "UPCOMING" && product.dropDate && new Date(product.dropDate) > now;
          const isSoldOut = product.dropStatus === "SOLD_OUT";
          
          const primaryImage = product.images?.find(img => img.isPrimary) || product.images?.[0];

          return (
            <Link key={product.id} href={`/products/${product.slug}`} className="group block">
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 0.8, delay: index * 0.1 }}
                className="flex flex-col items-center space-y-4 md:space-y-6"
              >
                <div className="relative w-full aspect-[4/5] overflow-hidden bg-[#f7f7f7]">
                  {primaryImage ? (
                    <Image 
                      src={primaryImage.url} 
                      alt={product.title}
                      fill
                      sizes="(max-width: 768px) 50vw, 33vw"
                      className="absolute inset-0 object-cover group-hover:scale-105 transition-transform duration-[1.5s] ease-out"
                    />
                  ) : (
                    <div className="absolute inset-0 bg-[#f7f7f7] group-hover:scale-105 transition-transform duration-[1.5s] ease-out flex items-center justify-center text-[#666666] text-[10px] md:text-xs tracking-widest">
                      [ IMAGE PLACEHOLDER ]
                    </div>
                  )}

                  {/* Badges */}
                  {isUpcoming && (
                    <div className="absolute top-3 right-3 bg-white text-black text-[9px] tracking-widest uppercase px-2 py-1 font-medium z-10">
                      Coming Soon
                    </div>
                  )}
                  {isSoldOut && !isUpcoming && (
                    <div className="absolute top-3 right-3 bg-black text-white text-[9px] tracking-widest uppercase px-2 py-1 font-medium z-10">
                      Sold Out
                    </div>
                  )}
                </div>
                <div className="text-center space-y-1 md:space-y-2 relative w-full">
                  <h3 className="text-[10px] md:text-xs tracking-[0.2em] font-medium text-[#111111]">{product.title}</h3>
                  <p className="text-[9px] md:text-[10px] text-[#333333] tracking-wider">
                    {new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(product.price)}
                  </p>
                </div>
              </motion.div>
            </Link>
          );
        })}
        {products.length === 0 && (
          <div className="col-span-2 lg:col-span-3 text-center py-12 text-[#666666] tracking-widest text-xs uppercase">
            No products available at the moment.
          </div>
        )}
      </div>
    </motion.div>
  );
}

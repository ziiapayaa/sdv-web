"use client";

import { motion } from "framer-motion";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import Image from "next/image";
import { Manifesto } from "@prisma/client";

export function AboutClient({ manifesto }: { manifesto: Manifesto | null }) {
  const content = manifesto?.content || "In a world accelerating towards noise, we choose to design the silence. SOCIÉTÉ DU VIDE is not merely a label, but a study in reduction.";
  const imageUrl = manifesto?.imageUrl;

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-[#ffffff] text-[#111111] pt-20">
        <article className="max-w-4xl mx-auto px-6 md:px-12 pb-32">
          <motion.header 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1 }}
            className="text-center mb-32"
          >
            <h1 className="text-sm tracking-[0.4em] mb-8 text-[#333333] uppercase">Manifesto</h1>
            <p className="text-3xl md:text-5xl font-serif italic text-[#111111] leading-tight">
              &quot;Space is not empty. It is pregnant with possibilities. We design for the void.&quot;
            </p>
          </motion.header>

          <section className="space-y-24">
            <motion.div 
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 1 }}
              className="flex flex-col md:flex-row gap-12 items-start"
            >
              <div className="w-full md:w-1/3 text-xs tracking-widest text-[#666666] uppercase pt-2">
                01 // The Philosophy
              </div>
              <div className="w-full md:w-2/3 text-sm md:text-base leading-loose text-[#333333] whitespace-pre-wrap font-serif">
                {content}
              </div>
            </motion.div>

            {/* Dynamic Full Width Image Break */}
            <motion.div 
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 1.5 }}
              className={`w-full aspect-[21/9] my-24 flex justify-center items-center text-xs tracking-widest relative overflow-hidden bg-[#fafafa] border border-[#e8e8e8]`}
            >
              {imageUrl ? (
                <Image 
                  src={imageUrl}
                  alt="Manifesto Editorial"
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, 900px"
                  priority
                />
              ) : (
                <span className="text-[#999999]">[ EDITORIAL IMAGE PENDING ]</span>
              )}
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 1 }}
              className="flex flex-col md:flex-row gap-12 items-start"
            >
              <div className="w-full md:w-1/3 text-xs tracking-widest text-[#666666] uppercase pt-2">
                02 // The Craft
              </div>
              <div className="w-full md:w-2/3 text-sm md:text-base leading-loose text-[#333333] font-serif whitespace-pre-wrap">
                {manifesto?.craftContent || "Each piece is meticulously constructed using heritage techniques, adapted for contemporary movement.\nWe source our textiles from mills that share our commitment to longevity over seasonality.\nA single garment takes hours of unyielding dedication to construct, honoring the slowness that true elegance demands."}
              </div>
            </motion.div>
          </section>
        </article>
      </main>
      <Footer />
    </>
  );
}

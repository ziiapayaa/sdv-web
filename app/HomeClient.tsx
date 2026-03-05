"use client";

import { motion } from "framer-motion";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { HomeSettings } from "@prisma/client";

export function HomeClient({ settings }: { settings: HomeSettings | null }) {
  const title = settings?.heroTitle || "SOCIÉTÉ DU VIDE";
  const subtitle = settings?.heroSubtitle || "The Intellectual Approach to Form";
  const videoUrl = settings?.heroVideoUrl || null;
  const imageUrl = settings?.heroImageUrl || null;
  const quote = settings?.manifestoQuote || "In a world accelerating towards noise, we choose to design the silence.";
  const description = settings?.manifestoDescription || "SOCIÉTÉ DU VIDE is not merely a label, but a study in reduction. We remove the unnecessary to reveal the essential. Our garments are quiet companions for the intellectual mind—structured yet fluid, confident yet understated.";

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-background text-foreground flex flex-col relative w-full overflow-hidden">

      {/* Hero Section */}
      <section className="h-screen w-full flex flex-col items-center justify-center relative bg-black overflow-hidden">
        {/* Ambient Video or Image Background */}
        {videoUrl ? (
          <video
            autoPlay
            loop
            muted
            playsInline
            className="absolute inset-0 w-full h-full object-cover z-0 opacity-70"
            src={videoUrl} 
          />
        ) : imageUrl ? (
          <img 
            src={imageUrl} 
            alt="Hero Background" 
            className="absolute inset-0 w-full h-full object-cover z-0 opacity-70"
          />
        ) : null}
        
        {/* Dark Overlay for Text Legibility */}
        <div className="absolute inset-0 bg-black/30 z-0" />

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1.5, ease: [0.22, 1, 0.36, 1] }}
          className="z-10 text-center px-4"
        >
          <h1 className="text-4xl md:text-7xl lg:text-8xl tracking-[0.3em] font-light uppercase text-white drop-shadow-sm">
            {title}
          </h1>
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1, duration: 1.5 }}
            className="mt-8 text-xs md:text-sm tracking-widest text-gray-200 uppercase drop-shadow-sm"
          >
            {subtitle}
          </motion.p>
        </motion.div>
      </section>

      {/* Manifesto Section */}
      <section className="w-full min-h-[70vh] flex items-center justify-center px-6 py-24 bg-gray-50">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 1.2, ease: "easeOut" }}
          className="max-w-3xl text-center"
        >
          <h2 className="text-2xl md:text-4xl font-serif italic mb-8 leading-relaxed text-[#111111]">
            &quot;{quote}&quot;
          </h2>
          <p className="text-sm md:text-base leading-loose tracking-wide text-[#333333]">
            {description}
          </p>
        </motion.div>
      </section>

      </main>
      <Footer />
    </>
  );
}

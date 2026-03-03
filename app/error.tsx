"use client";

import { useEffect } from "react";
import Link from "next/link";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Application Error:", error);
  }, [error]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#ffffff] text-[#000000] px-6">
      <div className="text-center space-y-8 max-w-md">
        <h1 className="text-4xl md:text-6xl font-light tracking-[0.2em]">ERROR</h1>
        <div className="w-12 h-[1px] bg-black mx-auto"></div>
        <p className="text-sm tracking-[0.2em] uppercase text-[#666666]">
          Something went wrong
        </p>
        <p className="text-xs tracking-wider text-[#999999] leading-relaxed">
          An unexpected error has occurred. Please try again or return to the homepage.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <button
            onClick={reset}
            className="px-12 h-14 bg-[#000000] text-white text-xs tracking-[0.2em] uppercase hover:bg-[#333333] transition-colors"
          >
            Try Again
          </button>
          <Link
            href="/"
            className="px-12 h-14 border border-[#000000] text-xs tracking-[0.2em] uppercase hover:bg-[#000000] hover:text-white transition-colors leading-[3.5rem]"
          >
            Return Home
          </Link>
        </div>
      </div>
    </div>
  );
}

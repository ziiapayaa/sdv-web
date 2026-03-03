import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#ffffff] text-[#000000] px-6">
      <div className="text-center space-y-8 max-w-md">
        <h1 className="text-6xl md:text-8xl font-light tracking-[0.3em]">404</h1>
        <div className="w-12 h-[1px] bg-black mx-auto"></div>
        <p className="text-sm tracking-[0.2em] uppercase text-[#666666]">
          The void has consumed this page
        </p>
        <p className="text-xs tracking-wider text-[#999999] leading-relaxed">
          The page you are looking for does not exist, has been removed, or is temporarily unavailable.
        </p>
        <Link 
          href="/"
          className="inline-block px-12 h-14 border border-[#000000] text-xs tracking-[0.2em] uppercase hover:bg-[#000000] hover:text-white transition-colors leading-[3.5rem]"
        >
          Return Home
        </Link>
      </div>
    </div>
  );
}

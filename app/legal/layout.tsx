import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";

export default function LegalLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-[#ffffff] pt-28 pb-20 px-6 md:px-12 flex flex-col items-center">
        <div className="w-full max-w-[800px]">
          {children}
        </div>
      </main>
      <Footer />
    </>
  );
}

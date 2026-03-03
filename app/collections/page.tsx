import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { CollectionsGrid } from "./CollectionsGrid";
import { prisma } from "@/lib/prisma";

// Revalidate every hour or make it dynamic if you want real-time updates
export const revalidate = 3600;

export default async function Collections() {
  // Fetch published products from the database
  const products = await prisma.product.findMany({
    where: {
      published: true,
    },
    include: {
      images: true,
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  return (
    <>
      <Navbar />
      <main className="min-h-screen pt-20 pb-12 flex flex-col items-center bg-[#ffffff]">
        <CollectionsGrid products={products} />
      </main>
      <Footer />
    </>
  );
}

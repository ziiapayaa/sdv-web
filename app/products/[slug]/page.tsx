import { notFound } from "next/navigation";
import { Metadata } from "next";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { ProductDetailClient } from "./ProductDetailClient";
import { prisma } from "@/lib/prisma";

export const revalidate = 3600;

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const product = await prisma.product.findUnique({
    where: { slug: params.slug },
    include: { images: { where: { isPrimary: true }, take: 1 } }
  });

  if (!product) return { title: "Product Not Found" };

  const imageUrl = product.images[0]?.url;
  const price = new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(product.price);

  return {
    title: product.title,
    description: product.description?.substring(0, 160) || `${product.title} — ${price}`,
    openGraph: {
      title: product.title,
      description: product.description?.substring(0, 160) || `${product.title} — ${price}`,
      ...(imageUrl && { images: [{ url: imageUrl }] }),
    },
  };
}

export default async function ProductDetail({ params }: { params: { slug: string } }) {
  const product = await prisma.product.findUnique({
    where: { slug: params.slug },
    include: {
      images: true,
      collection: true,
      variants: true,
    }
  });

  // Business Logic Enforcement: Must exist and must be published
  if (!product || !product.published) {
    notFound();
  }

  // Business Logic Enforcement: If tied to a collection, the collection must also be published
  if (product.collection && !product.collection.published) {
    notFound();
  }

  return (
    <>
      <Navbar />
      <main className="min-h-screen pt-20 bg-[#ffffff]">
        <ProductDetailClient product={product} />
      </main>
      <Footer />
    </>
  );
}

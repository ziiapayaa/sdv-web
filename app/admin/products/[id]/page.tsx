import { ProductForm } from "../ProductForm";
import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";

export default async function EditProduct({ params }: { params: { id: string } }) {
  const product = await prisma.product.findUnique({
    where: { id: params.id },
    include: { images: true, variants: true }
  });

  if (!product) {
    notFound();
  }

  const collections = await prisma.collection.findMany({
    orderBy: { title: 'asc' }
  });

  return (
    <div className="flex flex-col gap-8">
      <header>
        <h1 className="text-2xl font-light tracking-widest uppercase mb-2 text-[#111111]">Edit Product</h1>
        <p className="text-xs text-[#666666] tracking-wider">Modify an existing garment in the archive.</p>
      </header>
      
      <ProductForm product={product} collections={collections} />
    </div>
  );
}

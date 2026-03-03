import { ProductForm } from "../ProductForm";
import { prisma } from "@/lib/prisma";

export default async function NewProduct() {
  const collections = await prisma.collection.findMany({
    orderBy: { title: 'asc' }
  });

  return (
    <div className="flex flex-col gap-8">
      <header>
        <h1 className="text-2xl font-light tracking-widest uppercase mb-2 text-[#111111]">New Product</h1>
        <p className="text-xs text-[#666666] tracking-wider">Add a new garment to the archive.</p>
      </header>
      
      <ProductForm product={null} collections={collections} />
    </div>
  );
}

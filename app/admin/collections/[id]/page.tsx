import { CollectionForm } from "../CollectionForm";
import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";

export default async function EditCollection({ params }: { params: { id: string } }) {
  const collection = await prisma.collection.findUnique({
    where: { id: params.id },
  });

  if (!collection) {
    notFound();
  }

  return (
    <div className="flex flex-col gap-8">
      <header>
        <h1 className="text-2xl font-light tracking-widest uppercase mb-2 text-[#111111]">Edit Collection</h1>
        <p className="text-xs text-[#666666] tracking-wider">Modify curation.</p>
      </header>
      
      <CollectionForm collection={collection} />
    </div>
  );
}

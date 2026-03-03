import { Button } from "@/components/ui/Button";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { deleteCollection } from "../actions";

export const dynamic = "force-dynamic";

export default async function AdminCollections() {
  const collections = await prisma.collection.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      _count: {
        select: { products: true }
      }
    }
  });

  return (
    <div className="flex flex-col gap-8">
      <header className="flex justify-between items-center bg-[#ffffff] p-6 border border-[#e8e8e8] shadow-sm">
        <div>
          <h1 className="text-2xl font-light tracking-widest uppercase mb-2 text-[#111111]">Collections</h1>
          <p className="text-xs text-[#666666] tracking-wider">Curate your seasons.</p>
        </div>
        <Link href="/admin/collections/new">
          <Button size="sm" className="bg-[#111111] hover:bg-[#333333] text-white">Create Collection</Button>
        </Link>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {collections.map((collection) => (
          <div key={collection.id} className="border border-[#e8e8e8] p-6 bg-[#ffffff] shadow-sm group relative overflow-hidden flex flex-col justify-end min-h-[300px]">
            <div className="absolute inset-0 bg-black/5 z-10 group-hover:bg-black/10 transition-colors" />
            <div className="z-20 relative text-center">
              <h3 className="text-lg text-[#111111] font-light tracking-widest uppercase mb-4">{collection.title}</h3>
              <p className="text-[10px] text-[#666666] tracking-widest uppercase mb-2">{collection._count.products} Products</p>
              <p className="text-[10px] text-[#666666] tracking-widest uppercase mb-6">{collection.published ? "Published" : "Draft"}</p>
              <div className="flex justify-center gap-4">
                <Link href={`/admin/collections/${collection.id}`} className="text-[10px] tracking-widest text-[#666666] hover:text-[#111111] transition-colors uppercase font-medium">Edit</Link>
                <form action={async () => {
                  "use server"
                  await deleteCollection(collection.id)
                }}>
                  <button type="submit" className="text-[10px] tracking-widest text-red-500 hover:text-red-700 transition-colors uppercase font-medium">Delete</button>
                </form>
              </div>
            </div>
          </div>
        ))}
        {collections.length === 0 && (
          <div className="col-span-full border border-[#e8e8e8] p-12 bg-[#ffffff] text-center text-[#666666] tracking-widest uppercase text-xs">
            No collections found.
          </div>
        )}
      </div>
    </div>
  );
}

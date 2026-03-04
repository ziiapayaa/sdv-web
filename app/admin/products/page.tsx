import { Button } from "@/components/ui/Button";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { toggleProductPublish, deleteProduct } from "../actions";

export const dynamic = "force-dynamic";

export default async function AdminProducts() {
  const products = await prisma.product.findMany({
    orderBy: { createdAt: "desc" }
  });

  return (
    <div className="flex flex-col gap-8">
      <header className="flex justify-between items-center bg-[#ffffff] p-6 border border-[#e8e8e8] shadow-sm">
        <div>
          <h1 className="text-2xl font-light tracking-widest uppercase mb-2 text-[#111111]">Products</h1>
          <p className="text-xs text-[#666666] tracking-wider">Manage your garments.</p>
        </div>
        <Link href="/admin/products/new">
          <Button size="sm" className="bg-[#111111] hover:bg-[#333333] text-white">Add Product</Button>
        </Link>
      </header>

      {/* MOBILE: Card Layout */}
      <div className="md:hidden flex flex-col gap-3">
        {products.length === 0 ? (
          <p className="text-center text-[#666666] text-xs tracking-widest py-8">No products found.</p>
        ) : (
          products.map((product) => (
            <div key={product.id} className="bg-white border border-[#e8e8e8] p-4">
              <div className="flex justify-between items-start mb-2">
                <Link href={`/admin/products/${product.id}`} className="font-medium text-sm text-[#111111] tracking-wider uppercase">
                  {product.title}
                </Link>
                <span className={`text-[10px] tracking-wider uppercase ${product.published ? 'text-green-600' : 'text-yellow-600'}`}>
                  {product.published ? 'Published' : 'Draft'}
                </span>
              </div>
              <div className="text-xs text-[#666666] mb-3">
                {new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(product.price)}
              </div>
              <div className="flex gap-4 items-center text-xs tracking-widest uppercase border-t border-[#f0f0f0] pt-3">
                <Link href={`/admin/products/${product.id}`} className="text-[#666666] hover:text-[#111111]">Edit</Link>
                <form action={async () => {
                  "use server"
                  await toggleProductPublish(product.id, product.published)
                }}>
                  <button type="submit" className="text-[#666666] hover:text-[#111111]">
                    {product.published ? 'Unpublish' : 'Publish'}
                  </button>
                </form>
                <form action={async () => {
                  "use server"
                  await deleteProduct(product.id)
                }}>
                  <button type="submit" className="text-red-500 hover:text-red-700 ml-auto">Delete</button>
                </form>
              </div>
            </div>
          ))
        )}
      </div>

      {/* DESKTOP: Table Layout */}
      <div className="hidden md:block border border-[#e8e8e8] bg-[#ffffff] overflow-x-auto shadow-sm">
        <table className="w-full text-left text-xs tracking-widest uppercase text-[#333333]">
          <thead className="border-b border-[#e8e8e8] bg-[#fafafa]">
            <tr>
              <th className="px-6 py-4 font-normal">Name</th>
              <th className="px-6 py-4 font-normal">Price</th>
              <th className="px-6 py-4 font-normal">Status</th>
              <th className="px-6 py-4 font-normal text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {products.map((product) => (
              <tr key={product.id} className="border-b border-[#e8e8e8] hover:bg-[#fafafa] transition-colors">
                <td className="px-6 py-4 text-[#111111] font-medium">{product.title}</td>
                <td className="px-6 py-4 text-[#333333]">
                  {new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(product.price)}
                </td>
                <td className="px-6 py-4">
                  <form action={async () => {
                    "use server"
                    await toggleProductPublish(product.id, product.published)
                  }}>
                    <button type="submit" className={`transition-colors ${product.published ? 'text-green-600' : 'text-yellow-600'}`}>
                      {product.published ? 'Published' : 'Draft'}
                    </button>
                  </form>
                </td>
                <td className="px-6 py-4 text-right space-x-4 flex justify-end">
                  <Link href={`/admin/products/${product.id}`} className="font-medium text-[#666666] hover:text-[#111111] transition-colors">Edit</Link>
                  <form action={async () => {
                    "use server"
                    await deleteProduct(product.id)
                  }}>
                    <button type="submit" className="font-medium text-red-500 hover:text-red-700 transition-colors">Delete</button>
                  </form>
                </td>
              </tr>
            ))}
            {products.length === 0 && (
              <tr>
                <td colSpan={4} className="px-6 py-8 text-center text-[#666666]">No products found.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

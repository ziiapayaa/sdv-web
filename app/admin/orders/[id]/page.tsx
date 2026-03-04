import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { notFound } from "next/navigation";
import { OrderStatusForm } from "./OrderStatusForm";

export const dynamic = "force-dynamic";

interface OrderDetailProps {
  params: { id: string };
}

export default async function AdminOrderDetailPage({ params }: OrderDetailProps) {
  const order = await prisma.order.findUnique({
    where: { id: params.id },
    include: {
      product: { select: { title: true, slug: true } }
    }
  });

  if (!order) notFound();

  const formatMoney = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency', currency: order.currency, maximumFractionDigits: 0
    }).format(amount);
  };

  const getBadgeColor = (type: string, val: string) => {
    if (type === "lifecycle") {
      switch (val) {
        case "PAID": return "bg-green-100 text-green-800 border-green-200";
        case "RESERVED": return "bg-yellow-100 text-yellow-800 border-yellow-200";
        case "FAILED": return "bg-red-100 text-red-800 border-red-200";
        case "EXPIRED": return "bg-gray-200 text-gray-800 border-gray-300";
        case "REFUNDED": return "bg-purple-100 text-purple-800 border-purple-200";
        default: return "bg-gray-100 text-gray-800 border-gray-200";
      }
    } else {
      switch (val) {
        case "PAID": return "bg-green-100 text-green-800 border-green-200";
        case "UNPAID": return "bg-yellow-100 text-yellow-800 border-yellow-200";
        case "REFUNDED": return "bg-purple-100 text-purple-800 border-purple-200";
        case "FAILED": return "bg-red-100 text-red-900 border-red-300";
        default: return "bg-gray-100 text-gray-800 border-gray-200";
      }
    }
  };

  return (
    <div className="flex flex-col gap-8 max-w-5xl">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <Link href="/admin/orders" className="text-xs text-[#666666] tracking-widest uppercase hover:text-black hover:underline mb-4 inline-block">
            &larr; Back to Orders
          </Link>
          <h1 className="text-2xl font-light tracking-widest uppercase mb-2 text-[#111111]">
            Order {order.id.split('-')[0].toUpperCase()}
          </h1>
          <p className="text-xs text-[#666666] tracking-wider font-mono">{order.id}</p>
        </div>
        <div className="flex gap-2">
          <span className={`px-3 py-1.5 text-xs tracking-wider uppercase border ${getBadgeColor("lifecycle", order.lifecycle)}`}>{order.lifecycle}</span>
          <span className={`px-3 py-1.5 text-xs tracking-wider uppercase border ${getBadgeColor("payment", order.paymentStatus)}`}>{order.paymentStatus}</span>
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="border border-[#e8e8e8] bg-white p-6 shadow-sm">
          <h3 className="text-xs tracking-widest text-[#666666] uppercase mb-4 border-b border-[#e8e8e8] pb-2">Customer Info</h3>
          <dl className="grid grid-cols-1 gap-3 text-sm">
            <div><dt className="text-xs text-[#888888] uppercase tracking-wider mb-1">Name</dt><dd className="font-medium">{order.name}</dd></div>
            <div><dt className="text-xs text-[#888888] uppercase tracking-wider mb-1">Email</dt><dd className="font-medium">{order.email}</dd></div>
            <div><dt className="text-xs text-[#888888] uppercase tracking-wider mb-1">Phone</dt><dd className="font-medium">{order.phone}</dd></div>
            <div><dt className="text-xs text-[#888888] uppercase tracking-wider mb-1">Address</dt><dd className="col-span-2 text-gray-700 leading-relaxed whitespace-pre-wrap">{order.address}</dd></div>
          </dl>
        </div>

        <div className="border border-[#e8e8e8] bg-white p-6 shadow-sm">
          <h3 className="text-xs tracking-widest text-[#666666] uppercase mb-4 border-b border-[#e8e8e8] pb-2">Order Info</h3>
          <dl className="grid grid-cols-2 gap-3 text-sm">
            <div><dt className="text-xs text-[#888888] uppercase tracking-wider mb-1">Gateway</dt><dd className="font-medium uppercase">{order.paymentProvider}</dd></div>
            <div><dt className="text-xs text-[#888888] uppercase tracking-wider mb-1">Transaction ID</dt><dd className="font-mono text-xs">{order.paymentTransactionId || "N/A"}</dd></div>
            <div><dt className="text-xs text-[#888888] uppercase tracking-wider mb-1">Created At</dt><dd className="text-sm">{order.createdAt.toLocaleString('id-ID')}</dd></div>
            <div><dt className="text-xs text-[#888888] uppercase tracking-wider mb-1">Updated At</dt><dd className="text-sm">{order.updatedAt.toLocaleString('id-ID')}</dd></div>
            <div><dt className="text-xs text-[#888888] uppercase tracking-wider mb-1">Currency</dt><dd className="font-medium">{order.currency}</dd></div>
            {order.trackingNumber && (
              <div><dt className="text-xs text-[#888888] uppercase tracking-wider mb-1">Tracking Number</dt><dd className="font-mono text-xs">{order.trackingNumber}</dd></div>
            )}
            {order.reservationExpiresAt && order.lifecycle === "RESERVED" && (
              <div><dt className="text-xs text-[#888888] uppercase tracking-wider mb-1">Reserved Until</dt><dd className="text-sm text-red-600">{order.reservationExpiresAt.toLocaleString('id-ID')}</dd></div>
            )}
          </dl>
        </div>
      </div>
      
      <OrderStatusForm orderId={order.id} currentLifecycle={order.lifecycle} />

      <div className="border border-[#e8e8e8] bg-white p-6 shadow-sm">
        <h3 className="text-xs tracking-widest text-[#666666] uppercase mb-4 border-b border-[#e8e8e8] pb-2">Order Items</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-[#e8e8e8] text-xs text-[#666666] uppercase tracking-wider">
                <th className="py-3 font-normal">Product</th>
                <th className="py-3 font-normal text-right">Price Snapshot</th>
                <th className="py-3 font-normal text-center">Qty</th>
                <th className="py-3 font-normal text-right">Subtotal</th>
              </tr>
            </thead>
            <tbody className="text-sm">
              <tr className="border-b border-[#e8e8e8] hover:bg-[#fafafa]">
                <td className="py-4">
                  {order.product ? (
                    <Link href={`/admin/products/${order.productId}`} className="font-medium hover:underline">{order.product.title}</Link>
                  ) : (
                    <span className="text-gray-400 italic">[Deleted Product]</span>
                  )}
                  <div className="text-xs text-gray-400 font-mono mt-1">{order.productId}</div>
                </td>
                <td className="py-4 text-right">{formatMoney(order.subtotalAmount / order.quantity)}</td>
                <td className="py-4 text-center">{order.quantity}</td>
                <td className="py-4 text-right font-medium">{formatMoney(order.subtotalAmount)}</td>
              </tr>
            </tbody>
          </table>
        </div>

        <div className="mt-6 flex justify-end">
          <div className="w-full md:w-1/3 flex flex-col gap-2 text-sm">
            <div className="flex justify-between tracking-wider"><span className="text-[#666666]">Subtotal</span><span>{formatMoney(order.subtotalAmount)}</span></div>
            <div className="flex justify-between tracking-wider"><span className="text-[#666666]">Shipping</span><span>{formatMoney(order.shippingAmount)}</span></div>
            <div className="flex justify-between tracking-wider"><span className="text-[#666666]">Discount</span><span>-{formatMoney(order.discountAmount)}</span></div>
            <div className="border-t border-black mt-2 pt-2 flex justify-between tracking-widest font-medium text-lg"><span>TOTAL</span><span>{formatMoney(order.totalAmount)}</span></div>
          </div>
        </div>
      </div>
    </div>
  );
}

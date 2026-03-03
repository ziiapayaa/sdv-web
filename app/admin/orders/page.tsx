import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { Prisma, OrderLifecycle, PaymentStatus } from "@prisma/client";

export const dynamic = "force-dynamic";

interface OrdersPageProps {
  searchParams: {
    lifecycle?: string;
    paymentStatus?: string;
    q?: string;
    sort?: string;
  };
}

export default async function AdminOrdersPage({ searchParams }: OrdersPageProps) {
  const { lifecycle, paymentStatus, q, sort = "newest" } = searchParams;

  const where: Prisma.OrderWhereInput = {};
  
  if (lifecycle && lifecycle !== "ALL") {
    where.lifecycle = lifecycle as OrderLifecycle;
  }
  
  if (paymentStatus && paymentStatus !== "ALL") {
    where.paymentStatus = paymentStatus as PaymentStatus;
  }

  if (q) {
    where.email = { contains: q, mode: "insensitive" };
  }

  const orders = await prisma.order.findMany({
    where,
    orderBy: {
      createdAt: sort === "newest" ? "desc" : "asc"
    }
  });

  // Calculate Dashboard Metrics
  const totalRevenue = orders
    .filter((o) => o.paymentStatus === "PAID")
    .reduce((sum, o) => sum + o.totalAmount, 0);
    
  const reservedCount = orders.filter((o) => o.lifecycle === "RESERVED").length;
  const expiredCount = orders.filter((o) => o.lifecycle === "EXPIRED").length;
  const paidCount = orders.filter((o) => o.lifecycle === "PAID" || o.lifecycle === "SHIPPED" || o.lifecycle === "COMPLETED").length;
  
  const conversionRate = reservedCount + paidCount > 0 
    ? ((paidCount / (reservedCount + paidCount)) * 100).toFixed(1) 
    : "0.0";

  const getBadgeColor = (type: string, val: string) => {
    if (type === "lifecycle") {
      switch (val) {
        case "PAID": return "bg-green-100 text-green-800 border-green-200";
        case "SHIPPED": return "bg-blue-100 text-blue-800 border-blue-200";
        case "COMPLETED": return "bg-black text-white border-black";
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
    <div className="flex flex-col gap-8">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-light tracking-widest uppercase mb-2 text-[#111111]">Orders ({orders.length})</h1>
          <p className="text-xs text-[#666666] tracking-wider">Monitor all incoming drops and payment states.</p>
        </div>
      </header>

      {/* REVENUE DASHBOARD */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white p-6 border border-[#e8e8e8] flex flex-col gap-2">
          <span className="text-[10px] tracking-[0.2em] text-[#666666] uppercase">Real Revenue</span>
          <span className="text-xl md:text-2xl font-light text-black tracking-wider">
             {new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(totalRevenue)}
          </span>
        </div>
        <div className="bg-white p-6 border border-[#e8e8e8] flex flex-col gap-2 relative overflow-hidden">
          <div className="absolute right-0 top-0 bottom-0 w-1 bg-yellow-400"></div>
          <span className="text-[10px] tracking-[0.2em] text-[#666666] uppercase">Active Reserved</span>
          <span className="text-xl md:text-2xl font-light text-black tracking-wider">{reservedCount}</span>
        </div>
        <div className="bg-white p-6 border border-[#e8e8e8] flex flex-col gap-2 relative overflow-hidden">
          <div className="absolute right-0 top-0 bottom-0 w-1 bg-gray-300"></div>
          <span className="text-[10px] tracking-[0.2em] text-[#666666] uppercase">Expired Drops</span>
          <span className="text-xl md:text-2xl font-light text-black tracking-wider">{expiredCount}</span>
        </div>
        <div className="bg-white p-6 border border-[#e8e8e8] flex flex-col gap-2">
          <span className="text-[10px] tracking-[0.2em] text-[#666666] uppercase">Checkout Conversion</span>
          <span className="text-xl md:text-2xl font-light text-black tracking-wider">{conversionRate}%</span>
        </div>
      </div>

      <form className="flex flex-col md:flex-row gap-4 bg-white p-4 border border-[#e8e8e8]">
        <input 
          type="text" 
          name="q" 
          defaultValue={q} 
          placeholder="Search by email..."
          className="border border-[#e8e8e8] px-3 py-2 text-sm w-full md:w-64 focus:outline-none focus:border-black"
        />
        <select name="lifecycle" defaultValue={lifecycle || "ALL"} className="border border-[#e8e8e8] px-3 py-2 text-sm focus:outline-none focus:border-black bg-white">
          <option value="ALL">All Lifecycle Status</option>
          <option value="RESERVED">RESERVED</option>
          <option value="PAID">PAID</option>
          <option value="SHIPPED">SHIPPED</option>
          <option value="COMPLETED">COMPLETED</option>
          <option value="FAILED">FAILED</option>
          <option value="EXPIRED">EXPIRED</option>
          <option value="REFUNDED">REFUNDED</option>
        </select>
        <select name="paymentStatus" defaultValue={paymentStatus || "ALL"} className="border border-[#e8e8e8] px-3 py-2 text-sm focus:outline-none focus:border-black bg-white">
          <option value="ALL">All Payment Status</option>
          <option value="UNPAID">UNPAID</option>
          <option value="PAID">PAID</option>
          <option value="FAILED">FAILED</option>
          <option value="REFUNDED">REFUNDED</option>
        </select>
        <select name="sort" defaultValue={sort} className="border border-[#e8e8e8] px-3 py-2 text-sm focus:outline-none focus:border-black bg-white">
          <option value="newest">Newest First</option>
          <option value="oldest">Oldest First</option>
        </select>
        <button type="submit" className="bg-black text-white px-6 py-2 text-xs uppercase tracking-widest hover:bg-gray-800 transition-colors">
          Filter
        </button>
        {(lifecycle || paymentStatus || q || sort !== "newest") && (
          <Link href="/admin/orders" className="flex items-center justify-center border border-[#e8e8e8] px-4 py-2 text-xs uppercase tracking-widest hover:bg-gray-50 text-gray-500">
            Clear
          </Link>
        )}
      </form>

      <div className="bg-[#ffffff] border border-[#e8e8e8] overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-[#e8e8e8] bg-[#fdfdfd]">
              <th className="p-4 text-[10px] tracking-widest text-[#666666] uppercase font-normal">Order ID & Date</th>
              <th className="p-4 text-[10px] tracking-widest text-[#666666] uppercase font-normal">Customer</th>
              <th className="p-4 text-[10px] tracking-widest text-[#666666] uppercase font-normal">Amount</th>
              <th className="p-4 text-[10px] tracking-widest text-[#666666] uppercase font-normal">Lifecycle</th>
              <th className="p-4 text-[10px] tracking-widest text-[#666666] uppercase font-normal">Payment</th>
              <th className="p-4 text-[10px] tracking-widest text-[#666666] uppercase font-normal">Qty</th>
              <th className="p-4 text-[10px] tracking-widest text-[#666666] uppercase font-normal text-right">Action</th>
            </tr>
          </thead>
          <tbody className="text-sm">
            {orders.length === 0 ? (
              <tr><td colSpan={7} className="p-8 text-center text-[#666666] text-xs tracking-widest">No orders found matching your criteria.</td></tr>
            ) : (
              orders.map((order) => (
                <tr key={order.id} className="border-b border-[#e8e8e8] hover:bg-[#fafafa] transition-colors">
                  <td className="p-4">
                    <div className="font-medium text-black">{order.id.split('-')[0].toUpperCase()}</div>
                    <div className="text-xs text-[#888888] mt-1">{order.createdAt.toLocaleString('id-ID')}</div>
                  </td>
                  <td className="p-4 text-[#333333]">{order.email}</td>
                  <td className="p-4 font-medium text-black">
                    {new Intl.NumberFormat('id-ID', { style: 'currency', currency: order.currency, maximumFractionDigits: 0 }).format(order.totalAmount)}
                  </td>
                  <td className="p-4">
                    <span className={`px-2 py-1 text-[10px] tracking-wider uppercase border ${getBadgeColor("lifecycle", order.lifecycle)}`}>{order.lifecycle}</span>
                  </td>
                  <td className="p-4">
                    <div className="flex flex-col gap-1 items-start">
                      <span className={`px-2 py-1 text-[10px] tracking-wider uppercase border ${getBadgeColor("payment", order.paymentStatus)}`}>{order.paymentStatus}</span>
                      {order.paymentTransactionId && (
                        <span className="text-[10px] text-gray-400 truncate max-w-[120px] font-mono" title={order.paymentTransactionId}>{order.paymentTransactionId}</span>
                      )}
                    </div>
                  </td>
                  <td className="p-4 text-[#666666] text-center">{order.quantity}</td>
                  <td className="p-4 text-right">
                    <Link href={`/admin/orders/${order.id}`} className="text-xs tracking-widest uppercase text-black border-b border-black pb-0.5 hover:text-gray-500 hover:border-gray-500 transition-colors">
                      View
                    </Link>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

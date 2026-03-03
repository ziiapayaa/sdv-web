import { prisma } from "@/lib/prisma";

export default async function AdminDashboard() {
  const [
    paidOrders,
    pendingOrders,
    failedOrders,
    refundedOrders,
    recentActivity
  ] = await Promise.all([
    prisma.order.count({ where: { lifecycle: "PAID" } }),
    prisma.order.count({ where: { lifecycle: "RESERVED" } }),
    prisma.order.count({ where: { lifecycle: { in: ["FAILED", "EXPIRED"] } } }),
    prisma.order.count({ where: { lifecycle: "REFUNDED" } }),
    prisma.order.findMany({
      orderBy: { createdAt: 'desc' },
      take: 5,
      select: { id: true, email: true, lifecycle: true, totalAmount: true, createdAt: true }
    })
  ]);

  return (
    <div className="flex flex-col gap-12">
      <header>
        <h1 className="text-2xl font-light tracking-widest uppercase mb-2 text-[#111111]">Dashboard</h1>
        <p className="text-xs text-[#666666] tracking-wider">Overview of your void.</p>
      </header>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
        <div className="border border-[#e8e8e8] p-6 bg-[#ffffff] shadow-sm">
          <h3 className="text-[10px] tracking-widest text-[#666666] uppercase mb-4">Paid Orders</h3>
          <p className="text-3xl font-light text-[#111111]">{paidOrders}</p>
        </div>
        <div className="border border-[#e8e8e8] p-6 bg-[#ffffff] shadow-sm">
          <h3 className="text-[10px] tracking-widest text-[#666666] uppercase mb-4">Pending (Reserved)</h3>
          <p className="text-3xl font-light text-[#111111]">{pendingOrders}</p>
        </div>
        <div className="border border-[#e8e8e8] p-6 bg-[#ffffff] shadow-sm">
          <h3 className="text-[10px] tracking-widest text-[#666666] uppercase mb-4">Failed / Expired</h3>
          <p className="text-3xl font-light text-[#111111]">{failedOrders}</p>
        </div>
        <div className="border border-[#e8e8e8] p-6 bg-[#ffffff] shadow-sm">
          <h3 className="text-[10px] tracking-widest text-[#666666] uppercase mb-4">Refunded</h3>
          <p className="text-3xl font-light text-[#111111]">{refundedOrders}</p>
        </div>
      </div>

      <div className="border border-[#e8e8e8] p-6 bg-[#ffffff] shadow-sm min-h-[400px]">
        <h3 className="text-[10px] tracking-widest text-[#666666] uppercase mb-6 border-b border-[#e8e8e8] pb-4">Recent Activity</h3>
        <div className="text-xs text-[#333333] tracking-wider flex flex-col gap-4">
          {recentActivity.length === 0 ? (
            <p>No recent activity found.</p>
          ) : (
            recentActivity.map((order) => (
              <p key={order.id}>
                » Order <span className="font-semibold">{order.id.split('-')[0]}</span> from {order.email} is currently <span className="font-semibold">{order.lifecycle}</span>.
              </p>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sysLogger } from "@/lib/logger";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  try {
    const authHeader = req.headers.get("authorization");
    const vercelCronHeader = req.headers.get("x-vercel-cron");
    const expectedSecret = process.env.CLEANUP_SECRET;

    // Phase 1: Authentication Matrix
    const isVercelCron = vercelCronHeader === "1";
    const isManualAuth = expectedSecret && authHeader === `Bearer ${expectedSecret}`;

    if (!isVercelCron && !isManualAuth) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Phase 3: UTC Time Safety
    const utcNow = new Date();

    const expiredOrders = await prisma.order.findMany({
      where: {
        lifecycle: "RESERVED",
        reservationExpiresAt: { lt: utcNow }
      }
    });

    if (expiredOrders.length === 0) {
      return NextResponse.json({ message: "No expired reservations found.", releasedCount: 0 });
    }

    let releasedCount = 0;

    for (const order of expiredOrders) {
      try {
        await prisma.$transaction(async (tx) => {
          // OCC: Atomically transition ONLY if still RESERVED
          const result = await tx.order.updateMany({
            where: { 
              id: order.id,
              lifecycle: "RESERVED"  // Database-level guard, not memory-level
            },
            data: { 
              lifecycle: "EXPIRED", 
              paymentStatus: "EXPIRED"
            }
          });

          // ONLY increment stock if we actually changed the lifecycle
          if (result.count === 0) {
            return; // Another process already handled this order
          }

          // Restore stock to the specific variant (per-size)
          if (order.size) {
            await tx.productVariant.updateMany({
              where: { productId: order.productId, size: order.size },
              data: { stock: { increment: order.quantity } }
            });
          }

          // Auto-revert SOLD_OUT → LIVE when stock is restored
          const remaining = await tx.productVariant.aggregate({
            where: { productId: order.productId },
            _sum: { stock: true }
          });
          const product = await tx.product.findUnique({ where: { id: order.productId }, select: { dropStatus: true } });
          if (product && product.dropStatus === "SOLD_OUT" && (remaining._sum.stock ?? 0) > 0) {
            await tx.product.update({
              where: { id: order.productId },
              data: { dropStatus: "LIVE" }
            });
          }
          
          sysLogger.info("RESERVATION_EXPIRED", order.id, { reason: "cleanup_cron" });
        });
        releasedCount++;
      } catch (error) {
        sysLogger.error("INVALID_LIFECYCLE_ATTEMPT", order.id, error, { raw: "Failed to release reservation" });
      }
    }

    sysLogger.info("CLEANUP_EXECUTED", null, { releasedCount });
    
    return NextResponse.json({ 
      message: "Cleanup complete.", 
      releasedCount 
    });

  } catch (error) {
    sysLogger.error("INVALID_LIFECYCLE_ATTEMPT", null, error, { raw: "Fatal Cleanup Error" });
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

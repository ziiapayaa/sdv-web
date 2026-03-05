import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { validateLifecycleTransition, InvalidLifecycleTransitionError } from "@/lib/lifecycle";
import { sysLogger } from "@/lib/logger";
import { requireAdmin } from "@/lib/auth-guard";
import { sendShippingNotification } from "@/lib/email";

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  // SECURITY: Server-side admin auth check
  const denied = await requireAdmin(req);
  if (denied) return denied;

  try {
    const { nextState, trackingNumber } = await req.json();

    const order = await prisma.order.findUnique({
      where: { id: params.id },
      include: { product: { select: { title: true } } }
    });

    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    // 1. Validate transition via centralized guard (for error messaging)
    validateLifecycleTransition(order.lifecycle, nextState);

    // 2. OCC: Atomically update ONLY if lifecycle matches expected state
    const result = await prisma.order.updateMany({
      where: { 
        id: params.id,
        lifecycle: order.lifecycle  // Must still be in the state we read
      },
      data: {
        lifecycle: nextState,
        trackingNumber: trackingNumber || undefined
      }
    });

    if (result.count === 0) {
      return NextResponse.json({ 
        error: "Order state was modified by another process. Please refresh and try again." 
      }, { status: 409 });
    }

    // Fetch updated order for response
    const updatedOrder = await prisma.order.findUnique({ where: { id: params.id } });

    if (nextState === "SHIPPED") {
      sysLogger.info("ORDER_SHIPPED", params.id, { trackingNumber });
      // Send shipping notification email (non-blocking)
      sendShippingNotification({
        id: order.id,
        email: order.email,
        name: order.name,
        productTitle: order.product?.title || "Your Order",
        trackingNumber: trackingNumber || "",
      }).catch(() => {});
    } else if (nextState === "COMPLETED") {
      sysLogger.info("ORDER_COMPLETED", params.id);
    }

    return NextResponse.json(updatedOrder);
  } catch (error) {
    if (error instanceof InvalidLifecycleTransitionError) {
      sysLogger.error("INVALID_LIFECYCLE_ATTEMPT", params.id, error, { source: "admin_panel" });
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    sysLogger.error("INVALID_LIFECYCLE_ATTEMPT", params.id, error, { raw: "Admin transition error" });
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

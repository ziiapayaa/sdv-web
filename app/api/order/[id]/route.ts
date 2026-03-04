import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

/**
 * POST /api/order/[id]
 * Requires { email } in body for ownership verification.
 * Returns limited order data (no full PII leak).
 * Returns 404 for non-matching to prevent enumeration.
 */
export async function POST(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const orderId = params.id;
    const body = await req.json();
    const { email } = body;

    if (!orderId) {
      return NextResponse.json({ error: "Order ID is required" }, { status: 400 });
    }

    if (!email || typeof email !== "string") {
      return NextResponse.json({ error: "Email is required for verification" }, { status: 400 });
    }

    // Clean up input in case they paste the '#' character
    const cleanOrderId = orderId.replace(/^#/, '').toLowerCase();

    // SECURITY: Ownership check — only return order if email matches
    const order = await prisma.order.findFirst({
      where: { 
        id: { startsWith: cleanOrderId }, // Allow short ID from email
        email: email
      },
      include: {
        product: {
          select: { title: true, images: true }
        }
      }
    });

    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    // Return only necessary fields — no full address or phone leak
    return NextResponse.json({
      id: order.id,
      name: order.name,
      email: order.email,
      lifecycle: order.lifecycle,
      paymentStatus: order.paymentStatus,
      totalAmount: order.totalAmount,
      currency: order.currency,
      reservationExpiresAt: order.reservationExpiresAt,
      trackingNumber: order.trackingNumber,
      createdAt: order.createdAt,
      product: order.product,
      // Include snap token for pending orders so user can resume payment
      ...(order.paymentStatus === "UNPAID" && order.paymentIntentId 
        ? { snapToken: order.paymentIntentId } 
        : {}),
    });
  } catch (error) {
    console.error("Fetch Order Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

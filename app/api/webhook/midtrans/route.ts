import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import crypto from "crypto";
import { sysLogger } from "@/lib/logger";
import { sendPaymentSuccess } from "@/lib/email";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { 
      order_id, 
      transaction_status, 
      status_code, 
      gross_amount, 
      signature_key, 
      fraud_status,
      transaction_id 
    } = body;
    
    // 1. Verify Signature Key — MANDATORY, no bypass
    const serverKey = process.env.MIDTRANS_SERVER_KEY;
    if (!serverKey) {
      sysLogger.error("INVALID_LIFECYCLE_ATTEMPT", null, new Error("MIDTRANS_SERVER_KEY not configured"));
      return NextResponse.json({ error: "Server configuration error" }, { status: 500 });
    }
    
    const rawString = `${order_id}${status_code}${gross_amount}${serverKey}`;
    const hash = crypto.createHash("sha512").update(rawString).digest("hex");

    if (hash !== signature_key) {
      sysLogger.error("INVALID_LIFECYCLE_ATTEMPT", order_id, new Error("Invalid webhook signature"), { 
        received: signature_key?.substring(0, 16) + "..." 
      });
      return NextResponse.json({ error: "Invalid signature" }, { status: 403 });
    }

    // 2. Identify transaction state
    const isSuccess = (transaction_status === 'capture' && fraud_status === 'accept') || 
                      transaction_status === 'settlement';
    const isFailed = transaction_status === 'cancel' || transaction_status === 'deny';
    const isExpired = transaction_status === 'expire';

    // 3. Process Transaction with OCC (Optimistic Concurrency Control)
    await prisma.$transaction(async (tx) => {
      const order = await tx.order.findUnique({
        where: { id: order_id }
      });

      if (!order) return;

      // Duplicate check by transaction_id
      if (order.paymentTransactionId === transaction_id && transaction_id) {
        sysLogger.info("WEBHOOK_DUPLICATE", order_id, { transaction_id });
        return; 
      }

      if (isSuccess) {
        if (order.lifecycle === "EXPIRED") {
          // LATE PAYMENT: User paid after reservation expired
          // Flag for manual review / auto-refund
          await tx.order.update({
            where: { id: order_id },
            data: {
              paymentStatus: "PAID",
              paymentTransactionId: transaction_id,
              // lifecycle stays EXPIRED — admin must review
            }
          });
          sysLogger.error("INVALID_LIFECYCLE_ATTEMPT", order_id, 
            new Error("Late payment received after expiry"), 
            { transaction_id, amount: gross_amount, action: "NEEDS_MANUAL_REFUND" }
          );
          return;
        }

        // OCC: Only transition if currently RESERVED
        const result = await tx.order.updateMany({
          where: { id: order_id, lifecycle: "RESERVED" },
          data: {
            lifecycle: "PAID",
            paymentStatus: "PAID",
            paymentTransactionId: transaction_id
          }
        });

        if (result.count === 0) {
          sysLogger.info("WEBHOOK_DUPLICATE", order_id, { 
            reason: "lifecycle not RESERVED", currentLifecycle: order.lifecycle 
          });
          return;
        }

        // Validate gross_amount matches order total
        if (parseInt(gross_amount) !== order.totalAmount) {
          sysLogger.error("INVALID_LIFECYCLE_ATTEMPT", order_id, 
            new Error("Amount mismatch"), 
            { expected: order.totalAmount, received: gross_amount }
          );
        }

        sysLogger.info("PAYMENT_CONFIRMED", order_id, { transaction_id, amount: gross_amount });

        // Send payment success email (non-blocking)
        sendPaymentSuccess({
          id: order.id,
          email: order.email,
          name: order.name,
          totalAmount: order.totalAmount,
          productTitle: order.productId, // Will use productId as fallback
        }).catch(() => {});

      } else if (isFailed || isExpired) {
        const nextState = isExpired ? "EXPIRED" : "FAILED";
        
        // OCC: Only transition if currently RESERVED
        const result = await tx.order.updateMany({
          where: { id: order_id, lifecycle: "RESERVED" },
          data: {
            lifecycle: nextState,
            paymentStatus: nextState,
            paymentTransactionId: transaction_id
          }
        });

        if (result.count === 0) {
          sysLogger.info("WEBHOOK_DUPLICATE", order_id, { 
            reason: "lifecycle not RESERVED", currentLifecycle: order.lifecycle 
          });
          return;
        }

        // ONLY increment stock if we actually changed the lifecycle
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
        
        if (isExpired) {
          sysLogger.info("RESERVATION_EXPIRED", order_id, { reason: "midtrans_expire" });
        } else {
          sysLogger.info("PAYMENT_FAILED", order_id, { reason: transaction_status });
        }
      }
    });

    return NextResponse.json({ message: "OK" }, { status: 200 });
  } catch (error) {
    sysLogger.error("INVALID_LIFECYCLE_ATTEMPT", null, error, { raw: "Webhook processing error" });
    // Always return 200 to prevent Midtrans infinite retries
    return NextResponse.json({ message: "Error processed" }, { status: 200 });
  }
}

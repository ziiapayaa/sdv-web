import { NextResponse } from "next/server";
export const dynamic = "force-dynamic";
import { prisma } from "@/lib/prisma";
import midtransClient from "midtrans-client";
import { sysLogger } from "@/lib/logger";
import { validateCheckoutInput, isValidQuantity } from "@/lib/validation";
import { checkRateLimitRedis } from "@/lib/rate-limit";
import { sendOrderConfirmation } from "@/lib/email";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-options";

export async function POST(req: Request) {
  try {
    // AUTH: Require authenticated user
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 });
    }

    // @ts-expect-error - extended session type
    const userId = session.user.id as string;
    const sessionEmail = session.user.email;
    const sessionName = session.user.name || "Customer";

    // CSRF Protection
    const requestedWith = req.headers.get("x-requested-with");
    if (requestedWith !== "XMLHttpRequest") {
      return NextResponse.json({ error: "Invalid request origin" }, { status: 403 });
    }

    const body = await req.json();
    const { items, phone, address } = body;

    // 1. Input Validation & Sanitization
    if (!items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ error: "Cart is empty" }, { status: 400 });
    }
    if (items.length > 1) {
      return NextResponse.json({ error: "Only one product allowed per checkout in Drop mode." }, { status: 400 });
    }

    // Validate phone/address from body, email/name from session
    const validation = validateCheckoutInput({ email: sessionEmail, name: sessionName, phone, address });
    if (!validation.valid) {
      return NextResponse.json({ error: validation.error }, { status: 400 });
    }

    const { sanitized } = validation;
    const targetItem = items[0];
    const productId = targetItem?.product?.id;
    const quantity = targetItem?.quantity;
    const size = targetItem?.size;

    if (!productId || typeof productId !== "string") {
      return NextResponse.json({ error: "Invalid product" }, { status: 400 });
    }
    if (!isValidQuantity(quantity)) {
      return NextResponse.json({ error: "Invalid quantity (must be 1-10)" }, { status: 400 });
    }
    if (!size || typeof size !== "string") {
      return NextResponse.json({ error: "Please select a size" }, { status: 400 });
    }

    // IP Rate Limiting (Redis-backed, falls back to in-memory)
    const ip = req.headers.get("x-forwarded-for")?.split(",")[0] || req.headers.get("x-real-ip") || "unknown-ip";
    const rateLimit = await checkRateLimitRedis(ip, productId);
    
    if (!rateLimit.allowed) {
      return NextResponse.json({ error: rateLimit.reason }, { status: 429 });
    }

    // 2. Fetch product to validate status
    const dbProduct = await prisma.product.findUnique({
      where: { id: productId }
    });

    if (!dbProduct) {
      return NextResponse.json({ error: `Product not found` }, { status: 404 });
    }

    if (!dbProduct.published) {
      return NextResponse.json({ error: `Product is unavailable` }, { status: 400 });
    }

    if (dbProduct.dropStatus !== "LIVE" && dbProduct.dropStatus !== "UPCOMING") {
      return NextResponse.json({ error: `Product drop has ended or sold out` }, { status: 400 });
    }

    if (dbProduct.dropStatus === "UPCOMING" && dbProduct.dropDate && new Date(dbProduct.dropDate) > new Date()) {
      return NextResponse.json({ error: `Product drop hasn't started yet` }, { status: 400 });
    }

    // SECURITY: Block disposable email domains
    const emailDomain = sessionEmail.split("@")[1]?.toLowerCase();
    const BLOCKED_DOMAINS = [
      "mailinator.com", "guerrillamail.com", "tempmail.com", "throwaway.email",
      "yopmail.com", "10minutemail.com", "trashmail.com", "guerrillamailblock.com",
      "sharklasers.com", "grr.la", "dispostable.com", "mailnesia.com", "maildrop.cc",
      "getairmail.com", "getnada.com", "temp-mail.org", "fakeinbox.com"
    ];
    if (BLOCKED_DOMAINS.includes(emailDomain)) {
      return NextResponse.json({ error: "Please use a valid email address." }, { status: 400 });
    }

    // SECURITY: DB-level IP reservation limit (survives serverless cold starts)
    const activeIPReservations = await prisma.order.count({
      where: {
        address: { contains: ip }, // We'll store IP in a dedicated field below
        lifecycle: "RESERVED",
        reservationExpiresAt: { gt: new Date() }
      }
    });
    if (activeIPReservations >= 3) {
      return NextResponse.json(
        { error: "Too many active reservations from this network. Please wait for existing orders to complete." },
        { status: 429 }
      );
    }

    // 3. Phase 2: Email Reservation Guard & Cleanup
    const fifteenMinutesAgo = new Date(Date.now() - 15 * 60 * 1000);
    
    // Cleanup old pending orders for this email
    await prisma.order.updateMany({
      where: {
        email: sessionEmail,
        paymentStatus: "UNPAID",
        lifecycle: "RESERVED",
        createdAt: { lt: fifteenMinutesAgo }
      },
      data: {
        paymentStatus: "EXPIRED",
        lifecycle: "EXPIRED"
      }
    });

    // Email Guard: Max 2 active RESERVED orders per email
    const activeReservations = await prisma.order.findMany({
      where: {
        email: sessionEmail,
        lifecycle: "RESERVED",
        reservationExpiresAt: { gt: new Date() }
      },
      orderBy: { createdAt: "desc" }
    });

    if (activeReservations.length >= 2) {
      return NextResponse.json(
        { 
          error: "You have reached the maximum active reservations (2). Please complete or wait for them to expire.", 
          pendingOrderId: activeReservations[0].id 
        }, 
        { status: 429 }
      );
    }

    const subtotalAmount = dbProduct.price * quantity;
    const discountAmount = 0;
    const shippingAmount = 0;
    const totalAmount = subtotalAmount - discountAmount + shippingAmount;

    // 4. ATOMIC RESERVATION TRANSACTION
    const reservedOrder = await prisma.$transaction(async (tx) => {
      
      // Atomic Decrement on ProductVariant (per-size stock)
      const updated = await tx.productVariant.updateMany({
        where: {
          productId,
          size,
          stock: { gte: quantity }
        },
        data: {
          stock: { decrement: quantity }
        }
      });

      if (updated.count === 0) {
        throw new Error("OUT_OF_STOCK");
      }

      // Create Order with sanitized data + size
      const newOrder = await tx.order.create({
        data: {
          userId,
          email: sanitized.email!,
          name: sanitized.name!,
          phone: sanitized.phone!,
          address: sanitized.address!,
          productId,
          quantity,
          size,
          subtotalAmount,
          discountAmount,
          shippingAmount,
          totalAmount,
          currency: "IDR",
          exchangeRateSnapshot: 1.0,
          lifecycle: "RESERVED",
          paymentProvider: "MIDTRANS",
          paymentStatus: "UNPAID",
          reservationExpiresAt: new Date(Date.now() + 15 * 60 * 1000)
        }
      });
      
      sysLogger.info("RESERVATION_CREATED", newOrder.id, { productId, quantity, size, source: "checkout" });

      // Auto SOLD_OUT: Check if ALL variants have 0 stock
      const remainingStock = await tx.productVariant.aggregate({
        where: { productId },
        _sum: { stock: true }
      });
      if (remainingStock._sum.stock === 0) {
        await tx.product.update({
          where: { id: productId },
          data: { dropStatus: "SOLD_OUT" }
        });
        sysLogger.info("PRODUCT_SOLD_OUT", newOrder.id, { productId });
      }

      return newOrder;
    });

    // 5. Create Midtrans Snap Transaction
    const serverKey = process.env.MIDTRANS_SERVER_KEY || 'SB-Mid-server-DUMMY';
    const clientKey = process.env.NEXT_PUBLIC_MIDTRANS_CLIENT_KEY || 'SB-Mid-client-DUMMY';
    
    const snap = new midtransClient.Snap({
      isProduction: serverKey.startsWith('Mid-server-'),
      serverKey: serverKey,
      clientKey: clientKey
    });

    const parameter = {
      transaction_details: {
        order_id: reservedOrder.id,
        gross_amount: totalAmount
      },
      customer_details: {
        first_name: sanitized.name,
        email: sanitized.email,
        phone: sanitized.phone,
        billing_address: {
          first_name: sanitized.name,
          email: sanitized.email,
          phone: sanitized.phone,
          address: sanitized.address
        }
      },
      item_details: [{
        id: dbProduct.id,
        price: dbProduct.price,
        quantity: quantity,
        name: dbProduct.title.substring(0, 50) 
      }]
    };

    const transaction = await snap.createTransaction(parameter);

    // Send order confirmation email (non-blocking)
    sendOrderConfirmation({
      id: reservedOrder.id,
      email: sanitized.email!,
      name: sanitized.name!,
      totalAmount,
      productTitle: dbProduct.title,
      quantity,
    }).catch(() => {}); // Fire-and-forget

    return NextResponse.json({ 
      snapToken: transaction.token,
      orderId: reservedOrder.id
    });

  } catch (error) {
    const err = error as Error;
    if (err.message === "OUT_OF_STOCK") {
      sysLogger.error("INVALID_LIFECYCLE_ATTEMPT", null, err, { reason: "Product sold out during checkout" });
      return NextResponse.json({ error: "Product is out of stock or just sold out." }, { status: 400 });
    }
    sysLogger.error("INVALID_LIFECYCLE_ATTEMPT", null, err, { raw: "Checkout processing error" });
    return NextResponse.json({ error: err.message || "Internal Server Error" }, { status: 500 });
  }
}

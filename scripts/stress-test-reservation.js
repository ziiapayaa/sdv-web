const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

async function runTest() {
  console.log("Preparing Concurrency Stress Test...");
  
  // 1. Setup Test Product
  let product = await prisma.product.findFirst();
  if (!product) {
      product = await prisma.product.create({
          data: {
              title: "Test Reservation Drop",
              slug: "test-res-drop",
              description: "Testing drop",
              price: 150000,
              stock: 1,
              published: true,
              isLimited: true,
              dropStatus: "LIVE"
          }
      });
  } else {
      product = await prisma.product.update({
          where: { id: product.id },
          data: { stock: 1, dropStatus: "LIVE", published: true }
      });
  }
  
  // Clean related orders so we have a clean slate for this product
  await prisma.order.deleteMany({
      where: { productId: product.id }
  });

  console.log(`\n--- PHASE 1: RESERVATION CONCURRENCY ---`);
  console.log(`Starting stock: ${product.stock}`);
  console.log(`Firing 50 concurrent checkout attempts...`);

  const reservationAttempts = Array.from({ length: 50 }).map(async (_, i) => {
      try {
          // Exactly matching the Checkout API transaction
          const reservedOrder = await prisma.$transaction(async (tx) => {
              const updated = await tx.product.updateMany({
                  where: {
                      id: product.id,
                      stock: { gte: 1 }
                  },
                  data: {
                      stock: { decrement: 1 }
                  }
              });

              if (updated.count === 0) {
                  throw new Error("OUT_OF_STOCK");
              }

              return await tx.order.create({
                  data: {
                      email: `test${i}@stress.com`,
                      name: `Test ${i}`,
                      phone: "0800000",
                      address: "Stress St",
                      productId: product.id,
                      quantity: 1,
                      subtotalAmount: product.price,
                      totalAmount: product.price,
                      currency: "IDR",
                      lifecycle: "RESERVED",
                      paymentProvider: "MIDTRANS",
                      paymentStatus: "UNPAID",
                      reservationExpiresAt: new Date(Date.now() + 15 * 60 * 1000)
                  }
              });
          });
          return { success: true, order: reservedOrder };
      } catch (e) {
          return { success: false, error: e.message };
      }
  });

  const reservationResults = await Promise.all(reservationAttempts);
  
  const successfulReservations = reservationResults.filter(r => r.success);
  const failedReservations = reservationResults.filter(r => !r.success);
  const outOfStockErrors = failedReservations.filter(r => r.error === "OUT_OF_STOCK").length;

  console.log(`Successful Reservations: ${successfulReservations.length}`);
  console.log(`Failed (Out of Stock): ${outOfStockErrors}`);

  const midStock = (await prisma.product.findUnique({ where: { id: product.id } })).stock;
  console.log(`Stock after reservations: ${midStock}`);
  
  if (successfulReservations.length === 0) {
      console.log("CRITICAL ERROR: No successful reservations found.");
      return;
  }

  const winningOrder = successfulReservations[0].order;

  console.log(`\n--- PHASE 2: WEBHOOK IDEMPOTENCY ---`);
  console.log(`Firing 50 concurrent Webhook Confirmations for Order ${winningOrder.id.split('-')[0]}...`);

  // Webhook payload mock matching exact Midtrans body
  const webhookAttempts = Array.from({ length: 50 }).map(async (_, i) => {
      try {
          return await prisma.$transaction(async (tx) => {
              const order = await tx.order.findUnique({
                  where: { id: winningOrder.id }
              });

              if (!order) return { success: false, msg: "not_found" };

              // Idempotent guard
              if (order.lifecycle === "PAID" || order.lifecycle === "FAILED" || order.lifecycle === "EXPIRED" || order.lifecycle === "REFUNDED") {
                  return { success: false, msg: "already_processed" };
              }
              if (order.lifecycle !== "RESERVED") {
                  return { success: false, msg: "not_reserved" };
              }

              // Confirm PAYMENT
              await tx.order.update({
                  where: { id: winningOrder.id },
                  data: {
                      lifecycle: "PAID",
                      paymentStatus: "PAID",
                      paymentTransactionId: `midtrans-mock-seq-${i}` // Last one to write this wins
                  }
              });
              
              return { success: true, msg: "confirmed" };
          });
      } catch (e) {
          return { success: false, msg: e.message };
      }
  });

  const webhookResults = await Promise.all(webhookAttempts);
  
  const successfulWebhooks = webhookResults.filter(r => r.success);
  const processedWebhooks = webhookResults.filter(r => !r.success && r.msg === "already_processed");

  console.log(`Successfully Processed Initial Webhooks: ${successfulWebhooks.length}`);
  console.log(`Idempotently Blocked Retries: ${processedWebhooks.length}`);

  const finalStock = (await prisma.product.findUnique({ where: { id: product.id } })).stock;
  const finalOrder = await prisma.order.findUnique({ where: { id: winningOrder.id } });

  console.log(`\n--- FINAL AUDIT ---`);
  console.log(`Total RESERVED active: ${await prisma.order.count({ where: { productId: product.id, lifecycle: "RESERVED" }})}`);
  console.log(`Total PAID active: ${await prisma.order.count({ where: { productId: product.id, lifecycle: "PAID" }})}`);
  console.log(`Final Stock: ${finalStock}`);
  console.log(`Winning PaymentTransactionId: ${finalOrder.paymentTransactionId}`);

}

runTest()
  .then(() => prisma.$disconnect())
  .catch(async (e) => {
      console.error(e);
      await prisma.$disconnect();
      process.exit(1);
  });

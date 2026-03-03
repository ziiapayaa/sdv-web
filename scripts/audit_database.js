// Force IPv4 loopback to avoid Node 18+ IPv6 connection refused bug on Windows
process.env.DATABASE_URL = "postgresql://postgres:root@127.0.0.1:5432/societe_du_vide?schema=public";
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function runAudit() {
  console.log("========================================");
  console.log("STEP 1 - DATABASE STATE AUDIT");
  console.log("========================================");
  
  // 1. Order Status Counts
  const orderStatusCounts = await prisma.order.groupBy({
    by: ['status', 'paymentStatus'],
    _count: {
      id: true,
    },
  });
  console.log("1. Order Status Metrics:");
  console.log(JSON.stringify(orderStatusCounts, null, 2));

  // 2. Orders for Stress Test
  const testProduct = await prisma.product.findUnique({
    where: { slug: 'stress-test-item' },
    include: {
      orderItems: {
        include: {
          order: true
        }
      }
    }
  });

  console.log("\n2. Orders linked to 'stress-test-item':");
  if (testProduct && testProduct.orderItems) {
    const orders = testProduct.orderItems.map(item => ({
      id: item.order.id,
      email: item.order.email,
      status: item.order.status,
      paymentStatus: item.order.paymentStatus,
      transactionId: item.order.transactionId,
      createdAt: item.order.createdAt
    }));
    console.log(JSON.stringify(orders, null, 2));
  } else {
    console.log("No orders found for the test product.");
  }

  // 3. Test Product Status
  console.log("\n3. Product 'Stress Test' Status:");
  if (testProduct) {
    console.log(JSON.stringify({
      title: testProduct.title,
      stock: testProduct.stock,
      dropStatus: testProduct.dropStatus,
      published: testProduct.published
    }, null, 2));
  } else {
    console.log("Product not found.");
  }

  await prisma.$disconnect();
}

runAudit().catch(console.error);

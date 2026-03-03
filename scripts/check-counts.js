const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function run() {
  const products = await prisma.product.count();
  const orders = await prisma.order.count();
  
  const distinctStatuses = await prisma.order.groupBy({
    by: ['status', 'paymentStatus'],
    _count: true
  });
  
  console.log("Product count:", products);
  console.log("Order count:", orders);
  console.log("Distinct Lifecycle & PaymentStatus:");
  console.log(JSON.stringify(distinctStatuses, null, 2));
}

run().finally(() => prisma.$disconnect());

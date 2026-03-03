const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function prepareTest() {
  console.log("Preparing environment for Drop Stress Test...");
  
  // 1. Clear old pending orders to start clean
  await prisma.order.deleteMany({
    where: {
      status: "PENDING"
    }
  });
  console.log("Cleaned up existing pending orders");

  // 2. Prepare a test product with exactly 1 stock
  const testProduct = await prisma.product.upsert({
    where: { slug: 'stress-test-item' },
    update: {
      stock: 1,
      dropStatus: 'LIVE',
      published: true,
      price: 1000000
    },
    create: {
      title: 'Stress Test Limited Drop',
      slug: 'stress-test-item',
      description: 'Used for concurrency load testing',
      price: 1000000,
      stock: 1,
      dropStatus: 'LIVE',
      published: true
    }
  });

  console.log("Test product ready:", testProduct.title, "- Stock:", testProduct.stock);
  
  await prisma.$disconnect();
}

prepareTest().catch(console.error);

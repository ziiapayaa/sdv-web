const { PrismaClient } = require('@prisma/client');
const fs = require('fs/promises');
const path = require('path');

async function main() {
  const prisma = new PrismaClient();
  const dir = path.join(process.cwd(), 'public', 'uploads', 'products');
  
  let files = [];
  try {
    files = await fs.readdir(dir);
  } catch (e) {
    console.log("No uploads dir found.");
  }

  const dbImages = await prisma.productImage.findMany();
  const dbUrls = dbImages.map(img => img.url.replace('/uploads/products/', ''));

  let orphans = [];
  let totalSize = 0;
  for (const file of files) {
    const stat = await fs.stat(path.join(dir, file));
    totalSize += stat.size;
    if (!dbUrls.includes(file)) {
      orphans.push(file);
    }
  }

  console.log('STORAGE REPORT:');
  console.log(`Folder size: ${(totalSize / 1024 / 1024).toFixed(2)} MB`);
  console.log(`Total files physical: ${files.length}`);
  console.log(`Orphan files physical: ${orphans.length}`);

  // check for orphaned records
  let dbOrphans = [];
  for (const url of dbUrls) {
    if (!files.includes(url) && !url.includes('placehold.co') && !url.startsWith('http')) {
      dbOrphans.push(url);
    }
  }
  console.log(`Orphan DB records (missing files): ${dbOrphans.length}`);

  console.log('\nCLEANING ORPHANS...');
  for (const orphan of orphans) {
    await fs.unlink(path.join(dir, orphan));
    console.log(`DELETED physical file: ${orphan}`);
  }

  for (const dbOrphan of dbOrphans) {
    await prisma.productImage.deleteMany({
      where: { url: { contains: dbOrphan } }
    });
    console.log(`DELETED DB record for string: ${dbOrphan}`);
  }

  console.log('\n--- CLEANUP COMPLETE ---');
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    const prisma = new PrismaClient();
    await prisma.$disconnect();
  });

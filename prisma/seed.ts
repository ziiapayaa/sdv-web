import { PrismaClient, DropStatus, Prisma } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  // Create Admin
  const hashedPassword = await bcrypt.hash('password123', 10)
  
  await prisma.user.upsert({
    where: { email: 'societeduvide@gmail.com' },
    update: {},
    create: {
      email: 'societeduvide@gmail.com',
      password: hashedPassword,
      name: 'SDV Admin',
      role: 'ADMIN',
    },
  })

  // Create Collection
  const collection = await prisma.collection.upsert({
    where: { slug: 'collection-01' },
    update: {},
    create: {
      title: 'Collection 01',
      slug: 'collection-01',
      description: 'The intellectual approach to form.',
      published: true,
    },
  })

  // Create Products
  const products = [
    {
      title: 'STRUCTURED BLAZER / 01',
      slug: 'structured-blazer-01',
      description: 'A structured piece designed to impose intellectual presence. Cut from heavy virgin wool.',
      price: 2500000, // IDR
      stock: 50,
      published: true,
      collectionId: collection.id,
      isLimited: true,
      dropStatus: 'LIVE' as DropStatus,
      images: {
        create: [
          { url: 'https://placehold.co/600x800/png?text=Blazer+01', isPrimary: true },
          { url: 'https://placehold.co/600x800/png?text=Blazer+02', isPrimary: false }
        ]
      }
    },
    {
      title: 'FLUID TROUSERS / 02',
      slug: 'fluid-trousers-02',
      description: 'Wide-leg trousers that create tension between rigidity and movement.',
      price: 1200000, // IDR
      stock: 100,
      published: true,
      collectionId: collection.id,
      isLimited: true,
      dropStatus: 'UPCOMING' as DropStatus,
      dropDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // Drop in 7 days
      images: {
        create: [
          { url: 'https://placehold.co/600x800/png?text=Trousers+01', isPrimary: true }
        ]
      }
    }
  ]

  for (const product of products) {
    await prisma.product.upsert({
      where: { slug: product.slug },
      update: {},
      create: product,
    })
  }

  // Create Manifesto
  await prisma.manifesto.create({
    data: {
      content: 'In a world accelerating towards noise, we choose to design the silence. SOCIÉTÉ DU VIDE is not merely a label, but a study in reduction.'
    }
  })

  console.log('Database seeded successfully!')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })

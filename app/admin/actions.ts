"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { DropStatus } from "@prisma/client";
import { unlink } from "fs/promises";
import { join } from "path";

// Helper to safely delete file
async function safeDeleteFile(url: string) {
  if (!url.startsWith("/uploads/products/")) return;
  
  try {
    const filePath = join(process.cwd(), "public", url);
    const validDir = join(process.cwd(), "public", "uploads", "products");
    
    // Prevent directory traversal attacks
    if (filePath.startsWith(validDir)) {
      await unlink(filePath);
    }
  } catch (error) {
    // Ignore ENOENT (file not found) to prevent crashes if it was already deleted
    if ((error as any).code !== "ENOENT") {
      console.error(`Failed to delete physical file: ${url}`, error);
    }
  }
}

export async function toggleProductPublish(id: string, currentStatus: boolean) {
  await prisma.product.update({
    where: { id },
    data: { published: !currentStatus },
  });
  revalidatePath("/", "layout");
}

export async function deleteProduct(id: string) {
  // Find product and images first
  const product = await prisma.product.findUnique({
    where: { id },
    include: { images: true }
  });

  if (product && product.images.length > 0) {
    for (const img of product.images) {
      await safeDeleteFile(img.url);
    }
  }

  await prisma.product.delete({
    where: { id },
  });
  
  revalidatePath("/", "layout");
}

export async function upsertProduct(formData: FormData, productId?: string) {
  const title = formData.get("title") as string;
  const slug = formData.get("slug") as string;
  const description = formData.get("description") as string;
  
  // Price formatting: remove dots, then parseInt
  const rawPriceStr = formData.get("price") as string;
  const price = parseInt(rawPriceStr.replace(/\./g, ""), 10);
  
  const collectionId = formData.get("collectionId") as string || null;
  const published = formData.get("published") === "on";
  
  const isLimited = formData.get("isLimited") === "on";
  const dropDateStr = formData.get("dropDate") as string;
  const dropDate = dropDateStr ? new Date(dropDateStr) : null;
  const dropStatus = formData.get("dropStatus") as DropStatus;

  // Parse per-size stock variants
  const SIZES = ["S", "M", "L", "XL"];
  const variants = SIZES.map(size => ({
    size,
    stock: parseInt(formData.get(`variant_${size}`) as string || "0", 10)
  })).filter(v => v.stock >= 0);

  // Basic validation
  if (!title || !slug || isNaN(price)) {
    throw new Error("Missing or invalid required fields");
  }

  if (price < 0) throw new Error("Price cannot be negative");

  // Get dynamic image URLs from form (images_0, images_1, etc.)
  const processedImages = [];
  const primaryIndex = parseInt(formData.get("primaryImageIndex") as string, 10) || 0;
  
  let i = 0;
  while (formData.has(`images_${i}`)) {
    const url = formData.get(`images_${i}`) as string;
    if (url) {
      processedImages.push({
        url,
        isPrimary: i === primaryIndex
      });
    }
    i++;
  }

  // Fallback if no images provided
  if (processedImages.length === 0) {
    processedImages.push({
      url: "https://placehold.co/600x800/png?text=Product+Image",
      isPrimary: true
    });
  }

  const baseData = {
    title,
    slug,
    description,
    price,
    published,
    collectionId,
    isLimited,
    dropDate,
    dropStatus,
  };

  if (productId) {
    // Identify which images are removed
    const existingProduct = await prisma.product.findUnique({
      where: { id: productId },
      include: { images: true }
    });

    if (existingProduct) {
      const newUrls = processedImages.map(img => img.url);
      const imagesToDelete = existingProduct.images.filter(img => !newUrls.includes(img.url));

      for (const img of imagesToDelete) {
        await safeDeleteFile(img.url);
      }
    }

    // Update operations
    await prisma.product.update({
      where: { id: productId },
      data: {
        ...baseData,
        images: {
          deleteMany: {},
          create: processedImages
        },
        variants: {
          deleteMany: {},
          create: variants
        }
      },
    });
  } else {
    await prisma.product.create({
      data: {
        ...baseData,
        images: {
          create: processedImages
        },
        variants: {
          create: variants
        }
      },
    });
  }

  revalidatePath("/", "layout");
  redirect("/admin/products");
}

export async function upsertCollection(formData: FormData, collectionId?: string) {
  const title = formData.get("title") as string;
  const slug = formData.get("slug") as string;
  const description = formData.get("description") as string;
  const published = formData.get("published") === "on";

  if (!title || !slug) {
    throw new Error("Missing required fields: Title and Slug");
  }

  const data = {
    title,
    slug,
    description,
    published,
  };

  if (collectionId) {
    await prisma.collection.update({
      where: { id: collectionId },
      data,
    });
  } else {
    await prisma.collection.create({
      data,
    });
  }

  revalidatePath("/admin/collections");
  revalidatePath("/collections");
  redirect("/admin/collections");
}

export async function deleteCollection(id: string) {
  await prisma.collection.delete({
    where: { id },
  });
  revalidatePath("/admin/collections");
  revalidatePath("/collections");
}

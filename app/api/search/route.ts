import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const query = searchParams.get("q")?.trim();

    if (!query || query.length < 2) {
      return NextResponse.json({ products: [] });
    }

    const products = await prisma.product.findMany({
      where: {
        published: true,
        OR: [
          { title: { contains: query, mode: "insensitive" } },
          { description: { contains: query, mode: "insensitive" } },
        ]
      },
      include: {
        images: { where: { isPrimary: true }, take: 1 },
        collection: { select: { title: true } }
      },
      take: 12,
      orderBy: { createdAt: "desc" }
    });

    return NextResponse.json({ products });
  } catch (error) {
    console.error("Search Error:", error);
    return NextResponse.json({ products: [] });
  }
}

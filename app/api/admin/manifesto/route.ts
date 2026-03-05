import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth-guard";
import { deleteFromCloudinary } from "@/lib/cloudinary";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const manifesto = await prisma.manifesto.findFirst();
    return NextResponse.json(manifesto);
  } catch (error) {
    console.error("GET Manifesto Error:", error);
    return NextResponse.json({ error: "Failed to fetch manifesto" }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  // SECURITY: Server-side admin auth check
  const denied = await requireAdmin(req);
  if (denied) return denied;

  try {
    const data = await req.json();
    const { content, craftContent, imageUrl } = data;

    const existing = await prisma.manifesto.findFirst();

    let manifesto;
    if (existing) {
      if (existing.imageUrl && existing.imageUrl !== imageUrl) {
        await deleteFromCloudinary(existing.imageUrl);
      }

      manifesto = await prisma.manifesto.update({
        where: { id: existing.id },
        data: { content, craftContent, imageUrl },
      });
    } else {
      manifesto = await prisma.manifesto.create({
        data: { content, craftContent, imageUrl },
      });
    }

    return NextResponse.json(manifesto);
  } catch (error) {
    console.error("PUT Manifesto Error:", error);
    return NextResponse.json({ error: "Failed to update manifesto" }, { status: 500 });
  }
}

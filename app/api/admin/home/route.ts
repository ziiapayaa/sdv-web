import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth-guard";
import { deleteFromCloudinary } from "@/lib/cloudinary";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    let homeSettings = await prisma.homeSettings.findFirst();
    if (!homeSettings) {
      homeSettings = await prisma.homeSettings.create({
        data: {
          heroTitle: "SOCIÉTÉ DU VIDE",
          heroSubtitle: "The Intellectual Approach to Form",
          manifestoQuote: "In a world accelerating towards noise, we choose to design the silence.",
          manifestoDescription: "SOCIÉTÉ DU VIDE is not merely a label, but a study in reduction. We remove the unnecessary to reveal the essential. Our garments are quiet companions for the intellectual mind—structured yet fluid, confident yet understated.",
        }
      });
    }
    return NextResponse.json(homeSettings);
  } catch (error) {
    console.error("GET HomeSettings Error:", error);
    return NextResponse.json({ error: "Failed to fetch home settings" }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  // SECURITY: Server-side admin auth check
  const denied = await requireAdmin(req);
  if (denied) return denied;

  try {
    const data = await req.json();
    const { heroTitle, heroSubtitle, heroVideoUrl, heroImageUrl, manifestoQuote, manifestoDescription } = data;

    const existing = await prisma.homeSettings.findFirst();

    let settings;
    if (existing) {
      // Automatic cleanup: Delete old media from Cloudinary if the URL was changed
      if (existing.heroVideoUrl && existing.heroVideoUrl !== heroVideoUrl) {
        await deleteFromCloudinary(existing.heroVideoUrl);
      }
      if (existing.heroImageUrl && existing.heroImageUrl !== heroImageUrl) {
        await deleteFromCloudinary(existing.heroImageUrl);
      }

      settings = await prisma.homeSettings.update({
        where: { id: existing.id },
        data: { heroTitle, heroSubtitle, heroVideoUrl, heroImageUrl, manifestoQuote, manifestoDescription },
      });
    } else {
      settings = await prisma.homeSettings.create({
        data: { heroTitle, heroSubtitle, heroVideoUrl, heroImageUrl, manifestoQuote, manifestoDescription },
      });
    }

    return NextResponse.json(settings);
  } catch (error) {
    console.error("PUT HomeSettings Error:", error);
    return NextResponse.json(
      { error: "Failed to update home settings", details: error instanceof Error ? error.message : String(error) }, 
      { status: 500 }
    );
  }
}

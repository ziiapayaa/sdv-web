import { NextResponse } from "next/server";
import { v2 as cloudinary } from "cloudinary";
import { requireAdmin } from "@/lib/auth-guard";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  // SECURITY: Server-side admin auth check
  const denied = await requireAdmin(request);
  if (denied) return denied;

  try {
    cloudinary.config({
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
      api_key: process.env.CLOUDINARY_API_KEY,
      api_secret: process.env.CLOUDINARY_API_SECRET,
    });

    const timestamp = Math.round(new Date().getTime() / 1000);
    const { folder } = await request.json();

    const signature = cloudinary.utils.api_sign_request(
      {
        timestamp,
        folder: `sdv/${folder || 'home'}`,
      },
      process.env.CLOUDINARY_API_SECRET!
    );

    return NextResponse.json({
      timestamp,
      signature,
      apiKey: process.env.CLOUDINARY_API_KEY,
      cloudName: process.env.CLOUDINARY_CLOUD_NAME,
      folder: `sdv/${folder || 'home'}`
    });
  } catch (error) {
    console.error("Signature generation error:", error);
    return NextResponse.json({ error: "Failed to generate upload signature" }, { status: 500 });
  }
}

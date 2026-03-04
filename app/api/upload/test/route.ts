import { NextResponse } from "next/server";
import { v2 as cloudinary } from "cloudinary";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const cloud_name = process.env.CLOUDINARY_CLOUD_NAME;
    const api_key = process.env.CLOUDINARY_API_KEY;
    const api_secret = process.env.CLOUDINARY_API_SECRET;

    // Show partial values for debugging (safe - only first/last 3 chars)
    const mask = (s?: string) => s ? `${s.slice(0, 3)}...${s.slice(-3)} (len=${s.length})` : "MISSING";

    const envInfo = {
      CLOUDINARY_CLOUD_NAME: cloud_name || "MISSING",
      CLOUDINARY_API_KEY: mask(api_key),
      CLOUDINARY_API_SECRET: mask(api_secret),
    };

    if (!cloud_name || !api_key || !api_secret) {
      return NextResponse.json({ status: "FAIL", error: "Missing env vars", envInfo }, { status: 500 });
    }

    cloudinary.config({ cloud_name, api_key, api_secret });

    // Try uploading a tiny 1x1 pixel PNG instead of ping (more reliable test)
    const tinyPng = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==";
    
    const result = await cloudinary.uploader.upload(tinyPng, {
      folder: "sdv/test",
      public_id: "connectivity-test",
      overwrite: true,
    });

    // Clean up test image
    await cloudinary.uploader.destroy("sdv/test/connectivity-test").catch(() => {});

    return NextResponse.json({
      status: "OK",
      message: "Cloudinary upload works!",
      test_url: result.secure_url,
      envInfo,
    });
  } catch (error: unknown) {
    const cloud_name = process.env.CLOUDINARY_CLOUD_NAME;
    const api_key = process.env.CLOUDINARY_API_KEY;
    const api_secret = process.env.CLOUDINARY_API_SECRET;
    const mask = (s?: string) => s ? `${s.slice(0, 3)}...${s.slice(-3)} (len=${s.length})` : "MISSING";

    return NextResponse.json({
      status: "FAIL",
      error: String(error),
      message: (error as Error)?.message || "No message",
      name: (error as Error)?.name || "No name",
      envInfo: {
        CLOUDINARY_CLOUD_NAME: cloud_name || "MISSING",
        CLOUDINARY_API_KEY: mask(api_key),
        CLOUDINARY_API_SECRET: mask(api_secret),
      },
      raw: JSON.stringify(error, Object.getOwnPropertyNames(error as object)),
    }, { status: 500 });
  }
}

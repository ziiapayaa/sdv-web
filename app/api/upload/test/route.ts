import { NextResponse } from "next/server";
import { v2 as cloudinary } from "cloudinary";

export const dynamic = "force-dynamic";

/**
 * GET /api/upload/test
 * Diagnostic endpoint to test Cloudinary connectivity.
 * Remove this file after debugging is complete.
 */
export async function GET() {
  try {
    const cloud_name = process.env.CLOUDINARY_CLOUD_NAME;
    const api_key = process.env.CLOUDINARY_API_KEY;
    const api_secret = process.env.CLOUDINARY_API_SECRET;

    // Check env vars
    if (!cloud_name || !api_key || !api_secret) {
      return NextResponse.json({
        status: "FAIL",
        error: "Missing environment variables",
        details: {
          CLOUDINARY_CLOUD_NAME: cloud_name ? "SET" : "MISSING",
          CLOUDINARY_API_KEY: api_key ? "SET" : "MISSING",
          CLOUDINARY_API_SECRET: api_secret ? "SET" : "MISSING",
        }
      }, { status: 500 });
    }

    cloudinary.config({ cloud_name, api_key, api_secret });

    // Try a simple API ping
    const result = await cloudinary.api.ping();

    return NextResponse.json({
      status: "OK",
      message: "Cloudinary connection successful!",
      ping: result,
      cloud_name: cloud_name,
    });
  } catch (error: unknown) {
    const err = error as Error & { http_code?: number };
    return NextResponse.json({
      status: "FAIL",
      error: err.message || "Unknown error",
      http_code: err.http_code,
      full_error: JSON.stringify(error, Object.getOwnPropertyNames(error as object)),
    }, { status: 500 });
  }
}

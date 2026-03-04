import { NextResponse } from "next/server";
import nodemailer from "nodemailer";

export const dynamic = "force-dynamic";

/**
 * GET /api/auth/forgot-password/test
 * Diagnostic: test SMTP connectivity from Vercel.
 * DELETE THIS FILE after debugging!
 */
export async function GET() {
  const host = process.env.SMTP_HOST;
  const port = process.env.SMTP_PORT;
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;
  const from = process.env.SMTP_FROM;

  const mask = (s?: string) => s ? `${s.slice(0, 3)}...${s.slice(-3)} (len=${s.length})` : "MISSING";

  const envInfo = {
    SMTP_HOST: host || "MISSING",
    SMTP_PORT: port || "MISSING",
    SMTP_USER: user || "MISSING",
    SMTP_PASS: mask(pass),
    SMTP_FROM: from || "MISSING",
  };

  if (!host || !user || !pass) {
    return NextResponse.json({ status: "FAIL", error: "Missing SMTP env vars", envInfo }, { status: 500 });
  }

  try {
    const transporter = nodemailer.createTransport({
      host,
      port: parseInt(port || "587"),
      secure: port === "465",
      auth: { user, pass },
    });

    // Test connection
    await transporter.verify();

    return NextResponse.json({
      status: "OK",
      message: "SMTP connection successful! Email should work.",
      envInfo,
    });
  } catch (error: unknown) {
    const err = error as Error;
    return NextResponse.json({
      status: "FAIL",
      error: err.message || "Unknown error",
      code: (err as any).code,
      envInfo,
    }, { status: 500 });
  }
}

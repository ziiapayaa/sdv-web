import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import crypto from "crypto";
import { sendPasswordResetEmail } from "@/lib/email";
import { isValidEmail, sanitizeString } from "@/lib/validation";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const email = sanitizeString(body.email || "").toLowerCase();

    if (!email || !isValidEmail(email)) {
      // Don't reveal whether email exists — always return success
      return NextResponse.json({ message: "Jika email terdaftar, link reset password telah dikirim." });
    }

    // Check if user exists
    const user = await prisma.user.findUnique({ where: { email } });
    
    if (!user) {
      // Don't reveal — return same success message
      return NextResponse.json({ message: "Jika email terdaftar, link reset password telah dikirim." });
    }

    // Delete any existing token for this email
    await prisma.passwordResetToken.deleteMany({ where: { email } });

    // Generate secure token
    const rawToken = crypto.randomBytes(32).toString("hex");
    const hashedToken = crypto.createHash("sha256").update(rawToken).digest("hex");

    // Store hashed token (expires in 1 hour)
    await prisma.passwordResetToken.create({
      data: {
        email,
        token: hashedToken,
        expiresAt: new Date(Date.now() + 60 * 60 * 1000), // 1 hour
      },
    });

    // Build reset URL using the actual request host (most reliable)
    const { headers } = await import("next/headers");
    const host = headers().get("host") || "localhost:3000";
    const protocol = host.includes("localhost") ? "http" : "https";
    const baseUrl = `${protocol}://${host}`;
    const resetUrl = `${baseUrl}/reset-password?token=${rawToken}&email=${encodeURIComponent(email)}`;

    await sendPasswordResetEmail({
      email,
      name: user.name || "User",
      resetUrl,
    });

    return NextResponse.json({ message: "Jika email terdaftar, link reset password telah dikirim." });
  } catch (error) {
    console.error("[FORGOT-PASSWORD]", error);
    return NextResponse.json({ error: "Terjadi kesalahan. Coba lagi." }, { status: 500 });
  }
}

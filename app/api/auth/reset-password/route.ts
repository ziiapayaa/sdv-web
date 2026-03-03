import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import { sanitizeString } from "@/lib/validation";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { token, email, password, confirmPassword } = body;

    if (!token || !email || !password || !confirmPassword) {
      return NextResponse.json({ error: "Semua field wajib diisi." }, { status: 400 });
    }

    if (password.length < 8) {
      return NextResponse.json({ error: "Password minimal 8 karakter." }, { status: 400 });
    }

    if (password !== confirmPassword) {
      return NextResponse.json({ error: "Password dan konfirmasi tidak cocok." }, { status: 400 });
    }

    const cleanEmail = sanitizeString(email).toLowerCase();

    // Hash the incoming token to compare with stored hash
    const hashedToken = crypto.createHash("sha256").update(token).digest("hex");

    // Find the token in DB
    const resetToken = await prisma.passwordResetToken.findUnique({
      where: { token: hashedToken }
    });

    if (!resetToken) {
      return NextResponse.json({ error: "Token tidak valid atau sudah digunakan." }, { status: 400 });
    }

    // Check expiry
    if (resetToken.expiresAt < new Date()) {
      await prisma.passwordResetToken.delete({ where: { id: resetToken.id } });
      return NextResponse.json({ error: "Token sudah expired. Silakan minta reset ulang." }, { status: 400 });
    }

    // Check email matches
    if (resetToken.email !== cleanEmail) {
      return NextResponse.json({ error: "Token tidak valid." }, { status: 400 });
    }

    // Hash new password and update user
    const hashedPassword = await bcrypt.hash(password, 10);

    await prisma.user.update({
      where: { email: cleanEmail },
      data: { password: hashedPassword }
    });

    // Delete the used token
    await prisma.passwordResetToken.delete({ where: { id: resetToken.id } });

    return NextResponse.json({ message: "Password berhasil direset. Silakan login." });
  } catch (error) {
    console.error("[RESET-PASSWORD]", error);
    return NextResponse.json({ error: "Terjadi kesalahan. Coba lagi." }, { status: 500 });
  }
}

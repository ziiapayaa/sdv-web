import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { sanitizeString, isValidEmail } from "@/lib/validation";
import { checkRateLimitRedis } from "@/lib/rate-limit";

export async function POST(req: Request) {
  try {
    const ip = req.headers.get("x-forwarded-for") || "unknown-register";
    const rateLimit = await checkRateLimitRedis(`register:${ip}`);
    if (!rateLimit.allowed) {
      return NextResponse.json({ error: rateLimit.reason }, { status: 429 });
    }

    const body = await req.json();
    const { name, email, password, confirmPassword } = body;

    // 1. Validate input
    if (!name || !email || !password || !confirmPassword) {
      return NextResponse.json({ error: "Semua field wajib diisi." }, { status: 400 });
    }

    const cleanName = sanitizeString(name);
    const cleanEmail = sanitizeString(email).toLowerCase();

    if (!isValidEmail(cleanEmail)) {
      return NextResponse.json({ error: "Invalid email format." }, { status: 400 });
    }

    if (cleanName.length < 2 || cleanName.length > 100) {
      return NextResponse.json({ error: "Nama harus 2-100 karakter." }, { status: 400 });
    }

    if (password.length < 8) {
      return NextResponse.json({ error: "Password minimal 8 karakter." }, { status: 400 });
    }

    if (password !== confirmPassword) {
      return NextResponse.json({ error: "Password dan konfirmasi tidak cocok." }, { status: 400 });
    }

    // 2. Check if email already registered
    const existing = await prisma.user.findUnique({
      where: { email: cleanEmail }
    });

    if (existing) {
      return NextResponse.json({ error: "Email is already registered." }, { status: 409 });
    }

    // 3. Hash password & create user
    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        email: cleanEmail,
        name: cleanName,
        password: hashedPassword,
        role: "CUSTOMER",
      },
    });

    return NextResponse.json({
      message: "Account created successfully.",
      user: { id: user.id, email: user.email, name: user.name },
    }, { status: 201 });

  } catch (error) {
    console.error("[REGISTER]", error);
    return NextResponse.json({ error: "Something went wrong. Please try again." }, { status: 500 });
  }
}

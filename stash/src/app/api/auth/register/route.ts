import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { randomBytes } from "crypto";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { sendVerificationEmail } from "@/lib/email";

const Body = z.object({
  email: z.string().email().transform((s) => s.toLowerCase().trim()),
  password: z.string().min(8).max(200),
  name: z.string().max(80).optional(),
});

export async function POST(req: NextRequest) {
  let body: z.infer<typeof Body>;
  try {
    body = Body.parse(await req.json());
  } catch (e: any) {
    return NextResponse.json({ error: "Invalid input" }, { status: 400 });
  }

  const existing = await prisma.user.findUnique({ where: { email: body.email } });
  if (existing) {
    if (existing.emailVerified) {
      return NextResponse.json(
        { error: "An account with this email already exists." },
        { status: 409 },
      );
    }
    // Re-send verification for an unverified account.
    const token = randomBytes(32).toString("hex");
    await prisma.verificationToken.create({
      data: {
        userId: existing.id,
        token,
        expires: new Date(Date.now() + 24 * 60 * 60 * 1000),
      },
    });
    const link = `${process.env.AUTH_URL || "http://localhost:3000"}/verify?token=${token}`;
    await sendVerificationEmail(existing.email, link);
    return NextResponse.json({ ok: true, resent: true });
  }

  const passwordHash = await bcrypt.hash(body.password, 10);
  const user = await prisma.user.create({
    data: { email: body.email, name: body.name, passwordHash },
  });

  const token = randomBytes(32).toString("hex");
  await prisma.verificationToken.create({
    data: {
      userId: user.id,
      token,
      expires: new Date(Date.now() + 24 * 60 * 60 * 1000),
    },
  });
  const link = `${process.env.AUTH_URL || "http://localhost:3000"}/verify?token=${token}`;
  await sendVerificationEmail(user.email, link);

  return NextResponse.json({ ok: true });
}

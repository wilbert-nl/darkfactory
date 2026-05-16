import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const token = req.nextUrl.searchParams.get("token");
  if (!token) return NextResponse.json({ error: "Missing token" }, { status: 400 });

  const record = await prisma.verificationToken.findUnique({ where: { token } });
  if (!record) return NextResponse.json({ error: "Invalid token" }, { status: 400 });
  if (record.expires < new Date()) {
    await prisma.verificationToken.delete({ where: { id: record.id } });
    return NextResponse.json({ error: "Token expired" }, { status: 400 });
  }

  await prisma.$transaction([
    prisma.user.update({
      where: { id: record.userId },
      data: { emailVerified: new Date() },
    }),
    prisma.verificationToken.delete({ where: { id: record.id } }),
  ]);

  return NextResponse.json({ ok: true });
}

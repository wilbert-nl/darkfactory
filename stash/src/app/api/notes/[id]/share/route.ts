import { NextRequest, NextResponse } from "next/server";
import { randomBytes } from "crypto";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(_: NextRequest, ctx: { params: { id: string } }) {
  const session = await auth();
  const userId = (session?.user as any)?.id as string | undefined;
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const note = await prisma.note.findUnique({ where: { id: ctx.params.id } });
  if (!note || note.userId !== userId) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const token = note.shareToken || randomBytes(16).toString("hex");
  const updated = await prisma.note.update({
    where: { id: note.id },
    data: { isPublic: true, shareToken: token },
  });
  return NextResponse.json({ note: updated, url: `/s/${token}` });
}

export async function DELETE(_: NextRequest, ctx: { params: { id: string } }) {
  const session = await auth();
  const userId = (session?.user as any)?.id as string | undefined;
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const note = await prisma.note.findUnique({ where: { id: ctx.params.id } });
  if (!note || note.userId !== userId) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  const updated = await prisma.note.update({
    where: { id: note.id },
    data: { isPublic: false },
  });
  return NextResponse.json({ note: updated });
}

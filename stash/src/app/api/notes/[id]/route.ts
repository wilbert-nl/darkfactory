import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const Patch = z.object({
  title: z.string().min(1).max(300).optional(),
  summary: z.string().max(500).optional(),
  content: z.string().max(20000).optional(),
  folderId: z.string().nullable().optional(),
});

async function requireOwner(userId: string, id: string) {
  const note = await prisma.note.findUnique({ where: { id } });
  if (!note || note.userId !== userId) return null;
  return note;
}

export async function GET(_: NextRequest, ctx: { params: { id: string } }) {
  const session = await auth();
  const userId = (session?.user as any)?.id as string | undefined;
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const note = await requireOwner(userId, ctx.params.id);
  if (!note) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json({ note });
}

export async function PATCH(req: NextRequest, ctx: { params: { id: string } }) {
  const session = await auth();
  const userId = (session?.user as any)?.id as string | undefined;
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const note = await requireOwner(userId, ctx.params.id);
  if (!note) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const patch = Patch.parse(await req.json());

  if (patch.folderId) {
    const f = await prisma.folder.findUnique({ where: { id: patch.folderId } });
    if (!f || f.userId !== userId) {
      return NextResponse.json({ error: "Invalid folder" }, { status: 400 });
    }
  }

  const updated = await prisma.note.update({
    where: { id: note.id },
    data: patch,
  });
  return NextResponse.json({ note: updated });
}

export async function DELETE(_: NextRequest, ctx: { params: { id: string } }) {
  const session = await auth();
  const userId = (session?.user as any)?.id as string | undefined;
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const note = await requireOwner(userId, ctx.params.id);
  if (!note) return NextResponse.json({ error: "Not found" }, { status: 404 });
  await prisma.note.delete({ where: { id: note.id } });
  return NextResponse.json({ ok: true });
}

import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const Patch = z.object({
  name: z.string().min(1).max(60).optional(),
  color: z.string().max(20).optional(),
  position: z.number().int().optional(),
});

async function requireOwner(userId: string, id: string) {
  const f = await prisma.folder.findUnique({ where: { id } });
  if (!f || f.userId !== userId) return null;
  return f;
}

export async function PATCH(req: NextRequest, ctx: { params: { id: string } }) {
  const session = await auth();
  const userId = (session?.user as any)?.id as string | undefined;
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const folder = await requireOwner(userId, ctx.params.id);
  if (!folder) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const patch = Patch.parse(await req.json());
  try {
    const updated = await prisma.folder.update({ where: { id: folder.id }, data: patch });
    return NextResponse.json({ folder: updated });
  } catch (e: any) {
    if (e?.code === "P2002") {
      return NextResponse.json({ error: "Folder name already exists" }, { status: 409 });
    }
    throw e;
  }
}

export async function DELETE(_: NextRequest, ctx: { params: { id: string } }) {
  const session = await auth();
  const userId = (session?.user as any)?.id as string | undefined;
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const folder = await requireOwner(userId, ctx.params.id);
  if (!folder) return NextResponse.json({ error: "Not found" }, { status: 404 });
  // Notes have folderId set to null on delete (schema: onDelete: SetNull).
  await prisma.folder.delete({ where: { id: folder.id } });
  return NextResponse.json({ ok: true });
}

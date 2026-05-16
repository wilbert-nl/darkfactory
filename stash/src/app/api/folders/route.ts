import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await auth();
  const userId = (session?.user as any)?.id as string | undefined;
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const folders = await prisma.folder.findMany({
    where: { userId },
    orderBy: { position: "asc" },
    include: { _count: { select: { notes: true } } },
  });
  return NextResponse.json({ folders });
}

const Create = z.object({
  name: z.string().min(1).max(60),
  color: z.string().max(20).optional(),
});

export async function POST(req: NextRequest) {
  const session = await auth();
  const userId = (session?.user as any)?.id as string | undefined;
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = Create.parse(await req.json());
  const count = await prisma.folder.count({ where: { userId } });

  try {
    const folder = await prisma.folder.create({
      data: { userId, name: body.name, color: body.color, position: count },
    });
    return NextResponse.json({ folder });
  } catch (e: any) {
    if (e?.code === "P2002") {
      return NextResponse.json({ error: "Folder name already exists" }, { status: 409 });
    }
    throw e;
  }
}

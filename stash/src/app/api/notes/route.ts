import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const session = await auth();
  const userId = (session?.user as any)?.id as string | undefined;
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const folderId = req.nextUrl.searchParams.get("folderId");
  const notes = await prisma.note.findMany({
    where: { userId, ...(folderId ? { folderId } : {}) },
    orderBy: { updatedAt: "desc" },
    take: 200,
  });
  return NextResponse.json({ notes });
}

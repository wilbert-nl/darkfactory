import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const session = await auth();
  const userId = (session?.user as any)?.id as string | undefined;
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const q = (req.nextUrl.searchParams.get("q") || "").trim();
  if (!q) return NextResponse.json({ notes: [] });

  // SQLite LIKE search across title, summary, content. Case-insensitive via lower().
  const needle = `%${q.toLowerCase()}%`;
  const notes = await prisma.$queryRaw<
    Array<{
      id: string;
      title: string;
      summary: string | null;
      folderId: string | null;
      updatedAt: Date;
    }>
  >`
    SELECT id, title, summary, folderId, updatedAt
    FROM Note
    WHERE userId = ${userId}
      AND (
        lower(title) LIKE ${needle}
        OR lower(coalesce(summary, '')) LIKE ${needle}
        OR lower(content) LIKE ${needle}
      )
    ORDER BY updatedAt DESC
    LIMIT 100
  `;

  return NextResponse.json({ notes });
}

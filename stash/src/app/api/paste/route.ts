import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { categorize } from "@/lib/ai";
import { extractFirstUrl, fetchUrlPreview } from "@/lib/fetch-url";

const Body = z.object({
  content: z.string().min(1).max(20000),
});

export async function POST(req: NextRequest) {
  const session = await auth();
  const userId = (session?.user as any)?.id as string | undefined;
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  let body: z.infer<typeof Body>;
  try {
    body = Body.parse(await req.json());
  } catch {
    return NextResponse.json({ error: "Invalid input" }, { status: 400 });
  }

  const url = extractFirstUrl(body.content);
  const preview = url ? await fetchUrlPreview(url) : null;

  const folders = await prisma.folder.findMany({
    where: { userId },
    select: { id: true, name: true },
    orderBy: { position: "asc" },
  });

  const result = await categorize({
    pastedText: body.content,
    link: preview
      ? {
          url: preview.url,
          pageTitle: preview.title,
          pageDescription: preview.description,
          pageText: preview.text,
        }
      : undefined,
    existingFolders: folders.map((f) => f.name),
  });

  // Resolve or create folder.
  let folder = folders.find(
    (f) => f.name.toLowerCase() === result.folderName.toLowerCase(),
  );
  if (!folder) {
    folder = await prisma.folder.create({
      data: {
        userId,
        name: result.folderName,
        position: folders.length,
      },
      select: { id: true, name: true },
    });
  }

  const note = await prisma.note.create({
    data: {
      userId,
      folderId: folder.id,
      title: result.title,
      summary: result.summary,
      content: body.content,
      url: url ?? undefined,
    },
  });

  return NextResponse.json({
    note,
    folder,
    suggestion: {
      folderName: result.folderName,
      isNewFolder: result.isNewFolder,
      confidence: result.confidence,
    },
  });
}

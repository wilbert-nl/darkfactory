import { notFound } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NoteEditor } from "@/components/NoteEditor";

export default async function NotePage({ params }: { params: { id: string } }) {
  const session = await auth();
  const userId = (session!.user as any).id as string;

  const note = await prisma.note.findUnique({ where: { id: params.id } });
  if (!note || note.userId !== userId) notFound();

  const folders = await prisma.folder.findMany({
    where: { userId },
    orderBy: { position: "asc" },
    select: { id: true, name: true },
  });

  return <NoteEditor note={note} folders={folders} />;
}

import Link from "next/link";
import { notFound } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { FolderHeader } from "@/components/FolderHeader";

export default async function FolderPage({ params }: { params: { id: string } }) {
  const session = await auth();
  const userId = (session!.user as any).id as string;

  const folder = await prisma.folder.findUnique({ where: { id: params.id } });
  if (!folder || folder.userId !== userId) notFound();

  const notes = await prisma.note.findMany({
    where: { userId, folderId: folder.id },
    orderBy: { updatedAt: "desc" },
  });

  return (
    <div className="space-y-6">
      <FolderHeader folder={folder} />
      {notes.length === 0 ? (
        <p className="text-sm text-muted">No notes in this folder yet.</p>
      ) : (
        <ul className="space-y-2">
          {notes.map((n) => (
            <li key={n.id} className="card p-3">
              <Link href={`/app/notes/${n.id}`} className="block">
                <div className="font-medium">{n.title}</div>
                {n.summary && (
                  <p className="mt-1 line-clamp-2 text-sm text-muted">{n.summary}</p>
                )}
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

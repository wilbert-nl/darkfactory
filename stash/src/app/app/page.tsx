import Link from "next/link";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { PasteBox } from "@/components/PasteBox";

export default async function AppHome() {
  const session = await auth();
  const userId = (session!.user as any).id as string;

  const [folders, recent] = await Promise.all([
    prisma.folder.findMany({
      where: { userId },
      orderBy: { position: "asc" },
      include: { _count: { select: { notes: true } } },
    }),
    prisma.note.findMany({
      where: { userId },
      orderBy: { updatedAt: "desc" },
      take: 10,
      include: { folder: true },
    }),
  ]);

  return (
    <div className="space-y-8">
      <section>
        <PasteBox />
      </section>

      <section>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-muted">
            Folders
          </h2>
          <NewFolderButton />
        </div>
        {folders.length === 0 ? (
          <p className="text-sm text-muted">
            No folders yet. Paste something — Stash will create the first one.
          </p>
        ) : (
          <div className="flex flex-wrap gap-2">
            {folders.map((f) => (
              <Link
                key={f.id}
                href={`/app/folders/${f.id}`}
                className="folder-chip hover:bg-[#252c3c]"
              >
                <span>{f.name}</span>
                <span className="text-muted">{f._count.notes}</span>
              </Link>
            ))}
          </div>
        )}
      </section>

      <section>
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-muted">
          Recent
        </h2>
        {recent.length === 0 ? (
          <p className="text-sm text-muted">Nothing stashed yet.</p>
        ) : (
          <ul className="space-y-2">
            {recent.map((n) => (
              <li key={n.id} className="card p-3">
                <Link href={`/app/notes/${n.id}`} className="block">
                  <div className="flex items-baseline justify-between gap-3">
                    <span className="font-medium">{n.title}</span>
                    <span className="shrink-0 text-xs text-muted">
                      {n.folder?.name ?? "Unfiled"}
                    </span>
                  </div>
                  {n.summary && (
                    <p className="mt-1 line-clamp-2 text-sm text-muted">
                      {n.summary}
                    </p>
                  )}
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}

import { NewFolderButton } from "@/components/NewFolderButton";

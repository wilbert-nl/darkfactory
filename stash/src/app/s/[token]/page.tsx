import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function SharedNote({ params }: { params: { token: string } }) {
  const note = await prisma.note.findUnique({
    where: { shareToken: params.token },
    include: { user: { select: { name: true } } },
  });
  if (!note || !note.isPublic) notFound();

  return (
    <main className="mx-auto max-w-2xl px-6 py-12">
      <p className="text-xs uppercase tracking-wider text-muted">
        Shared via Stash
      </p>
      <h1 className="mt-2 text-3xl font-semibold">{note.title}</h1>
      {note.summary && (
        <p className="mt-3 text-muted">{note.summary}</p>
      )}
      {note.url && (
        <p className="mt-3 text-sm">
          <a className="text-accent underline" href={note.url} target="_blank" rel="noreferrer">
            {note.url}
          </a>
        </p>
      )}
      <hr className="my-6 border-line" />
      <pre className="whitespace-pre-wrap text-sm">{note.content}</pre>
      <p className="mt-10 text-xs text-muted">
        Shared by {note.user.name || "someone"} ·{" "}
        {note.updatedAt.toLocaleDateString()}
      </p>
    </main>
  );
}

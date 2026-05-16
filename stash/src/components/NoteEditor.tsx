"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

type Note = {
  id: string;
  title: string;
  summary: string | null;
  content: string;
  url: string | null;
  folderId: string | null;
  isPublic: boolean;
  shareToken: string | null;
};

export function NoteEditor({
  note,
  folders,
}: {
  note: Note;
  folders: { id: string; name: string }[];
}) {
  const [title, setTitle] = useState(note.title);
  const [summary, setSummary] = useState(note.summary || "");
  const [content, setContent] = useState(note.content);
  const [folderId, setFolderId] = useState(note.folderId ?? "");
  const [isPublic, setIsPublic] = useState(note.isPublic);
  const [shareToken, setShareToken] = useState(note.shareToken);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const router = useRouter();

  async function save() {
    setBusy(true);
    setMsg(null);
    const res = await fetch(`/api/notes/${note.id}`, {
      method: "PATCH",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        title,
        summary,
        content,
        folderId: folderId || null,
      }),
    });
    setBusy(false);
    if (res.ok) {
      setMsg("Saved");
      router.refresh();
    } else {
      setMsg("Save failed");
    }
  }

  async function remove() {
    if (!confirm("Delete this note?")) return;
    const res = await fetch(`/api/notes/${note.id}`, { method: "DELETE" });
    if (res.ok) router.push("/app");
  }

  async function toggleShare() {
    if (isPublic) {
      const res = await fetch(`/api/notes/${note.id}/share`, { method: "DELETE" });
      if (res.ok) {
        setIsPublic(false);
        setMsg("Sharing disabled");
      }
    } else {
      const res = await fetch(`/api/notes/${note.id}/share`, { method: "POST" });
      if (res.ok) {
        const j = await res.json();
        setIsPublic(true);
        setShareToken(j.note.shareToken);
        setMsg("Sharing enabled");
      }
    }
  }

  const shareUrl =
    isPublic && shareToken
      ? `${typeof window !== "undefined" ? window.location.origin : ""}/s/${shareToken}`
      : null;

  return (
    <div className="space-y-4">
      <input
        className="input text-xl font-semibold"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="Title"
      />
      <input
        className="input"
        value={summary}
        onChange={(e) => setSummary(e.target.value)}
        placeholder="One-line summary"
      />
      <div className="flex items-center gap-2 text-sm">
        <span className="text-muted">Folder:</span>
        <select
          className="input max-w-xs"
          value={folderId}
          onChange={(e) => setFolderId(e.target.value)}
        >
          <option value="">Unfiled</option>
          {folders.map((f) => (
            <option key={f.id} value={f.id}>
              {f.name}
            </option>
          ))}
        </select>
      </div>
      {note.url && (
        <p className="text-sm">
          <span className="text-muted">Source: </span>
          <a className="text-accent underline" href={note.url} target="_blank" rel="noreferrer">
            {note.url}
          </a>
        </p>
      )}
      <textarea
        className="textarea min-h-[260px] font-mono text-sm"
        value={content}
        onChange={(e) => setContent(e.target.value)}
      />

      <div className="flex flex-wrap items-center gap-2">
        <button className="btn btn-primary" onClick={save} disabled={busy}>
          {busy ? "Saving…" : "Save"}
        </button>
        <button className="btn" onClick={toggleShare}>
          {isPublic ? "Make private" : "Share publicly"}
        </button>
        <button className="btn" onClick={remove}>
          Delete
        </button>
        {msg && <span className="text-sm text-muted">{msg}</span>}
      </div>

      {shareUrl && (
        <div className="card p-3 text-sm">
          <div className="text-muted">Public link:</div>
          <div className="mt-1 flex items-center gap-2">
            <code className="break-all">{shareUrl}</code>
            <button
              className="btn text-xs"
              onClick={() => navigator.clipboard.writeText(shareUrl)}
            >
              Copy
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

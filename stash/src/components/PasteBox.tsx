"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

export function PasteBox() {
  const [content, setContent] = useState("");
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const router = useRouter();

  async function submit() {
    if (!content.trim()) return;
    setBusy(true);
    setMsg(null);
    const res = await fetch("/api/paste", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ content }),
    });
    setBusy(false);
    if (!res.ok) {
      setMsg("Could not save. Try again.");
      return;
    }
    const json = await res.json();
    setMsg(
      json.suggestion.isNewFolder
        ? `Saved to new folder “${json.folder.name}”`
        : `Saved to “${json.folder.name}”`,
    );
    setContent("");
    router.refresh();
  }

  return (
    <div className="card p-4">
      <textarea
        className="textarea min-h-[120px]"
        placeholder="Paste a link or any text…"
        value={content}
        onChange={(e) => setContent(e.target.value)}
        onKeyDown={(e) => {
          if ((e.metaKey || e.ctrlKey) && e.key === "Enter") submit();
        }}
      />
      <div className="mt-3 flex items-center justify-between">
        <span className="text-xs text-muted">
          {msg ?? "Tip: ⌘/Ctrl + Enter to stash"}
        </span>
        <button className="btn btn-primary" onClick={submit} disabled={busy}>
          {busy ? "Stashing…" : "Stash it"}
        </button>
      </div>
    </div>
  );
}

"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

export function NewFolderButton() {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [err, setErr] = useState<string | null>(null);
  const router = useRouter();

  async function create() {
    setErr(null);
    const res = await fetch("/api/folders", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ name }),
    });
    const j = await res.json();
    if (!res.ok) {
      setErr(j.error || "Failed");
      return;
    }
    setName("");
    setOpen(false);
    router.refresh();
  }

  if (!open) {
    return (
      <button className="btn text-xs" onClick={() => setOpen(true)}>
        + New folder
      </button>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <input
        className="input text-sm"
        placeholder="Folder name"
        value={name}
        onChange={(e) => setName(e.target.value)}
        autoFocus
        onKeyDown={(e) => {
          if (e.key === "Enter") create();
          if (e.key === "Escape") setOpen(false);
        }}
      />
      <button className="btn btn-primary text-xs" onClick={create}>
        Create
      </button>
      <button className="btn text-xs" onClick={() => setOpen(false)}>
        Cancel
      </button>
      {err && <span className="text-xs text-red-400">{err}</span>}
    </div>
  );
}

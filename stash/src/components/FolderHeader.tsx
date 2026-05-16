"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

export function FolderHeader({
  folder,
}: {
  folder: { id: string; name: string };
}) {
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(folder.name);
  const [busy, setBusy] = useState(false);
  const router = useRouter();

  async function save() {
    setBusy(true);
    const res = await fetch(`/api/folders/${folder.id}`, {
      method: "PATCH",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ name }),
    });
    setBusy(false);
    if (res.ok) {
      setEditing(false);
      router.refresh();
    }
  }

  async function remove() {
    if (!confirm("Delete this folder? Notes inside it will be unfiled.")) return;
    const res = await fetch(`/api/folders/${folder.id}`, { method: "DELETE" });
    if (res.ok) router.push("/app");
  }

  return (
    <div className="flex items-center justify-between">
      {editing ? (
        <div className="flex items-center gap-2">
          <input
            className="input"
            value={name}
            onChange={(e) => setName(e.target.value)}
            autoFocus
          />
          <button className="btn btn-primary" onClick={save} disabled={busy}>
            Save
          </button>
          <button className="btn" onClick={() => setEditing(false)}>
            Cancel
          </button>
        </div>
      ) : (
        <h1 className="text-2xl font-semibold">{folder.name}</h1>
      )}
      {!editing && (
        <div className="flex gap-2">
          <button className="btn text-sm" onClick={() => setEditing(true)}>
            Rename
          </button>
          <button className="btn text-sm" onClick={remove}>
            Delete
          </button>
        </div>
      )}
    </div>
  );
}

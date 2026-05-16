"use client";
import { useState } from "react";
import Link from "next/link";

type Hit = {
  id: string;
  title: string;
  summary: string | null;
  updatedAt: string;
};

export default function SearchPage() {
  const [q, setQ] = useState("");
  const [hits, setHits] = useState<Hit[]>([]);
  const [busy, setBusy] = useState(false);
  const [searched, setSearched] = useState(false);

  async function run() {
    if (!q.trim()) return;
    setBusy(true);
    const res = await fetch(`/api/search?q=${encodeURIComponent(q)}`);
    setBusy(false);
    setSearched(true);
    if (res.ok) {
      const j = await res.json();
      setHits(j.notes);
    }
  }

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold">Search</h1>
      <div className="flex gap-2">
        <input
          className="input"
          placeholder="Search title, summary, or content…"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && run()}
          autoFocus
        />
        <button className="btn btn-primary" onClick={run} disabled={busy}>
          {busy ? "Searching…" : "Search"}
        </button>
      </div>
      {searched && hits.length === 0 && !busy && (
        <p className="text-sm text-muted">No matches.</p>
      )}
      <ul className="space-y-2">
        {hits.map((n) => (
          <li key={n.id} className="card p-3">
            <Link href={`/app/notes/${n.id}`}>
              <div className="font-medium">{n.title}</div>
              {n.summary && (
                <p className="mt-1 line-clamp-2 text-sm text-muted">{n.summary}</p>
              )}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

"use client";
import { useEffect, useState } from "react";
import Link from "next/link";

export default function VerifyPage() {
  const [status, setStatus] = useState<"loading" | "ok" | "error">("loading");
  const [msg, setMsg] = useState("");

  useEffect(() => {
    const token = new URLSearchParams(window.location.search).get("token");
    if (!token) {
      setStatus("error");
      setMsg("Missing token.");
      return;
    }
    fetch(`/api/auth/verify?token=${encodeURIComponent(token)}`)
      .then(async (r) => {
        const j = await r.json();
        if (r.ok) {
          setStatus("ok");
        } else {
          setStatus("error");
          setMsg(j.error || "Verification failed.");
        }
      })
      .catch(() => {
        setStatus("error");
        setMsg("Network error.");
      });
  }, []);

  return (
    <main className="mx-auto max-w-sm px-6 py-16">
      {status === "loading" && <p className="text-sm text-muted">Verifying…</p>}
      {status === "ok" && (
        <>
          <h1 className="text-2xl font-semibold">Email verified ✓</h1>
          <p className="mt-3 text-sm text-muted">You can sign in now.</p>
          <Link href="/login" className="btn btn-primary mt-6 inline-block">Sign in</Link>
        </>
      )}
      {status === "error" && (
        <>
          <h1 className="text-2xl font-semibold">Verification failed</h1>
          <p className="mt-3 text-sm text-red-400">{msg}</p>
          <Link href="/register" className="btn mt-6 inline-block">Try registering again</Link>
        </>
      )}
    </main>
  );
}

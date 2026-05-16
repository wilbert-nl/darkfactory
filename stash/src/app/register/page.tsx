"use client";
import { useState } from "react";
import Link from "next/link";

export default function RegisterPage() {
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState<string | null>(null);
  const [done, setDone] = useState(false);
  const [busy, setBusy] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErr(null);
    setBusy(true);
    const res = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ email, name, password }),
    });
    setBusy(false);
    const json = await res.json();
    if (!res.ok) {
      setErr(json.error || "Something went wrong");
      return;
    }
    setDone(true);
  }

  if (done) {
    return (
      <main className="mx-auto max-w-sm px-6 py-16">
        <h1 className="text-2xl font-semibold">Check your email</h1>
        <p className="mt-3 text-sm text-muted">
          We sent a verification link to <strong>{email}</strong>. Click it to
          activate your account.
        </p>
        <p className="mt-3 text-xs text-muted">
          (In dev with no SMTP configured, the link is printed to your server console.)
        </p>
        <Link href="/login" className="btn mt-6 inline-block">Back to sign in</Link>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-sm px-6 py-16">
      <h1 className="text-2xl font-semibold">Create your account</h1>
      <p className="mt-1 text-sm text-muted">Free. No credit card.</p>

      <form className="mt-6 space-y-3" onSubmit={onSubmit}>
        <input
          className="input"
          placeholder="Name (optional)"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <input
          className="input"
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <input
          className="input"
          type="password"
          placeholder="Password (min 8 chars)"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          minLength={8}
        />
        {err && <p className="text-sm text-red-400">{err}</p>}
        <button className="btn btn-primary w-full" disabled={busy}>
          {busy ? "Creating account…" : "Create account"}
        </button>
      </form>

      <p className="mt-6 text-sm text-muted">
        Already have an account? <Link href="/login" className="text-accent">Sign in</Link>
      </p>
    </main>
  );
}

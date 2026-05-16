"use client";
import { signIn } from "next-auth/react";
import { useState } from "react";
import Link from "next/link";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErr(null);
    setBusy(true);
    const res = await signIn("credentials", { email, password, redirect: false });
    setBusy(false);
    if (res?.error) {
      if (res.error.includes("EMAIL_NOT_VERIFIED")) {
        setErr("Please verify your email first. Check your inbox for the link.");
      } else {
        setErr("Invalid email or password.");
      }
    } else {
      window.location.href = "/app";
    }
  }

  return (
    <main className="mx-auto max-w-sm px-6 py-16">
      <h1 className="text-2xl font-semibold">Sign in</h1>
      <p className="mt-1 text-sm text-muted">Welcome back to Stash.</p>

      <form className="mt-6 space-y-3" onSubmit={onSubmit}>
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
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        {err && <p className="text-sm text-red-400">{err}</p>}
        <button className="btn btn-primary w-full" disabled={busy}>
          {busy ? "Signing in…" : "Sign in"}
        </button>
      </form>

      <div className="my-6 flex items-center gap-3">
        <div className="h-px flex-1 bg-line" />
        <span className="text-xs text-muted">or</span>
        <div className="h-px flex-1 bg-line" />
      </div>

      <div className="space-y-2">
        <button
          className="btn w-full"
          onClick={() => signIn("google", { callbackUrl: "/app" })}
        >
          Continue with Google
        </button>
        <button
          className="btn w-full"
          onClick={() => signIn("facebook", { callbackUrl: "/app" })}
        >
          Continue with Facebook
        </button>
      </div>

      <p className="mt-6 text-sm text-muted">
        New to Stash? <Link href="/register" className="text-accent">Create an account</Link>
      </p>
    </main>
  );
}

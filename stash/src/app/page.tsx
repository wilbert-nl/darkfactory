import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";

export default async function Home() {
  const session = await auth();
  if (session?.user) redirect("/app");

  return (
    <main className="mx-auto max-w-2xl px-6 py-20">
      <h1 className="text-5xl font-semibold tracking-tight">Stash</h1>
      <p className="mt-4 text-lg text-muted">
        Paste a link or any text. Stash files it into the right folder
        automatically, with a clean title and a one-line summary.
      </p>
      <div className="mt-10 flex gap-3">
        <Link href="/login" className="btn btn-primary">Sign in</Link>
        <Link href="/register" className="btn">Create account</Link>
      </div>

      <ul className="mt-14 space-y-3 text-sm text-muted">
        <li>• Paste anywhere — links get a title + summary, text gets organized.</li>
        <li>• AI suggests an existing folder, or proposes a new one.</li>
        <li>• Edit, move between folders, and share notes publicly when you want.</li>
        <li>• Search every note instantly.</li>
      </ul>
    </main>
  );
}

"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import { saveSession } from "@/lib/auth";
import { useState } from "react";
import { getErrorMessage } from "@/lib/errors";


export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const submit = async (evt: React.FormEvent<HTMLFormElement>) => {
    evt.preventDefault();
    setErr(null);
    if (!email || !password) return setErr("Please enter email and password.");
    setLoading(true);

    try {
      // TODO: replace with real API call
      await new Promise((r) => setTimeout(r, 500));
      const token = "demo-token";
      const user = { name: email.split("@")[0] || "User", email };

      saveSession(token, user);
      router.push("/");
      router.refresh();
    } catch (e: unknown) {
  setErr(getErrorMessage(e, "Login failed"));
}
finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto space-y-6">
      <h1 className="text-2xl font-bold">Sign in</h1>
      <form onSubmit={submit} className="glass border border-line rounded-2xl p-6 space-y-4">
        {err && <p className="text-sm text-red-400">{err}</p>}
        <div className="space-y-1">
          <label className="text-sm text-white/70">Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full rounded-xl border border-line bg-panel text-white px-3 py-2"
            placeholder="you@example.com"
          />
        </div>
        <div className="space-y-1">
          <label className="text-sm text-white/70">Password</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full rounded-xl border border-line bg-panel text-white px-3 py-2"
            placeholder="••••••••"
          />
        </div>
        <button disabled={loading} className="btn-neon w-full">
          {loading ? "Signing in…" : "Sign in"}
        </button>
        <p className="text-sm text-white/60">
          No account? <Link href="/auth/register" className="underline">Create one</Link>
        </p>
      </form>
    </div>
  );
}

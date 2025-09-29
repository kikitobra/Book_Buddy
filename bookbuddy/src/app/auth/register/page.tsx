"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import { saveSession } from "@/lib/auth";
import { useState } from "react";
import { getErrorMessage } from "@/lib/errors";


export default function RegisterPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const submit = async (evt: React.FormEvent<HTMLFormElement>) => {
    evt.preventDefault();
    setErr(null);
    if (!name || !email || !password) return setErr("Fill all fields.");
    if (password.length < 6) return setErr("Password must be at least 6 characters.");
    if (password !== confirm) return setErr("Passwords do not match.");
    setLoading(true);

    try {
      // TODO: replace with real API call
      await new Promise((r) => setTimeout(r, 600));
      const token = "demo-token";
      const user = { name, email };

      saveSession(token, user);
      router.push("/");
      router.refresh();
    } catch (e: unknown) {
  setErr(getErrorMessage(e, "Registration failed"));
}
finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto space-y-6">
      <h1 className="text-2xl font-bold">Create your account</h1>
      <form onSubmit={submit} className="glass border border-line rounded-2xl p-6 space-y-4">
        {err && <p className="text-sm text-red-400">{err}</p>}
        <div className="space-y-1">
          <label className="text-sm text-white/70">Name</label>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full rounded-xl border border-line bg-panel text-white px-3 py-2"
            placeholder="Manga Lover"
          />
        </div>
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
        <div className="space-y-1">
          <label className="text-sm text-white/70">Confirm Password</label>
          <input
            type="password"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            className="w-full rounded-xl border border-line bg-panel text-white px-3 py-2"
            placeholder="••••••••"
          />
        </div>
        <button disabled={loading} className="btn-neon w-full">
          {loading ? "Creating account…" : "Create account"}
        </button>
        <p className="text-sm text-white/60">
          Already have an account? <Link href="/auth/login" className="underline">Sign in</Link>
        </p>
      </form>
    </div>
  );
}

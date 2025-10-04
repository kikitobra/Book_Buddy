"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function RegisterPage() {
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setErr(null);
    setLoading(true);

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, name }),
      });
      const data = await res.json();

      if (!res.ok) {
        setErr(data.error || "Registration failed");
        return;
      }

      // Store JWT token in localStorage
      if (data.token) {
        localStorage.setItem("auth_token", data.token);
        localStorage.setItem("user_name", data.user?.name || name);
        localStorage.setItem("user_email", data.user?.email || email);

        // Dispatch custom event to notify navbar of auth change
        window.dispatchEvent(new CustomEvent("authStateChanged"));
      }

      // Redirect to home page
      router.push("/");
      router.refresh();
    } catch (error) {
      setErr("Network error occurred");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-md mx-auto space-y-6">
      <h1 className="text-2xl font-semibold">Create account</h1>
      <form onSubmit={submit} className="space-y-4">
        <input
          className="input"
          placeholder="Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />
        <input
          className="input"
          placeholder="Email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <input
          className="input"
          placeholder="Password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        {err && <p className="text-red-400 text-sm">{err}</p>}
        <button className="btn-neon w-full" type="submit" disabled={loading}>
          {loading ? "Creating account..." : "Register"}
        </button>
      </form>
    </div>
  );
}

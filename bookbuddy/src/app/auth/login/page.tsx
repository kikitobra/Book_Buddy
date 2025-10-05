"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Eye, EyeOff } from "lucide-react";
import { getApiPath } from "@/lib/utils";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setErr(null);
    setLoading(true);

    try {
      const res = await fetch(getApiPath("/api/auth/login"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();

      if (!res.ok) {
        setErr(data.error || "Login failed");
        return;
      }

      if (data.token) {
        localStorage.setItem("auth_token", data.token);
        localStorage.setItem("user_name", data.user?.name || "User");
        localStorage.setItem("user_email", data.user?.email || email);
        window.dispatchEvent(new CustomEvent("authStateChanged"));
      }

      router.push("/");
      router.refresh();
    } catch (error) {
      setErr("Network error occurred");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#1e003e] via-[#3b0066] to-[#10001f] text-white">
      <div className="flex flex-col md:flex-row items-center justify-between w-full max-w-5xl px-8 py-10">
        {/* Left Side */}
        <div className="hidden md:block w-1/2 space-y-4">
          <h1 className="text-5xl font-bold">Welcome Back!</h1>
          <p className="text-gray-300 text-lg">
            Sign in to continue exploring and managing your manga collection.
          </p>
        </div>

        {/* Right Side (Glass Card) */}
        <div className="bg-white/10 backdrop-blur-md shadow-xl rounded-2xl w-full md:w-1/2 p-8">
          <h2 className="text-3xl font-semibold mb-6 text-center">Sign In</h2>
          <form onSubmit={submit} className="space-y-4">
            {/* Email */}
            <input
              className="w-full px-4 py-3 rounded-md bg-white/20 text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-pink-500"
              placeholder="Email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />

            {/* Password with Eye Toggle */}
            <div className="relative">
              <input
                className="w-full px-4 py-3 pr-10 rounded-md bg-white/20 text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-pink-500"
                placeholder="Password"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-3 text-gray-300 hover:text-white transition"
              >
                {showPassword ? <Eye size={20} /> : <EyeOff size={20} />}
              </button>
            </div>

            {err && <p className="text-red-400 text-sm">{err}</p>}

            <button
              className="w-full py-3 rounded-md bg-gradient-to-r from-pink-500 to-blue-500 font-semibold hover:opacity-90 transition"
              type="submit"
              disabled={loading}
            >
              {loading ? "Signing in..." : "Login"}
            </button>
          </form>

          <p className="text-sm text-gray-300 text-center mt-6">
            Don’t have an account?{" "}
            <Link href="/auth/register" className="text-pink-400 hover:underline">
              Sign up here
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

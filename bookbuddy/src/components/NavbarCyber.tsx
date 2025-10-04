"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useCart } from "@/context/CartContext";

export default function NavbarCyber() {
  const pathname = usePathname();
  const router = useRouter();
  const [authed, setAuthed] = useState(false);
  const [name, setName] = useState<string | null>(null);
  const { count, toggle } = useCart();

  useEffect(() => {
    let mounted = true;

    const checkAuth = async () => {
      // Check localStorage first for immediate UI update
      const token = localStorage.getItem("auth_token");
      const userName = localStorage.getItem("user_name");

      if (token) {
        setAuthed(true);
        setName(userName);

        // Then verify with server
        try {
          const res = await fetch("/api/auth/me", {
            cache: "no-store",
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });
          const data = await res.json();
          if (!mounted) return;

          if (data.ok && data.authed) {
            setAuthed(true);
            setName(data.user?.name || userName);
            // Update localStorage with fresh data
            if (data.user?.name) {
              localStorage.setItem("user_name", data.user.name);
            }
          } else {
            // Token is invalid, clear localStorage
            setAuthed(false);
            setName(null);
            localStorage.removeItem("auth_token");
            localStorage.removeItem("user_name");
            localStorage.removeItem("user_email");
          }
        } catch (e) {
          if (mounted) {
            setAuthed(false);
            setName(null);
          }
        }
      } else {
        if (mounted) {
          setAuthed(false);
          setName(null);
        }
      }
    };

    checkAuth();

    // Listen for auth state changes
    const handleAuthChange = () => {
      checkAuth();
    };

    window.addEventListener("authStateChanged", handleAuthChange);

    return () => {
      mounted = false;
      window.removeEventListener("authStateChanged", handleAuthChange);
    };
  }, []);

  const signOut = () => {
    // Clear localStorage immediately for instant UI update
    localStorage.removeItem("auth_token");
    localStorage.removeItem("user_name");
    localStorage.removeItem("user_email");
    setAuthed(false);
    setName(null);

    // Dispatch custom event to notify other components
    window.dispatchEvent(new CustomEvent("authStateChanged"));

    // Call logout endpoint (optional, since we're using stateless auth)
    (async () => {
      try {
        await fetch("/api/auth/logout", { method: "POST" });
      } catch (e) {
        // Ignore logout errors since we already cleared localStorage
      }
      router.push("/");
      router.refresh();
    })();
  };
  const navItems = [
    { href: "/", label: "Home" }, // ✅ Added Home
    { href: "/books_frontend", label: "Catalog" },
    { href: "/wishlist", label: "Wishlist" },
    { href: "/cart", label: "Cart" },
  ];

  return (
    <nav className="flex items-center justify-between px-6 py-4 border-b border-white/10">
      <div className="flex items-center gap-6">
        <Link href="/" className="text-lg font-bold text-white">
          BookBuddy
        </Link>

        <div className="flex gap-4">
          {navItems.map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              className={`px-3 py-2 rounded-md text-sm transition 
                ${
                  pathname === href
                    ? "bg-white/10 text-white"
                    : "text-white/70 hover:text-white hover:bg-white/5"
                }`}
            >
              {label}
            </Link>
          ))}
        </div>
      </div>

      <div className="flex items-center gap-3">
        {/* Cart Button */}
        <button
          onClick={toggle}
          className="relative px-3 py-2 rounded-md text-sm bg-white/5 text-white/80 hover:bg-white/10"
        >
          Cart
          {count > 0 && (
            <span className="absolute -top-1 -right-1 bg-pink-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
              {count}
            </span>
          )}
        </button>

        {authed ? (
          <>
            <span className="text-white/80 text-sm">
              Welcome, {name || "User"}!
            </span>
            <button
              onClick={signOut}
              className="px-3 py-2 rounded-md text-sm bg-red-500/20 text-red-300 hover:bg-red-500/30"
            >
              Sign out
            </button>
          </>
        ) : (
          <>
            <Link
              href="/auth/login"
              className="px-3 py-2 rounded-md text-sm bg-white/5 text-white/80 hover:bg-white/10"
            >
              Sign in
            </Link>
            <Link
              href="/auth/register"
              className="px-3 py-2 rounded-md text-sm bg-gradient-to-r from-pink-500 to-purple-600 text-white"
            >
              Register
            </Link>
          </>
        )}
      </div>
    </nav>
  );
}

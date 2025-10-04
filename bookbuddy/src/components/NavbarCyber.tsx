"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useCart } from "@/context/CartContext";
import { useEffect, useState } from "react";

const NavLink = ({ href, label }: { href: string; label: string }) => {
  const path = usePathname();
  const active = path === href;
  return (
    <Link
      href={href}
      className={`px-3 py-2 rounded-xl text-sm transition
        ${
          active
            ? "text-white bg-white/5"
            : "text-white/70 hover:text-white hover:bg-white/5"
        }`}
    >
      {label}
    </Link>
  );
};

export default function NavbarCyber() {
  const { count, toggle } = useCart();
  const router = useRouter();
  const [authed, setAuthed] = useState(false);
  const [name, setName] = useState<string | null>(null);

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

  return (
    <header className="sticky top-0 z-30 border-b border-line/50 bg-bg/60 backdrop-blur">
      <div className="max-w-7xl mx-auto px-4 py-3 flex items-center gap-6">
        <Link href="/" className="flex items-center gap-2">
          <div className="h-7 w-7 rounded-lg bg-gradient-to-br from-neon.pink via-neon.purple to-neon.blue shadow-glow" />
          <span className="font-extrabold tracking-wide text-white">
            BookBuddy
          </span>
        </Link>

        <nav className="hidden md:flex gap-1">
          <NavLink href="/books" label="Catalog" />
          <NavLink href="/wishlist" label="Wishlist" />
          <NavLink href="/cart" label="Cart" />
        </nav>

        <div className="ml-auto flex items-center gap-3">
          {authed ? (
            <>
              <Link
                href="/account"
                className="text-white/80 text-sm hover:text-white underline"
              >
                Hello, {name ?? "Reader"}
              </Link>
              <button
                onClick={signOut}
                className="rounded-xl border border-line px-3 py-1.5 text-white/80 hover:text-white hover:border-white/30"
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <Link
                href="/auth/login"
                className="rounded-xl border border-line px-3 py-1.5 text-white/80 hover:text-white hover:border-white/30"
              >
                Sign in
              </Link>
              <Link href="/auth/register" className="btn-neon">
                Register
              </Link>
            </>
          )}
          <button
            onClick={toggle}
            className="relative rounded-xl border border-line px-3 py-1.5 text-white/80 hover:text-white hover:border-white/30"
          >
            Cart
            <span className="absolute -right-2 -top-2 text-[10px] bg-neon.pink text-bg rounded-full px-1.5">
              {count}
            </span>
          </button>
        </div>
      </div>
    </header>
  );
}

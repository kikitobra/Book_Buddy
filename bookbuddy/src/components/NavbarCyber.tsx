"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState, useRef } from "react";
import { useCart } from "@/context/CartContext";
import { getApiPath } from "@/lib/utils";

export default function NavbarCyber() {
  const pathname = usePathname();
  const router = useRouter();
  const [authed, setAuthed] = useState(false);
  const [name, setName] = useState<string | null>(null);
  const [profileOpen, setProfileOpen] = useState(false);
  const profileRef = useRef<HTMLDivElement>(null);
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
          const res = await fetch(getApiPath("/api/auth/me"), {
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

  // Close profile dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        profileRef.current &&
        !profileRef.current.contains(event.target as Node)
      ) {
        setProfileOpen(false);
      }
    };

    if (profileOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [profileOpen]);

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
        await fetch(getApiPath("/api/auth/logout"), { method: "POST" });
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
          <div className="relative" ref={profileRef}>
            <button
              onClick={() => setProfileOpen(!profileOpen)}
              className="flex items-center gap-2 px-3 py-2 rounded-md text-sm bg-white/5 text-white/80 hover:bg-white/10 transition"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                />
              </svg>
              <span>{name || "Profile"}</span>
              <svg
                className={`w-4 h-4 transition-transform ${
                  profileOpen ? "rotate-180" : ""
                }`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 9l-7 7-7-7"
                />
              </svg>
            </button>

            {/* Dropdown Menu */}
            {profileOpen && (
              <div className="absolute right-0 mt-2 w-56 bg-gray-900 border border-white/10 rounded-lg shadow-xl z-50 overflow-hidden">
                {/* User Info Header */}
                <div className="px-4 py-3 border-b border-white/10 bg-white/5">
                  <p className="text-sm font-medium text-white">
                    {name || "User"}
                  </p>
                  <p className="text-xs text-white/60 truncate">
                    {localStorage.getItem("user_email") || ""}
                  </p>
                </div>

                {/* Menu Items */}
                <div className="py-2">
                  <Link
                    href="/account"
                    onClick={() => setProfileOpen(false)}
                    className="flex items-center gap-3 px-4 py-2 text-sm text-white/80 hover:bg-white/10 transition"
                  >
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                      />
                    </svg>
                    My Profile
                  </Link>

                  <Link
                    href="/account?tab=orders"
                    onClick={() => setProfileOpen(false)}
                    className="flex items-center gap-3 px-4 py-2 text-sm text-white/80 hover:bg-white/10 transition"
                  >
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"
                      />
                    </svg>
                    Order History
                  </Link>

                  <Link
                    href="/wishlist"
                    onClick={() => setProfileOpen(false)}
                    className="flex items-center gap-3 px-4 py-2 text-sm text-white/80 hover:bg-white/10 transition"
                  >
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                      />
                    </svg>
                    My Wishlist
                  </Link>

                  <Link
                    href="/account?tab=address"
                    onClick={() => setProfileOpen(false)}
                    className="flex items-center gap-3 px-4 py-2 text-sm text-white/80 hover:bg-white/10 transition"
                  >
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                      />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                      />
                    </svg>
                    Shipping Address
                  </Link>
                </div>

                {/* Sign Out */}
                <div className="border-t border-white/10 py-2">
                  <button
                    onClick={() => {
                      setProfileOpen(false);
                      signOut();
                    }}
                    className="flex items-center gap-3 w-full px-4 py-2 text-sm text-red-300 hover:bg-red-500/10 transition"
                  >
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                      />
                    </svg>
                    Sign Out
                  </button>
                </div>
              </div>
            )}
          </div>
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

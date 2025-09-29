"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useCart } from "@/context/CartContext";
import { clearSession, getUser, isAuthed } from "@/lib/auth";
import { useEffect, useState } from "react";

const NavLink = ({ href, label }: { href: string; label: string }) => {
  const path = usePathname();
  const active = path === href;
  return (
    <Link
      href={href}
      className={`px-3 py-2 rounded-xl text-sm transition
        ${active ? "text-white bg-white/5" : "text-white/70 hover:text-white hover:bg-white/5"}`}
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
    setAuthed(isAuthed());
    setName(getUser()?.name || null);
  }, []);

  const signOut = () => {
    clearSession();
    setAuthed(false);
    setName(null);
    router.refresh();
  };

  return (
    <header className="sticky top-0 z-30 border-b border-line/50 bg-bg/60 backdrop-blur">
      <div className="max-w-7xl mx-auto px-4 py-3 flex items-center gap-6">
        <Link href="/" className="flex items-center gap-2">
          <div className="h-7 w-7 rounded-lg bg-gradient-to-br from-neon.pink via-neon.purple to-neon.blue shadow-glow" />
          <span className="font-extrabold tracking-wide text-white">BookBuddy</span>
        </Link>

        <nav className="hidden md:flex gap-1">
          <NavLink href="/books" label="Catalog" />
          <NavLink href="/wishlist" label="Wishlist" />
          <NavLink href="/cart" label="Cart" />
        </nav>

        <div className="ml-auto flex items-center gap-3">
          {authed ? (
            <>
                <Link href="/account" className="text-white/80 text-sm hover:text-white underline">
                    Hello, {name ?? "Reader"}
                </Link>
                <button onClick={signOut} className="rounded-xl border border-line px-3 py-1.5 text-white/80 hover:text-white hover:border-white/30">
                    Logout
                </button>
            </>
          ) : (
            <>
              <Link href="/auth/login" className="rounded-xl border border-line px-3 py-1.5 text-white/80 hover:text-white hover:border-white/30">
                Sign in
              </Link>
              <Link href="/auth/register" className="btn-neon">Register</Link>
            </>
          )}
          <button onClick={toggle} className="relative rounded-xl border border-line px-3 py-1.5 text-white/80 hover:text-white hover:border-white/30">
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

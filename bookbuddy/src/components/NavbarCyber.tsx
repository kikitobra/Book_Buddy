"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function NavbarCyber() {
  const pathname = usePathname();

  const navItems = [
    { href: "/", label: "Home" },         // ✅ Added Home
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
        <Link
          href="/signin"
          className="px-3 py-2 rounded-md text-sm bg-white/5 text-white/80 hover:bg-white/10"
        >
          Sign in
        </Link>
        <Link
          href="/register"
          className="px-3 py-2 rounded-md text-sm bg-gradient-to-r from-pink-500 to-purple-600 text-white"
        >
          Register
        </Link>
      </div>
    </nav>
  );
}

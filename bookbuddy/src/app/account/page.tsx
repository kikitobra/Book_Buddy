"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { clearSession, getToken, getUser, isAuthed, saveSession } from "@/lib/auth";
import { orders } from "@/data/orders";
import { currency } from "@/lib/utils";

type Address = {
  fullName: string;
  phone: string;
  street: string;
  city: string;
  state: string;
  postal: string;
  country: string;
};

const ADDRESS_KEY = "bb_address";

function loadAddress(): Address | null {
  try {
    const raw = localStorage.getItem(ADDRESS_KEY);
    return raw ? (JSON.parse(raw) as Address) : null;
  } catch {
    return null;
  }
}

function saveAddress(addr: Address) {
  localStorage.setItem(ADDRESS_KEY, JSON.stringify(addr));
}

export default function AccountPage() {
  const router = useRouter();
  const [tab, setTab] = useState<"profile" | "orders" | "address">("profile");
  const [notice, setNotice] = useState<string | null>(null);

  // User state
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");

  // Address state
  const [addr, setAddr] = useState<Address>({
    fullName: "",
    phone: "",
    street: "",
    city: "",
    state: "",
    postal: "",
    country: "Thailand",
  });

  // Guard: redirect to login if not authenticated
  useEffect(() => {
    if (!isAuthed()) {
      router.replace(`/auth/login?next=/account`);
      return;
    }
    const u = getUser();
    if (u) {
      setName(u.name || "");
      setEmail(u.email || "");
    }
    const a = loadAddress();
    if (a) setAddr(a);
  }, [router]);

  const orderCount = useMemo(() => orders.length, []);

  const saveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    // If using backend, call PUT /api/users/me here.
    const token = getToken() || "demo-token";
    saveSession(token, { name, email });
    setNotice("Profile updated.");
    setTimeout(() => setNotice(null), 1500);
  };

  const saveAddr = (e: React.FormEvent) => {
    e.preventDefault();
    saveAddress(addr);
    setNotice("Address saved.");
    setTimeout(() => setNotice(null), 1500);
  };

  const signOut = () => {
    clearSession();
    router.push("/");
    router.refresh();
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center gap-4">
        <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-neon.pink via-neon.purple to-neon.blue shadow-glow" />
        <div className="flex-1">
          <h1 className="text-2xl font-bold">Your Account</h1>
          <p className="text-sm text-white/60">
            Manage your profile, orders, and shipping address.
          </p>
        </div>
        <button onClick={signOut} className="rounded-xl border border-line px-4 py-2 text-white/80 hover:text-white hover:border-white/30">
          Logout
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-2">
        {(["profile", "orders", "address"] as const).map(t => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-3 py-1.5 rounded-full text-sm border ${
              tab === t
                ? "border-neon.mint text-neon.mint bg-neon.mint/10"
                : "border-line text-white/70 hover:text-white"
            }`}
          >
            {t[0].toUpperCase() + t.slice(1)}
          </button>
        ))}
      </div>

      {notice && (
        <div className="rounded-xl border border-line glass px-4 py-3 text-sm text-neon.mint">
          {notice}
        </div>
      )}

      {/* Panels */}
      {tab === "profile" && (
        <section className="glass border border-line rounded-2xl p-6 space-y-4">
          <h2 className="font-semibold text-lg">Profile</h2>
          <form onSubmit={saveProfile} className="grid sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-sm text-white/70">Name</label>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full rounded-xl border border-line bg-panel text-white px-3 py-2"
                placeholder="Your name"
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

            {/* Change password (UI only; wire to API later) */}
            <div className="space-y-1">
              <label className="text-sm text-white/70">New Password</label>
              <input
                type="password"
                className="w-full rounded-xl border border-line bg-panel text-white px-3 py-2"
                placeholder="••••••••"
              />
            </div>
            <div className="space-y-1">
              <label className="text-sm text-white/70">Confirm Password</label>
              <input
                type="password"
                className="w-full rounded-xl border border-line bg-panel text-white px-3 py-2"
                placeholder="••••••••"
              />
            </div>

            <div className="sm:col-span-2 flex gap-3">
              <button className="btn-neon">Save changes</button>
              <Link href="/books" className="rounded-xl border border-line px-4 py-2 text-white/80 hover:text-white hover:border-white/30">
                Continue shopping
              </Link>
            </div>
          </form>
        </section>
      )}

      {tab === "orders" && (
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold text-lg">Orders ({orderCount})</h2>
          </div>

          <div className="grid gap-4">
            {orders.map((o) => (
              <div key={o.id} className="glass border border-line rounded-2xl p-4">
                <div className="flex flex-wrap items-center gap-3 justify-between">
                  <div>
                    <p className="font-medium">{o.id}</p>
                    <p className="text-xs text-white/60">
                      {new Date(o.date).toLocaleString()}
                    </p>
                  </div>
                  <span className={`text-xs px-2 py-1 rounded-full border ${
                    o.status === "Delivered"
                      ? "border-neon.mint text-neon.mint"
                      : o.status === "Shipped"
                      ? "border-neon.blue text-neon.blue"
                      : o.status === "Cancelled"
                      ? "border-red-400 text-red-400"
                      : "border-white/40 text-white/70"
                  }`}>
                    {o.status}
                  </span>
                  <div className="font-semibold">{currency(o.total)}</div>
                </div>

                <div className="mt-3 flex gap-3 overflow-x-auto">
                  {o.items.map((it) => (
                    <div key={it.id} className="flex items-center gap-3 rounded-xl border border-line bg-panel p-2">
                      <img src={it.cover} alt="" className="h-16 w-12 object-cover rounded" />
                      <div>
                        <p className="text-sm">{it.title}</p>
                        <p className="text-xs text-white/60">Qty {it.qty} • {currency(it.price)}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {tab === "address" && (
        <section className="glass border border-line rounded-2xl p-6 space-y-4">
          <h2 className="font-semibold text-lg">Shipping Address</h2>
          <form onSubmit={saveAddr} className="grid sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-sm text-white/70">Full Name</label>
              <input
                value={addr.fullName}
                onChange={e=>setAddr(a=>({ ...a, fullName: e.target.value }))}
                className="w-full rounded-xl border border-line bg-panel text-white px-3 py-2"
              />
            </div>
            <div className="space-y-1">
              <label className="text-sm text-white/70">Phone</label>
              <input
                value={addr.phone}
                onChange={e=>setAddr(a=>({ ...a, phone: e.target.value }))}
                className="w-full rounded-xl border border-line bg-panel text-white px-3 py-2"
              />
            </div>
            <div className="space-y-1 sm:col-span-2">
              <label className="text-sm text-white/70">Street</label>
              <input
                value={addr.street}
                onChange={e=>setAddr(a=>({ ...a, street: e.target.value }))}
                className="w-full rounded-xl border border-line bg-panel text-white px-3 py-2"
              />
            </div>
            <div className="space-y-1">
              <label className="text-sm text-white/70">City</label>
              <input
                value={addr.city}
                onChange={e=>setAddr(a=>({ ...a, city: e.target.value }))}
                className="w-full rounded-xl border border-line bg-panel text-white px-3 py-2"
              />
            </div>
            <div className="space-y-1">
              <label className="text-sm text-white/70">State/Province</label>
              <input
                value={addr.state}
                onChange={e=>setAddr(a=>({ ...a, state: e.target.value }))}
                className="w-full rounded-xl border border-line bg-panel text-white px-3 py-2"
              />
            </div>
            <div className="space-y-1">
              <label className="text-sm text-white/70">Postal Code</label>
              <input
                value={addr.postal}
                onChange={e=>setAddr(a=>({ ...a, postal: e.target.value }))}
                className="w-full rounded-xl border border-line bg-panel text-white px-3 py-2"
              />
            </div>
            <div className="space-y-1">
              <label className="text-sm text-white/70">Country</label>
              <input
                value={addr.country}
                onChange={e=>setAddr(a=>({ ...a, country: e.target.value }))}
                className="w-full rounded-xl border border-line bg-panel text-white px-3 py-2"
              />
            </div>
            <div className="sm:col-span-2">
              <button className="btn-neon">Save Address</button>
            </div>
          </form>
        </section>
      )}
    </div>
  );
}

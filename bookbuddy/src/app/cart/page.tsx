"use client";

import Link from "next/link";
import { useCart } from "@/context/CartContext";
import { currency } from "@/lib/utils";

export default function CartPage() {
  const { items, total, remove, clear, inc, dec, updateQty } = useCart();

  const shipping = items.length ? 2.99 : 0;   // demo flat rate
  const grand    = total + shipping;

  return (
    <div className="grid lg:grid-cols-3 gap-8">
      <div className="lg:col-span-2 space-y-4">
        <h1 className="text-2xl font-bold">Your Cart</h1>

        {items.length === 0 ? (
          <div className="glass border border-line rounded-2xl p-8">
            <p className="text-white/70">Your cart is empty.</p>
            <Link href="/books_frontend" className="inline-block mt-4 btn-neon">Browse catalog</Link>
          </div>
        ) : (
          <div className="space-y-3">
            {items.map((it) => (
              <div key={it.id} className="glass border border-line rounded-2xl p-3 flex items-center gap-4">
                <img src={it.cover} alt="" className="h-24 w-18 object-cover rounded" />
                <div className="flex-1">
                  <p className="font-medium">{it.title}</p>
                  <div className="mt-2 flex items-center gap-2">
                    <button onClick={() => dec(it.id)} className="h-7 w-7 rounded border border-line text-white/80">−</button>
                    <input
                      type="number"
                      value={it.qty}
                      min={1}
                      onChange={(e) => updateQty(it.id, Math.max(1, parseInt(e.target.value || "1", 10)))}
                      className="h-7 w-14 text-center rounded border border-line bg-panel text-white"
                    />
                    <button onClick={() => inc(it.id)} className="h-7 w-7 rounded border border-line text-white/80">+</button>
                    <span className="ml-4 text-sm text-white/60">@ {currency(it.price)}</span>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-semibold">{currency(it.qty * it.price)}</div>
                  <button onClick={() => remove(it.id)} className="text-xs underline text-white/70 hover:text-white mt-1">
                    Remove
                  </button>
                </div>
              </div>
            ))}

            <div className="flex gap-2">
              <Link href="/books_frontend" className="rounded-xl border border-line px-4 py-2 text-white/80 hover:text-white">Continue shopping</Link>
              <button onClick={clear} className="rounded-xl border border-line px-4 py-2 text-white/80 hover:text-white">Clear cart</button>
            </div>
          </div>
        )}
      </div>

      {/* Summary */}
      <aside className="space-y-4">
        <div className="glass border border-line rounded-2xl p-6 space-y-3">
          <h2 className="font-semibold text-lg">Order Summary</h2>
          <div className="flex items-center justify-between">
            <span className="text-white/60">Subtotal</span>
            <span>{currency(total)}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-white/60">Shipping</span>
            <span>{shipping ? currency(shipping) : "Free"}</span>
          </div>
          <div className="border-t border-line pt-3 flex items-center justify-between">
            <span className="font-semibold">Total</span>
            <span className="font-semibold">{currency(grand)}</span>
          </div>
          <button className="btn-neon w-full">Checkout</button>
        </div>

        <div className="glass border border-line rounded-2xl p-4 text-sm text-white/70">
          <p>Shipping in 2–4 days within TH. Secure payments with cards & wallets.</p>
        </div>
      </aside>
    </div>
  );
}

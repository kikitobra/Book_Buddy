"use client";
import Link from "next/link";
import { useCart } from "@/context/CartContext";
import { currency } from "@/lib/utils";

export default function CartDrawer() {
  const { isOpen, toggle, items, remove, clear, total, inc, dec } = useCart();

  return (
    <div
      className={`fixed inset-0 z-[60] ${isOpen ? "" : "pointer-events-none"}`}
    >
      {/* Backdrop */}
      <div
        onClick={toggle}
        className={`absolute inset-0 bg-black/50 backdrop-blur-sm transition-opacity ${
          isOpen ? "opacity-100" : "opacity-0"
        }`}
      />
      {/* Panel */}
      <aside
        className={`absolute right-0 top-0 h-full w-full max-w-md bg-panel/95 backdrop-blur border-l border-line shadow-xl
                    transition-transform ${
                      isOpen ? "translate-x-0" : "translate-x-full"
                    }`}
      >
        {/* Header */}
        <div className="p-4 border-b border-line flex items-center justify-between bg-gradient-to-b from-white/5 to-transparent">
          <h2 className="font-semibold text-lg text-white">Your Cart</h2>
          <button
            onClick={toggle}
            className="rounded border border-line px-2 py-1 text-sm text-white/80 hover:text-white"
          >
            Close
          </button>
        </div>

        {/* Items */}
        <div className="p-4 space-y-4 overflow-y-auto max-h-[calc(100vh-14rem)]">
          {items.length === 0 && (
            <p className="text-sm text-white/60">Cart is empty.</p>
          )}

          {items.map((it) => (
            <div key={it.id} className="flex gap-3 items-center">
              <img
                src={it.cover}
                alt=""
                className="h-16 w-12 object-cover rounded"
              />
              <div className="flex-1">
                <p className="text-sm font-medium text-white line-clamp-2">
                  {it.title}
                </p>
                <div className="mt-1 flex items-center gap-2">
                  <button
                    onClick={() => dec(it.id)}
                    className="h-6 w-6 rounded border border-line text-white/80"
                  >
                    −
                  </button>
                  <span className="min-w-6 text-center text-sm">{it.qty}</span>
                  <button
                    onClick={() => inc(it.id)}
                    className="h-6 w-6 rounded border border-line text-white/80"
                  >
                    +
                  </button>
                </div>
              </div>
              <div className="text-sm text-white">
                {currency(it.price * it.qty)}
              </div>
              <button
                onClick={() => remove(it.id)}
                className="text-xs underline text-white/70 hover:text-white"
              >
                Remove
              </button>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-line space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm text-white/60">Subtotal</span>
            <span className="font-semibold text-white">{currency(total)}</span>
          </div>
          <div className="flex gap-2">
            <button
              onClick={clear}
              className="flex-1 border border-line rounded-lg px-3 py-2 text-white/80 hover:text-white"
            >
              Clear
            </button>
            <Link
              href="/cart"
              onClick={toggle}
              className="flex-1 rounded-lg border border-line px-3 py-2 text-center text-white/90 hover:text-white"
            >
              View cart
            </Link>
            <Link
              href="/checkout"
              onClick={toggle}
              className="flex-1 btn-neon text-center"
            >
              Checkout
            </Link>
          </div>
        </div>
      </aside>
    </div>
  );
}

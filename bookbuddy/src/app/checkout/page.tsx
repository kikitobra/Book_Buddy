"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useCart } from "@/context/CartContext";
import { currency, getApiPath, getAssetPath } from "@/lib/utils";

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

export default function CheckoutPage() {
  const router = useRouter();
  const { items, total, clear } = useCart();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [addr, setAddr] = useState<Address>({
    fullName: "",
    phone: "",
    street: "",
    city: "",
    state: "",
    postal: "",
    country: "Thailand",
  });

  // Guard: redirect if not authenticated
  useEffect(() => {
    const token = localStorage.getItem("auth_token");
    if (!token) {
      router.replace("/auth/login?next=/checkout");
      return;
    }

    // Load saved address
    const savedAddr = loadAddress();
    if (savedAddr) {
      setAddr(savedAddr);
    }
  }, [router]);

  // Guard: redirect if cart is empty
  useEffect(() => {
    if (items.length === 0 && !loading) {
      router.replace("/cart");
    }
  }, [items, loading, router]);

  const shipping = items.length ? 50 : 0; // ฿50 shipping
  const grandTotal = total + shipping;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate required fields
    if (!addr.fullName || !addr.phone || !addr.street || !addr.city) {
      setError("Please fill in all required fields");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const token = localStorage.getItem("auth_token");
      if (!token) {
        router.replace("/auth/login?next=/checkout");
        return;
      }

      // Save address for future use
      saveAddress(addr);

      // Create order
      const res = await fetch(getApiPath("/api/orders"), {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          items: items.map((item) => ({
            bookId: item.id,
            title: item.title,
            quantity: item.qty,
            price: item.price,
            cover: item.cover,
          })),
          shippingAddress: addr,
          total: grandTotal,
          paymentMethod: "Cash on Delivery",
        }),
      });

      const data = await res.json();

      if (data.ok) {
        // Clear cart
        clear();

        // Redirect to success page with order ID
        router.push(`/checkout/success?orderId=${data.orderId}`);
      } else {
        setError(data.error || "Failed to create order");
      }
    } catch (err) {
      setError("Network error occurred");
    } finally {
      setLoading(false);
    }
  };

  if (items.length === 0 && !loading) {
    return null; // Will redirect
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <h1 className="text-3xl font-bold">Checkout</h1>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Left: Shipping Form */}
        <div className="lg:col-span-2 space-y-6">
          <section className="glass border border-line rounded-2xl p-6 space-y-4">
            <h2 className="font-semibold text-lg">Shipping Information</h2>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-sm text-white/70">
                    Full Name <span className="text-red-400">*</span>
                  </label>
                  <input
                    value={addr.fullName}
                    onChange={(e) =>
                      setAddr((a) => ({ ...a, fullName: e.target.value }))
                    }
                    className="w-full rounded-xl border border-line bg-panel text-white px-3 py-2"
                    placeholder="John Doe"
                    required
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-sm text-white/70">
                    Phone Number <span className="text-red-400">*</span>
                  </label>
                  <input
                    value={addr.phone}
                    onChange={(e) =>
                      setAddr((a) => ({ ...a, phone: e.target.value }))
                    }
                    className="w-full rounded-xl border border-line bg-panel text-white px-3 py-2"
                    placeholder="0812345678"
                    required
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-sm text-white/70">
                  Street Address <span className="text-red-400">*</span>
                </label>
                <input
                  value={addr.street}
                  onChange={(e) =>
                    setAddr((a) => ({ ...a, street: e.target.value }))
                  }
                  className="w-full rounded-xl border border-line bg-panel text-white px-3 py-2"
                  placeholder="123 Main Street"
                  required
                />
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-sm text-white/70">
                    City <span className="text-red-400">*</span>
                  </label>
                  <input
                    value={addr.city}
                    onChange={(e) =>
                      setAddr((a) => ({ ...a, city: e.target.value }))
                    }
                    className="w-full rounded-xl border border-line bg-panel text-white px-3 py-2"
                    placeholder="Bangkok"
                    required
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-sm text-white/70">
                    State/Province
                  </label>
                  <input
                    value={addr.state}
                    onChange={(e) =>
                      setAddr((a) => ({ ...a, state: e.target.value }))
                    }
                    className="w-full rounded-xl border border-line bg-panel text-white px-3 py-2"
                    placeholder="Bangkok"
                  />
                </div>
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-sm text-white/70">Postal Code</label>
                  <input
                    value={addr.postal}
                    onChange={(e) =>
                      setAddr((a) => ({ ...a, postal: e.target.value }))
                    }
                    className="w-full rounded-xl border border-line bg-panel text-white px-3 py-2"
                    placeholder="10110"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-sm text-white/70">Country</label>
                  <input
                    value={addr.country}
                    onChange={(e) =>
                      setAddr((a) => ({ ...a, country: e.target.value }))
                    }
                    className="w-full rounded-xl border border-line bg-panel text-white px-3 py-2"
                    placeholder="Thailand"
                  />
                </div>
              </div>

              {error && (
                <div className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-400">
                  {error}
                </div>
              )}
            </form>
          </section>

          {/* Payment Method */}
          <section className="glass border border-line rounded-2xl p-6 space-y-4">
            <h2 className="font-semibold text-lg">Payment Method</h2>
            <div className="flex items-center gap-3 p-4 rounded-xl border border-neon.mint bg-neon.mint/10">
              <div className="flex-1">
                <p className="font-medium text-neon.mint">Cash on Delivery</p>
                <p className="text-sm text-white/60">
                  Pay when you receive your order
                </p>
              </div>
              <svg
                className="w-6 h-6 text-neon.mint"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
          </section>
        </div>

        {/* Right: Order Summary */}
        <aside className="space-y-4">
          <section className="glass border border-line rounded-2xl p-6 space-y-4">
            <h2 className="font-semibold text-lg">Order Summary</h2>

            <div className="space-y-3">
              {items.map((item) => (
                <div key={item.id} className="flex gap-3">
                  <img
                    src={
                      item.cover && item.cover.trim()
                        ? item.cover
                        : getAssetPath("/placeholder-cover.svg")
                    }
                    alt=""
                    className="h-16 w-12 object-cover rounded"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium line-clamp-2">
                      {item.title}
                    </p>
                    <p className="text-xs text-white/60">Qty: {item.qty}</p>
                  </div>
                  <p className="text-sm font-medium">
                    {currency(item.price * item.qty)}
                  </p>
                </div>
              ))}
            </div>

            <div className="border-t border-line pt-3 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-white/70">Subtotal</span>
                <span>{currency(total)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-white/70">Shipping</span>
                <span>{currency(shipping)}</span>
              </div>
              <div className="flex justify-between font-semibold text-lg pt-2 border-t border-line">
                <span>Total</span>
                <span className="text-neon.mint">{currency(grandTotal)}</span>
              </div>
            </div>

            <button
              onClick={handleSubmit}
              disabled={loading}
              className="btn-neon w-full disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Processing..." : "Place Order"}
            </button>

            <p className="text-xs text-white/60 text-center">
              By placing your order, you agree to our terms and conditions
            </p>
          </section>
        </aside>
      </div>
    </div>
  );
}

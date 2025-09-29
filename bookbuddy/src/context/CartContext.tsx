"use client";
import { createContext, useContext, useEffect, useMemo, useState } from "react";

type CartItem = { id: string; title: string; price: number; qty: number; cover: string };
type CartCtx = {
  items: CartItem[];
  add: (item: CartItem) => void;
  remove: (id: string) => void;
  clear: () => void;
  updateQty: (id: string, qty: number) => void;
  inc: (id: string, step?: number) => void;
  dec: (id: string, step?: number) => void;
  count: number;
  total: number;
  isOpen: boolean;
  toggle: () => void;
};

const C = createContext<CartCtx | null>(null);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const raw = localStorage.getItem("bb_cart");
    if (raw) setItems(JSON.parse(raw));
  }, []);
  useEffect(() => {
    localStorage.setItem("bb_cart", JSON.stringify(items));
  }, [items]);

  const add = (x: CartItem) =>
    setItems(prev => {
      const i = prev.findIndex(p => p.id === x.id);
      if (i >= 0) {
        const copy = [...prev];
        copy[i] = { ...copy[i], qty: copy[i].qty + x.qty };
        return copy;
      }
      return [...prev, x];
    });

  const remove = (id: string) => setItems(prev => prev.filter(p => p.id !== id));
  const clear  = () => setItems([]);

  const updateQty = (id: string, qty: number) =>
    setItems(prev => (qty <= 0 ? prev.filter(i => i.id !== id) : prev.map(i => (i.id === id ? { ...i, qty } : i))));

  const inc = (id: string, step = 1) =>
    setItems(prev => prev.map(i => (i.id === id ? { ...i, qty: i.qty + step } : i)));

  const dec = (id: string, step = 1) =>
    setItems(prev =>
      prev.flatMap(i => {
        if (i.id !== id) return [i];
        const q = i.qty - step;
        return q <= 0 ? [] : [{ ...i, qty: q }];
      })
    );

  const count = useMemo(() => items.reduce((n, i) => n + i.qty, 0), [items]);
  const total = useMemo(() => items.reduce((n, i) => n + i.qty * i.price, 0), [items]);

  return (
    <C.Provider
      value={{ items, add, remove, clear, updateQty, inc, dec, count, total, isOpen, toggle: () => setIsOpen(s=>!s) }}
    >
      {children}
    </C.Provider>
  );
}

export const useCart = () => {
  const ctx = useContext(C);
  if (!ctx) throw new Error("useCart must be used inside CartProvider");
  return ctx;
};

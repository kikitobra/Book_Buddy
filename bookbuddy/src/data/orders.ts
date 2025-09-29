export type OrderItem = {
  id: string;
  title: string;
  qty: number;
  price: number;
  cover: string;
};

export type Order = {
  id: string;
  date: string; // ISO string
  total: number;
  status: "Processing" | "Shipped" | "Delivered" | "Cancelled";
  items: OrderItem[];
};

// Sample orders for UI demo
export const orders: Order[] = [
  {
    id: "BB-240923-001",
    date: "2025-09-20T10:20:00Z",
    total: 20.98,
    status: "Delivered",
    items: [
      {
        id: "1",
        title: "One Piece Vol. 1 (Romance Dawn)",
        qty: 1,
        price: 9.99,
        cover: "https://images.unsplash.com/photo-1526318472351-c75fcf070305?q=80&w=400&auto=format&fit=crop",
      },
      {
        id: "2",
        title: "Naruto Vol. 1",
        qty: 1,
        price: 9.99,
        cover: "https://images.unsplash.com/photo-1495446815901-a7297e633e8d?q=80&w=400&auto=format&fit=crop",
      },
    ],
  },
  {
    id: "BB-240925-002",
    date: "2025-09-25T15:45:00Z",
    total: 10.99,
    status: "Shipped",
    items: [
      {
        id: "3",
        title: "Demon Slayer Vol. 1",
        qty: 1,
        price: 10.99,
        cover: "https://images.unsplash.com/photo-1541963463532-d68292c34b19?q=80&w=400&auto=format&fit=crop",
      },
    ],
  },
];

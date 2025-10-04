import "./globals.css";
import type { Metadata } from "next";
import NavbarCyber from "@/components/NavbarCyber";
import FooterMinimal from "@/components/FooterMinimal";
import CartDrawer from "@/components/CartDrawer";
import { CartProvider } from "@/context/CartContext";

export const metadata: Metadata = {
  title: "BookBuddy",
  description: "English Manga Store",
  icons: {
    icon: "/book_buddy_logo.svg",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen text-white bg-bg">
        <CartProvider>
          <NavbarCyber />
          <main className="max-w-7xl mx-auto px-4 py-8 space-y-12">
            {children}
          </main>
          <FooterMinimal />
          <CartDrawer />
        </CartProvider>
      </body>
    </html>
  );
}

import Link from "next/link";

export default function HeroCyber() {
  return (
    <section className="relative overflow-hidden rounded-3xl glass border border-line text-white p-10 shadow-glow">
      <div className="max-w-xl">
        <h1 className="text-4xl md:text-5xl font-extrabold leading-tight">
          Heyyyy!! <span className="text-neon.mint">Welcome To</span>
          <br /> BookBuddy
        </h1>
        <p className="mt-3 text-white/80">
          Discover trending series, browse by category, build your wishlist, and
          buy instantly.
        </p>
        <div className="mt-6 flex gap-3">
          <Link href="/books_frontend" className="btn-neon">
            Browse Catalog
          </Link>
          <a
            href="#popular"
            className="rounded-xl border border-line px-5 py-2 text-white/80 hover:text-white hover:border-white/30"
          >
            View Popular
          </a>
        </div>
      </div>
      <div
        aria-hidden
        className="pointer-events-none absolute -right-12 -top-16 h-64 w-64 rounded-3xl"
        style={{
          background:
            "conic-gradient(from 0deg, #FF4DCD, #9A6BFF, #2FD8FF, #5CFFD8, #FF4DCD)",
          filter: "blur(50px)",
          opacity: 0.35,
        }}
      />
    </section>
  );
}

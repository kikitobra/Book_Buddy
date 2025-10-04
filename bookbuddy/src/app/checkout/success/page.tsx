"use client";

import { useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";

function SuccessContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const orderId = searchParams.get("orderId");

  useEffect(() => {
    if (!orderId) {
      router.replace("/");
    }
  }, [orderId, router]);

  if (!orderId) {
    return null;
  }

  return (
    <div className="max-w-2xl mx-auto text-center space-y-6 py-12">
      {/* Success Icon */}
      <div className="flex justify-center">
        <div className="w-24 h-24 rounded-full bg-neon.mint/20 border-2 border-neon.mint flex items-center justify-center">
          <svg
            className="w-12 h-12 text-neon.mint"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M5 13l4 4L19 7"
            />
          </svg>
        </div>
      </div>

      {/* Success Message */}
      <div className="space-y-2">
        <h1 className="text-3xl font-bold text-neon.mint">
          Order Placed Successfully!
        </h1>
        <p className="text-white/70">
          Thank you for your order. Your books will be delivered soon.
        </p>
      </div>

      {/* Order Details */}
      <div className="glass border border-line rounded-2xl p-6 space-y-4">
        <div className="space-y-2">
          <p className="text-sm text-white/60">Order Number</p>
          <p className="text-2xl font-bold font-mono">{orderId}</p>
        </div>

        <div className="border-t border-line pt-4">
          <p className="text-sm text-white/60 mb-2">Payment Method</p>
          <div className="flex items-center gap-2 justify-center">
            <svg
              className="w-5 h-5 text-neon.mint"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path d="M8.433 7.418c.155-.103.346-.196.567-.267v1.698a2.305 2.305 0 01-.567-.267C8.07 8.34 8 8.114 8 8c0-.114.07-.34.433-.582zM11 12.849v-1.698c.22.071.412.164.567.267.364.243.433.468.433.582 0 .114-.07.34-.433.582a2.305 2.305 0 01-.567.267z" />
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-13a1 1 0 10-2 0v.092a4.535 4.535 0 00-1.676.662C6.602 6.234 6 7.009 6 8c0 .99.602 1.765 1.324 2.246.48.32 1.054.545 1.676.662v1.941c-.391-.127-.68-.317-.843-.504a1 1 0 10-1.51 1.31c.562.649 1.413 1.076 2.353 1.253V15a1 1 0 102 0v-.092a4.535 4.535 0 001.676-.662C13.398 13.766 14 12.991 14 12c0-.99-.602-1.765-1.324-2.246A4.535 4.535 0 0011 9.092V7.151c.391.127.68.317.843.504a1 1 0 101.511-1.31c-.563-.649-1.413-1.076-2.354-1.253V5z"
                clipRule="evenodd"
              />
            </svg>
            <span className="font-medium text-neon.mint">Cash on Delivery</span>
          </div>
        </div>

        <div className="border-t border-line pt-4 text-sm text-white/60">
          <p>
            A confirmation email has been sent to your registered email address.
          </p>
          <p className="mt-2">
            You can track your order status in your account.
          </p>
        </div>
      </div>

      {/* Actions */}
      <div className="flex flex-col sm:flex-row gap-3 justify-center">
        <Link href="/account" className="btn-neon">
          View My Orders
        </Link>
        <Link
          href="/books_frontend"
          className="rounded-xl border border-line px-6 py-3 text-white/80 hover:text-white hover:border-white/30"
        >
          Continue Shopping
        </Link>
      </div>

      {/* Additional Info */}
      <div className="mt-8 p-4 rounded-xl bg-white/5 border border-line">
        <p className="text-sm text-white/70">
          📦 Estimated delivery: 3-5 business days
        </p>
      </div>
    </div>
  );
}

export default function CheckoutSuccessPage() {
  return (
    <Suspense
      fallback={
        <div className="max-w-2xl mx-auto text-center py-12">
          <div className="animate-pulse space-y-6">
            <div className="w-24 h-24 rounded-full bg-white/10 mx-auto"></div>
            <div className="h-8 bg-white/10 rounded w-64 mx-auto"></div>
            <div className="h-4 bg-white/10 rounded w-48 mx-auto"></div>
          </div>
        </div>
      }
    >
      <SuccessContent />
    </Suspense>
  );
}

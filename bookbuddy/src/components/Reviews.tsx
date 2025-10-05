"use client";

import { useState, useEffect } from "react";
import { getApiPath, getAssetPath } from "@/lib/utils";

type Review = {
  _id: string;
  bookId: string;
  userId: string;
  rating: number;
  comment: string;
  createdAt: string;
  userName: string;
  userEmail?: string;
};

type ReviewsProps = {
  bookId: string;
};

export default function Reviews({ bookId }: ReviewsProps) {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [averageRating, setAverageRating] = useState(0);
  const [totalReviews, setTotalReviews] = useState(0);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // Review form state
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [userHasReviewed, setUserHasReviewed] = useState(false);

  useEffect(() => {
    fetchReviews();
  }, [bookId]);

  const fetchReviews = async () => {
    try {
      const res = await fetch(getApiPath(`/api/reviews?bookId=${bookId}`));
      const data = await res.json();

      if (data.ok) {
        setReviews(data.reviews);
        setAverageRating(data.averageRating);
        setTotalReviews(data.totalReviews);

        // Check if current user has already reviewed
        const currentUserId = localStorage.getItem("user_email"); // or use userId
        const hasReviewed = data.reviews.some(
          (r: Review) => r.userEmail === currentUserId
        );
        setUserHasReviewed(hasReviewed);
      }
    } catch (e) {
      console.error("Failed to load reviews:", e);
    } finally {
      setLoading(false);
    }
  };

  const submitReview = async (e: React.FormEvent) => {
    e.preventDefault();

    const token = localStorage.getItem("auth_token");
    if (!token) {
      alert("Please sign in to leave a review");
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch(getApiPath("/api/reviews"), {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          bookId,
          rating,
          comment,
        }),
      });

      const data = await res.json();

      if (data.ok) {
        setComment("");
        setRating(5);
        setShowForm(false);
        fetchReviews(); // Refresh reviews
        alert("Review submitted successfully!");
      } else {
        alert(data.error || "Failed to submit review");
      }
    } catch (e) {
      alert("Failed to submit review");
    } finally {
      setSubmitting(false);
    }
  };

  const renderStars = (
    rating: number,
    interactive = false,
    onRate?: (r: number) => void
  ) => {
    return (
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type={interactive ? "button" : undefined}
            onClick={() => interactive && onRate?.(star)}
            className={`${
              interactive ? "cursor-pointer hover:scale-110" : ""
            } transition`}
            disabled={!interactive}
          >
            <svg
              className={`w-5 h-5 ${
                star <= rating
                  ? "text-yellow-400 fill-yellow-400"
                  : "text-gray-400"
              }`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"
              />
            </svg>
          </button>
        ))}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <img
          src={getAssetPath("/Figure-Gif-unscreen.gif")}
          alt="Loading"
          className="w-16 h-16 object-contain"
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Rating Summary */}
      <div className="glass border border-line rounded-2xl p-6">
        <div className="flex items-center gap-6">
          <div className="text-center">
            <div className="text-4xl font-bold text-white">
              {averageRating.toFixed(1)}
            </div>
            <div className="mt-1">{renderStars(Math.round(averageRating))}</div>
            <div className="mt-1 text-sm text-white/60">
              {totalReviews} reviews
            </div>
          </div>

          {!userHasReviewed && (
            <button
              onClick={() => setShowForm(!showForm)}
              className="ml-auto px-4 py-2 rounded-lg bg-purple-600 hover:bg-purple-700 text-white transition"
            >
              {showForm ? "Cancel" : "Write a Review"}
            </button>
          )}
        </div>

        {/* Review Form */}
        {showForm && (
          <form
            onSubmit={submitReview}
            className="mt-6 space-y-4 border-t border-white/10 pt-6"
          >
            <div>
              <label className="block text-sm text-white/70 mb-2">
                Your Rating
              </label>
              {renderStars(rating, true, setRating)}
            </div>

            <div>
              <label className="block text-sm text-white/70 mb-2">
                Your Review
              </label>
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Share your thoughts about this book..."
                rows={4}
                className="w-full rounded-xl border border-line bg-panel text-white px-4 py-3 resize-none"
              />
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="px-6 py-2 rounded-lg bg-gradient-to-r from-pink-500 to-purple-600 text-white disabled:opacity-50 transition"
            >
              {submitting ? "Submitting..." : "Submit Review"}
            </button>
          </form>
        )}
      </div>

      {/* Reviews List */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-white">Customer Reviews</h3>

        {reviews.length === 0 ? (
          <div className="glass border border-line rounded-2xl p-8 text-center">
            <p className="text-white/60">
              No reviews yet. Be the first to review this book!
            </p>
          </div>
        ) : (
          reviews.map((review) => (
            <div
              key={review._id}
              className="glass border border-line rounded-2xl p-4"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-r from-pink-500 to-purple-600 flex items-center justify-center text-white font-semibold">
                      {review.userName.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p className="font-medium text-white">
                        {review.userName}
                      </p>
                      <div className="flex items-center gap-2 mt-1">
                        {renderStars(review.rating)}
                        <span className="text-xs text-white/60">
                          {new Date(review.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </div>

                  {review.comment && (
                    <p className="mt-3 text-white/80 leading-relaxed">
                      {review.comment}
                    </p>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

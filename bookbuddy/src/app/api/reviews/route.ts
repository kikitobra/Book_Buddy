import { NextRequest, NextResponse } from "next/server";
import { verifyToken } from "@/lib/auth";
import { getDb } from "@/lib/mongodb";
import { ObjectId } from "mongodb";

// GET - Fetch reviews for a book
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const bookId = searchParams.get("bookId");

    if (!bookId) {
      return NextResponse.json(
        { ok: false, error: "Book ID is required" },
        { status: 400 }
      );
    }

    const db = await getDb();
    const reviewsCollection = db.collection("reviews");
    const usersCollection = db.collection("users");

    // Get all reviews for this book
    const reviews = await reviewsCollection
      .find({ bookId })
      .sort({ createdAt: -1 })
      .toArray();

    // Enrich reviews with user information
    const enrichedReviews = await Promise.all(
      reviews.map(async (review) => {
        const user = await usersCollection.findOne(
          { _id: new ObjectId(review.userId) },
          { projection: { name: 1, email: 1 } }
        );
        return {
          ...review,
          userName: user?.name || "Anonymous",
          userEmail: user?.email,
        };
      })
    );

    // Calculate average rating
    const avgRating =
      reviews.length > 0
        ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
        : 0;

    return NextResponse.json({
      ok: true,
      reviews: enrichedReviews,
      averageRating: parseFloat(avgRating.toFixed(1)),
      totalReviews: reviews.length,
    });
  } catch (e: any) {
    return NextResponse.json(
      { ok: false, error: e?.message || "Failed to fetch reviews" },
      { status: 500 }
    );
  }
}

// POST - Create a new review
export async function POST(req: NextRequest) {
  try {
    const { bookId, rating, comment } = await req.json();

    if (!bookId || !rating) {
      return NextResponse.json(
        { ok: false, error: "Book ID and rating are required" },
        { status: 400 }
      );
    }

    if (rating < 1 || rating > 5) {
      return NextResponse.json(
        { ok: false, error: "Rating must be between 1 and 5" },
        { status: 400 }
      );
    }

    // Get token from Authorization header
    const authHeader = req.headers.get("authorization");
    const token = authHeader?.replace("Bearer ", "");

    if (!token) {
      return NextResponse.json(
        { ok: false, error: "Authentication required" },
        { status: 401 }
      );
    }

    const payload = await verifyToken(token);
    if (!payload) {
      return NextResponse.json(
        { ok: false, error: "Invalid token" },
        { status: 401 }
      );
    }

    const db = await getDb();
    const reviewsCollection = db.collection("reviews");

    // Check if user already reviewed this book
    const existingReview = await reviewsCollection.findOne({
      bookId,
      userId: payload.userId,
    });

    if (existingReview) {
      return NextResponse.json(
        { ok: false, error: "You have already reviewed this book" },
        { status: 400 }
      );
    }

    // Create review document
    const review = {
      bookId,
      userId: payload.userId,
      rating,
      comment: comment || "",
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const result = await reviewsCollection.insertOne(review);

    return NextResponse.json(
      {
        ok: true,
        reviewId: result.insertedId,
        message: "Review submitted successfully",
      },
      { status: 201 }
    );
  } catch (e: any) {
    return NextResponse.json(
      { ok: false, error: e?.message || "Failed to create review" },
      { status: 500 }
    );
  }
}

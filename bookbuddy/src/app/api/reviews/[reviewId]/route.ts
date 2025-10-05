import { NextRequest, NextResponse } from "next/server";
import { verifyToken } from "@/lib/auth";
import { getDb } from "@/lib/mongodb";
import { ObjectId } from "mongodb";

// PATCH - Update a review
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ reviewId: string }> }
) {
  try {
    const { reviewId } = await params;
    const { rating, comment } = await req.json();

    if (!rating || rating < 1 || rating > 5) {
      return NextResponse.json(
        { ok: false, error: "Valid rating (1-5) is required" },
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

    // Update review (only if user owns it)
    const result = await reviewsCollection.updateOne(
      {
        _id: new ObjectId(reviewId),
        userId: payload.userId,
      },
      {
        $set: {
          rating,
          comment: comment || "",
          updatedAt: new Date(),
        },
      }
    );

    if (result.matchedCount === 0) {
      return NextResponse.json(
        { ok: false, error: "Review not found or unauthorized" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      ok: true,
      message: "Review updated successfully",
    });
  } catch (e: any) {
    return NextResponse.json(
      { ok: false, error: e?.message || "Failed to update review" },
      { status: 500 }
    );
  }
}

// DELETE - Delete a review
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ reviewId: string }> }
) {
  try {
    const { reviewId } = await params;

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

    // Delete review (only if user owns it)
    const result = await reviewsCollection.deleteOne({
      _id: new ObjectId(reviewId),
      userId: payload.userId,
    });

    if (result.deletedCount === 0) {
      return NextResponse.json(
        { ok: false, error: "Review not found or unauthorized" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      ok: true,
      message: "Review deleted successfully",
    });
  } catch (e: any) {
    return NextResponse.json(
      { ok: false, error: e?.message || "Failed to delete review" },
      { status: 500 }
    );
  }
}

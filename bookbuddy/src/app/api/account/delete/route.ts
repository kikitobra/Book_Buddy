import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/mongodb";
import { verifyToken } from "@/lib/auth";
import { ObjectId } from "mongodb";

/**
 * DELETE /api/account/delete
 * Delete user account and all related data (orders, reviews, wishlist)
 */
export async function DELETE(req: NextRequest) {
  try {
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
    if (!payload?.userId) {
      return NextResponse.json(
        { ok: false, error: "Invalid token" },
        { status: 401 }
      );
    }

    const db = await getDb();
    const userId = payload.userId;

    // Start a session for transaction (optional but recommended for data consistency)
    // Delete all user-related data
    const deleteOperations = await Promise.all([
      // 1. Delete all orders
      db.collection("orders").deleteMany({ userId }),

      // 2. Delete all reviews
      db.collection("reviews").deleteMany({ userId }),

      // 3. Delete all wishlist items
      db.collection("wishlist").deleteMany({ userId }),

      // 4. Finally, delete the user account
      db.collection("users").deleteOne({ _id: new ObjectId(userId) }),
    ]);

    const [ordersResult, reviewsResult, wishlistResult, userResult] =
      deleteOperations;

    return NextResponse.json({
      ok: true,
      message: "Account and all related data deleted successfully",
      deleted: {
        orders: ordersResult.deletedCount,
        reviews: reviewsResult.deletedCount,
        wishlist: wishlistResult.deletedCount,
        user: userResult.deletedCount,
      },
    });
  } catch (err) {
    console.error("Error deleting account:", err);
    return NextResponse.json(
      { ok: false, error: "Failed to delete account" },
      { status: 500 }
    );
  }
}

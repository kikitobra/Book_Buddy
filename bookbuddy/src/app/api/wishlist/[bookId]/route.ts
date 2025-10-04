import { NextRequest, NextResponse } from "next/server";
import { verifyToken } from "@/lib/auth";
import { getDb } from "@/lib/mongodb";
import { ObjectId } from "mongodb";

// DELETE - Remove item from wishlist
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ bookId: string }> }
) {
  try {
    const { bookId } = await params;

    if (!bookId) {
      return NextResponse.json(
        { ok: false, error: "Book ID required" },
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
    const wishlistCollection = db.collection("wishlist");

    // Remove from wishlist
    const result = await wishlistCollection.deleteOne({
      userId: new ObjectId(payload.userId),
      bookId: new ObjectId(bookId),
    });

    if (result.deletedCount === 0) {
      return NextResponse.json(
        { ok: false, error: "Item not found in wishlist" },
        { status: 404 }
      );
    }

    return NextResponse.json({ ok: true });
  } catch (e: any) {
    return NextResponse.json(
      { ok: false, error: e?.message || "Failed to remove from wishlist" },
      { status: 500 }
    );
  }
}

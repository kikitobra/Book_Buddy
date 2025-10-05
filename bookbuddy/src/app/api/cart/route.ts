import { NextRequest, NextResponse } from "next/server";
import { verifyToken } from "@/lib/auth";
import { getDb } from "@/lib/mongodb";

/**
 * GET /api/cart - Get user's cart items
 */
export async function GET(req: NextRequest) {
  try {
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
    const cartCollection = db.collection("cart");

    const cart = await cartCollection.findOne({ userId: payload.userId });

    return NextResponse.json({
      ok: true,
      items: cart?.items || [],
    });
  } catch (err) {
    console.error("Error fetching cart:", err);
    return NextResponse.json(
      { ok: false, error: "Failed to fetch cart" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/cart - Save user's cart items
 */
export async function POST(req: NextRequest) {
  try {
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

    const { items } = await req.json();

    const db = await getDb();
    const cartCollection = db.collection("cart");

    await cartCollection.updateOne(
      { userId: payload.userId },
      {
        $set: {
          items,
          updatedAt: new Date(),
        },
        $setOnInsert: {
          createdAt: new Date(),
        },
      },
      { upsert: true }
    );

    return NextResponse.json({
      ok: true,
      message: "Cart saved successfully",
    });
  } catch (err) {
    console.error("Error saving cart:", err);
    return NextResponse.json(
      { ok: false, error: "Failed to save cart" },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/cart - Clear user's cart
 */
export async function DELETE(req: NextRequest) {
  try {
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
    const cartCollection = db.collection("cart");

    await cartCollection.deleteOne({ userId: payload.userId });

    return NextResponse.json({
      ok: true,
      message: "Cart cleared successfully",
    });
  } catch (err) {
    console.error("Error clearing cart:", err);
    return NextResponse.json(
      { ok: false, error: "Failed to clear cart" },
      { status: 500 }
    );
  }
}

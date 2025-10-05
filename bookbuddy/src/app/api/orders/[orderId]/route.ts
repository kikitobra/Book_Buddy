import { NextRequest, NextResponse } from "next/server";
import { verifyToken } from "@/lib/auth";
import { getDb } from "@/lib/mongodb";
import { ObjectId } from "mongodb";

// PATCH - Update order status
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ orderId: string }> }
) {
  try {
    const { orderId } = await params;
    const { status } = await req.json();

    if (!status) {
      return NextResponse.json(
        { ok: false, error: "Status is required" },
        { status: 400 }
      );
    }

    // Validate status
    const validStatuses = [
      "pending",
      "processing",
      "shipped",
      "delivered",
      "cancelled",
    ];
    if (!validStatuses.includes(status)) {
      return NextResponse.json(
        { ok: false, error: "Invalid status" },
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
    const ordersCollection = db.collection("orders");
    const booksCollection = db.collection("books");

    // Find the order
    const order = await ordersCollection.findOne({
      orderId,
      userId: payload.userId,
    });

    if (!order) {
      return NextResponse.json(
        { ok: false, error: "Order not found" },
        { status: 404 }
      );
    }

    const previousStatus = order.status;

    // Statuses that reduce inventory: processing, shipped, delivered
    const inventoryReducingStatuses = ["processing", "shipped", "delivered"];
    const wasReducing = inventoryReducingStatuses.includes(previousStatus);
    const isReducing = inventoryReducingStatuses.includes(status);

    // If changing TO a status that reduces inventory (and wasn't already reducing)
    if (!wasReducing && isReducing) {
      // Reduce book quantities
      for (const item of order.items) {
        const bookId = item.bookId;

        // Try to parse as ObjectId, otherwise treat as string
        let bookFilter;
        try {
          bookFilter = { _id: new ObjectId(bookId) };
        } catch {
          bookFilter = { id: bookId };
        }

        const book = await booksCollection.findOne(bookFilter);

        if (book) {
          const newQuantity = Math.max(0, (book.quantity || 0) - item.quantity);

          await booksCollection.updateOne(bookFilter, {
            $set: {
              quantity: newQuantity,
              updatedAt: new Date(),
            },
          });
        }
      }
    }

    // If changing FROM a reducing status TO a non-reducing status (pending or cancelled), restore inventory
    if (wasReducing && !isReducing) {
      // Restore book quantities
      for (const item of order.items) {
        const bookId = item.bookId;

        // Try to parse as ObjectId, otherwise treat as string
        let bookFilter;
        try {
          bookFilter = { _id: new ObjectId(bookId) };
        } catch {
          bookFilter = { id: bookId };
        }

        const book = await booksCollection.findOne(bookFilter);

        if (book) {
          const newQuantity = (book.quantity || 0) + item.quantity;

          await booksCollection.updateOne(bookFilter, {
            $set: {
              quantity: newQuantity,
              updatedAt: new Date(),
            },
          });
        }
      }
    }

    // Update order status
    const result = await ordersCollection.updateOne(
      { orderId, userId: payload.userId },
      {
        $set: {
          status,
          updatedAt: new Date(),
        },
      }
    );

    if (result.matchedCount === 0) {
      return NextResponse.json(
        { ok: false, error: "Order not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      ok: true,
      message: "Order status updated successfully",
      status,
      inventoryUpdated: wasReducing !== isReducing,
      previousStatus,
    });
  } catch (e: any) {
    return NextResponse.json(
      { ok: false, error: e?.message || "Failed to update order status" },
      { status: 500 }
    );
  }
}

// GET - Get specific order details
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ orderId: string }> }
) {
  try {
    const { orderId } = await params;

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
    const ordersCollection = db.collection("orders");

    const order = await ordersCollection.findOne({
      orderId,
      userId: payload.userId,
    });

    if (!order) {
      return NextResponse.json(
        { ok: false, error: "Order not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ ok: true, order });
  } catch (e: any) {
    return NextResponse.json(
      { ok: false, error: e?.message || "Failed to fetch order" },
      { status: 500 }
    );
  }
}

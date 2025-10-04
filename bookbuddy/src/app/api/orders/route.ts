import { NextRequest, NextResponse } from "next/server";
import { verifyToken } from "@/lib/auth";
import { getDb } from "@/lib/mongodb";
import { ObjectId } from "mongodb";

// GET - Fetch user's orders
export async function GET(req: NextRequest) {
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
    if (!payload) {
      return NextResponse.json(
        { ok: false, error: "Invalid token" },
        { status: 401 }
      );
    }

    const db = await getDb();
    const ordersCollection = db.collection("orders");

    // Get user's orders (userId stored as string)
    const orders = await ordersCollection
      .find({ userId: payload.userId })
      .sort({ createdAt: -1 })
      .toArray();

    return NextResponse.json({ ok: true, orders });
  } catch (e: any) {
    return NextResponse.json(
      { ok: false, error: e?.message || "Failed to fetch orders" },
      { status: 500 }
    );
  }
}

// POST - Create a new order
export async function POST(req: NextRequest) {
  try {
    const { items, shippingAddress, total, paymentMethod } = await req.json();

    if (!items || items.length === 0) {
      return NextResponse.json(
        { ok: false, error: "No items in order" },
        { status: 400 }
      );
    }

    if (
      !shippingAddress ||
      !shippingAddress.fullName ||
      !shippingAddress.phone ||
      !shippingAddress.street
    ) {
      return NextResponse.json(
        { ok: false, error: "Shipping address required" },
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

    // Generate order ID
    const orderCount = await ordersCollection.countDocuments();
    const orderId = `BB-${new Date()
      .toISOString()
      .slice(0, 10)
      .replace(/-/g, "")}-${String(orderCount + 1).padStart(4, "0")}`;

    // Create order document
    const order = {
      orderId,
      userId: payload.userId, // Store as string to match schema
      items,
      shippingAddress,
      total,
      paymentMethod: paymentMethod || "Cash on Delivery",
      status: "pending", // Use lowercase to match schema enum
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const result = await ordersCollection.insertOne(order);

    return NextResponse.json(
      {
        ok: true,
        orderId,
        _id: result.insertedId,
      },
      { status: 201 }
    );
  } catch (e: any) {
    return NextResponse.json(
      { ok: false, error: e?.message || "Failed to create order" },
      { status: 500 }
    );
  }
}

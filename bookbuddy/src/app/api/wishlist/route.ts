import { NextRequest, NextResponse } from "next/server";
import { verifyToken, usersCollection } from "@/lib/auth";
import { getDb } from "@/lib/mongodb";
import { ObjectId } from "mongodb";

// GET - Fetch user's wishlist
export async function GET(req: NextRequest) {
  try {
    // Get token from Authorization header
    const authHeader = req.headers.get("authorization");
    const token = authHeader?.replace("Bearer ", "");
    
    if (!token) {
      return NextResponse.json({ ok: false, error: "Authentication required" }, { status: 401 });
    }

    const payload = await verifyToken(token);
    if (!payload) {
      return NextResponse.json({ ok: false, error: "Invalid token" }, { status: 401 });
    }

    const db = await getDb();
    const wishlistCollection = db.collection("wishlist");
    const booksCollection = db.collection(process.env.COLLECTION_NAME || "book_inventory");

    // Get user's wishlist items
    const wishlistItems = await wishlistCollection
      .find({ userId: new ObjectId(payload.userId) })
      .toArray();

    // Get book details for each wishlist item
    const bookIds = wishlistItems.map(item => new ObjectId(item.bookId));
    const books = await booksCollection
      .find({ _id: { $in: bookIds } })
      .toArray();

    // Combine wishlist data with book details
    const wishlist = wishlistItems.map(item => {
      const book = books.find(b => b._id.toString() === item.bookId.toString());
      return {
        _id: item._id,
        bookId: item.bookId,
        addedAt: item.addedAt,
        book: book ? {
          id: book._id.toString(),
          title: book.title,
          author: book.author,
          cover: book.cover_url || "",
          isbn: book.isbn,
          genre: book.genre,
          quantity: book.quantity
        } : null
      };
    }).filter(item => item.book !== null); // Remove items where book was not found

    return NextResponse.json({ ok: true, wishlist });
  } catch (e: any) {
    return NextResponse.json(
      { ok: false, error: e?.message || "Failed to fetch wishlist" },
      { status: 500 }
    );
  }
}

// POST - Add item to wishlist
export async function POST(req: NextRequest) {
  try {
    const { bookId } = await req.json();
    
    if (!bookId) {
      return NextResponse.json({ ok: false, error: "Book ID required" }, { status: 400 });
    }

    // Get token from Authorization header
    const authHeader = req.headers.get("authorization");
    const token = authHeader?.replace("Bearer ", "");
    
    if (!token) {
      return NextResponse.json({ ok: false, error: "Authentication required" }, { status: 401 });
    }

    const payload = await verifyToken(token);
    if (!payload) {
      return NextResponse.json({ ok: false, error: "Invalid token" }, { status: 401 });
    }

    const db = await getDb();
    const wishlistCollection = db.collection("wishlist");
    const booksCollection = db.collection(process.env.COLLECTION_NAME || "book_inventory");

    // Check if book exists
    const book = await booksCollection.findOne({ _id: new ObjectId(bookId) });
    if (!book) {
      return NextResponse.json({ ok: false, error: "Book not found" }, { status: 404 });
    }

    // Check if item already in wishlist
    const existing = await wishlistCollection.findOne({
      userId: new ObjectId(payload.userId),
      bookId: new ObjectId(bookId)
    });

    if (existing) {
      return NextResponse.json({ ok: false, error: "Book already in wishlist" }, { status: 409 });
    }

    // Add to wishlist
    const result = await wishlistCollection.insertOne({
      userId: new ObjectId(payload.userId),
      bookId: new ObjectId(bookId),
      addedAt: new Date()
    });

    return NextResponse.json({ ok: true, id: result.insertedId }, { status: 201 });
  } catch (e: any) {
    return NextResponse.json(
      { ok: false, error: e?.message || "Failed to add to wishlist" },
      { status: 500 }
    );
  }
}

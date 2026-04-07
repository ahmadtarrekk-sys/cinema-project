import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import jwt from "jsonwebtoken";

export async function GET() {
  try {
    const session = await auth();

    if (!session || !session.user || !session.user.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const SOCKET_SECRET = process.env.SOCKET_SECRET || "development-secret";
    
    // Create a very short-lived token specifically for socket authentication
    // Includes userId and role
    const token = jwt.sign(
      { userId: session.user.id, role: session.user.role },
      SOCKET_SECRET,
      { expiresIn: "5m" }
    );

    return NextResponse.json({ token });
  } catch (error) {
    console.error("Failed to generate socket token:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

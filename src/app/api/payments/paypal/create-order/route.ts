import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { generatePayPalAccessToken, PAYPAL_API_BASE } from "@/lib/paypal";

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { bookingId } = await req.json();

    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
      include: { tickets: true }
    });

    if (!booking) return NextResponse.json({ error: "Booking not found" }, { status: 404 });
    if (booking.userId !== session.user.id) return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    if (booking.status !== "DRAFT") return NextResponse.json({ error: "Booking invalid state for payment" }, { status: 400 });

    // Verify SeatHolds are still active
    const seatIds = booking.tickets.map(t => t.seatId);
    for (const seatId of seatIds) {
      const lock = await prisma.seatHold.findUnique({
        where: { showtimeId_seatId: { showtimeId: booking.showtimeId, seatId } }
      });
      
      if (!lock || lock.userId !== session.user.id || lock.expiresAt <= new Date()) {
        return NextResponse.json({ 
          error: "Your seat reservation expired. Please return to seat selection." 
        }, { status: 400 });
      }
    }

    const PAYPAL_CLIENT_ID = process.env.PAYPAL_CLIENT_ID;
    if (!PAYPAL_CLIENT_ID) {
      return NextResponse.json({ mockFallback: true });
    }

    const accessToken = await generatePayPalAccessToken();
    
    // Convert float EGP or USD amount to string decimal for PayPal
    const amountVal = booking.totalAmount.toFixed(2).toString();

    // PayPal API create order request
    const response = await fetch(`${PAYPAL_API_BASE}/v2/checkout/orders`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify({
        intent: "CAPTURE",
        purchase_units: [
          {
            reference_id: booking.id,
            amount: {
              currency_code: "USD", // Example: normally EGP requires custom config or conversion since it's not natively fully supported globally by default in standard checkout UI without currency overrides, but let's use USD for safe standard operation or we can use the EGP if permitted.
              value: amountVal,
            },
          },
        ],
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error("PayPal order error", data);
      throw new Error("Failed to create PayPal order");
    }

    return NextResponse.json({ orderID: data.id });
  } catch (err: any) {
    console.error("PAYPAL_CREATE_ERROR:", err.message);
    return NextResponse.json({ error: "Server Error" }, { status: 500 });
  }
}

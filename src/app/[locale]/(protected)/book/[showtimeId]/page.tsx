import { notFound } from "next/navigation";
import { getShowtimeDetails } from "@/lib/actions/showtimes";
import { getLocale } from "next-intl/server";
import { BookingClient } from "@/components/booking/booking-client";

interface BookingPageProps {
  params: { showtimeId: string; locale: string };
}

export default async function BookingPage({ params }: BookingPageProps) {
  // Await the params before using its properties
  const { showtimeId } = await params;
  const locale = await getLocale();
  const isArabic = locale === "ar";
  
  const { data: showtime, success } = await getShowtimeDetails(showtimeId);

  if (!success || !showtime) {
    notFound();
  }

  const bookedSeatIds = showtime.tickets.map((t: any) => t.seatId);

  return (
    <BookingClient 
      showtime={showtime} 
      bookedSeatIds={bookedSeatIds} 
      isArabic={isArabic} 
    />
  );
}

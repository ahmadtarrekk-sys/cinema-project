import { NextResponse } from "next/server";
import { generateRollingSchedule } from "@/lib/actions/schedule";

export async function GET(req: Request) {
  // Check for authorization to prevent random pings from hitting this endpoint
  const authHeader = req.headers.get("authorization");
  
  if (process.env.CRON_SECRET) {
      if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }
  }

  const result = await generateRollingSchedule();
  
  if (result.success) {
    return NextResponse.json(result, { status: 200 });
  } else {
    return NextResponse.json(result, { status: 500 });
  }
}

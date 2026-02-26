import { NextRequest, NextResponse } from "next/server";
import { getWeekAvailability } from "@/lib/availability";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const week = await getWeekAvailability(id);

    return NextResponse.json({
      doctorId: id,
      week,
    });
  } catch (error) {
    console.error("Week availability error:", error);
    return NextResponse.json(
      { error: "Failed to fetch weekly availability" },
      { status: 500 }
    );
  }
}

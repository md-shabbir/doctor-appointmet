import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const doctors = await prisma.doctor.findMany({
      where: { isActive: true, isVerified: true },
      select: { specialty: true },
      distinct: ["specialty"],
      orderBy: { specialty: "asc" },
    });

    const specialties = doctors.map((d: { specialty: string }) => d.specialty);

    return NextResponse.json({ specialties });
  } catch (error) {
    console.error("Specialties error:", error);
    return NextResponse.json(
      { error: "Failed to fetch specialties" },
      { status: 500 }
    );
  }
}

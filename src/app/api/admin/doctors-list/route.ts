import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const doctors = await prisma.doctor.findMany({
      include: { user: { select: { name: true, email: true } } },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({
      doctors: doctors.map((d: typeof doctors[number]) => ({
        id: d.id,
        name: d.user.name,
        email: d.user.email,
        specialty: d.specialty,
        experience: d.experience,
        city: d.city,
        isVerified: d.isVerified,
        isActive: d.isActive,
      })),
    });
  } catch (error) {
    console.error("Admin doctors list error:", error);
    return NextResponse.json({ error: "Failed to fetch" }, { status: 500 });
  }
}

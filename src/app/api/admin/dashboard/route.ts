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

    const [
      totalDoctors,
      unverifiedDoctors,
      totalPatients,
      totalAppointments,
      pendingReviews,
      completedThisMonth,
    ] = await Promise.all([
      prisma.doctor.count(),
      prisma.doctor.count({ where: { isVerified: false } }),
      prisma.patient.count(),
      prisma.appointment.count(),
      prisma.review.count({ where: { isApproved: false } }),
      prisma.appointment.count({
        where: {
          status: "COMPLETED",
          date: {
            gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
          },
        },
      }),
    ]);

    return NextResponse.json({
      totalDoctors,
      unverifiedDoctors,
      totalPatients,
      totalAppointments,
      pendingReviews,
      completedThisMonth,
    });
  } catch (error) {
    console.error("Admin dashboard error:", error);
    return NextResponse.json({ error: "Failed to load" }, { status: 500 });
  }
}

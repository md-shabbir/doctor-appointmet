import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user || session.user.role !== "DOCTOR") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const doctor = await prisma.doctor.findUnique({
      where: { userId: session.user.id },
    });

    if (!doctor) {
      return NextResponse.json({ error: "Doctor profile not found" }, { status: 404 });
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0, 23, 59, 59);

    const [
      todayAppointments,
      pendingCount,
      completedThisMonth,
      totalPatients,
      avgRatingResult,
    ] = await Promise.all([
      prisma.appointment.findMany({
        where: { doctorId: doctor.id, date: { gte: today, lt: tomorrow } },
        include: {
          patient: { include: { user: { select: { name: true } } } },
          familyMember: { select: { name: true } },
        },
        orderBy: { startTime: "asc" },
      }),
      prisma.appointment.count({
        where: { doctorId: doctor.id, status: "PENDING" },
      }),
      prisma.appointment.count({
        where: {
          doctorId: doctor.id,
          status: "COMPLETED",
          date: { gte: startOfMonth, lte: endOfMonth },
        },
      }),
      prisma.appointment.groupBy({
        by: ["patientId"],
        where: { doctorId: doctor.id },
      }),
      prisma.review.aggregate({
        where: { doctorId: doctor.id, isApproved: true },
        _avg: { rating: true },
        _count: true,
      }),
    ]);

    return NextResponse.json({
      todayAppointments: todayAppointments.map((a: typeof todayAppointments[number]) => ({
        id: a.id,
        patientName: a.bookingType === "FAMILY_MEMBER" && a.familyMember
          ? a.familyMember.name
          : a.patient.user.name,
        time: `${a.startTime} - ${a.endTime}`,
        status: a.status,
        reason: a.reason,
      })),
      todayCount: todayAppointments.length,
      pendingCount,
      completedThisMonth,
      totalPatients: totalPatients.length,
      avgRating: avgRatingResult._avg.rating
        ? Math.round(avgRatingResult._avg.rating * 10) / 10
        : 0,
      reviewCount: avgRatingResult._count,
    });
  } catch (error) {
    console.error("Doctor dashboard error:", error);
    return NextResponse.json({ error: "Failed to load dashboard" }, { status: 500 });
  }
}

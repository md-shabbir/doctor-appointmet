import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user || session.user.role !== "DOCTOR") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const doctor = await prisma.doctor.findUnique({
      where: { userId: session.user.id },
    });
    if (!doctor) return NextResponse.json({ error: "Doctor not found" }, { status: 404 });

    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");
    const dateStr = searchParams.get("date");
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const where: any = { doctorId: doctor.id };
    if (status) where.status = status;
    if (dateStr) {
      const date = new Date(dateStr + "T00:00:00");
      const nextDay = new Date(date);
      nextDay.setDate(nextDay.getDate() + 1);
      where.date = { gte: date, lt: nextDay };
    }

    const [appointments, totalCount] = await Promise.all([
      prisma.appointment.findMany({
        where,
        include: {
          patient: { include: { user: { select: { name: true, email: true } } } },
          familyMember: { select: { name: true, relation: true } },
          record: { select: { id: true } },
        },
        orderBy: [{ date: "desc" }, { startTime: "asc" }],
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.appointment.count({ where }),
    ]);

    return NextResponse.json({
      appointments: appointments.map((a: typeof appointments[number]) => ({
        id: a.id,
        patientName: a.bookingType === "FAMILY_MEMBER" && a.familyMember
          ? `${a.familyMember.name} (${a.familyMember.relation})`
          : a.patient.user.name,
        patientEmail: a.patient.user.email,
        date: a.date,
        startTime: a.startTime,
        endTime: a.endTime,
        status: a.status,
        reason: a.reason,
        bookingType: a.bookingType,
        hasMedicalRecord: !!a.record,
      })),
      totalCount,
      page,
      hasMore: page * limit < totalCount,
    });
  } catch (error) {
    console.error("Doctor appointments error:", error);
    return NextResponse.json({ error: "Failed to fetch appointments" }, { status: 500 });
  }
}

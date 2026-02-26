import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const patient = await prisma.patient.findUnique({
      where: { userId: session.user.id },
    });
    if (!patient) return NextResponse.json({ error: "Patient not found" }, { status: 404 });

    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const where: any = { patientId: patient.id };
    if (status) where.status = status;

    const [appointments, totalCount] = await Promise.all([
      prisma.appointment.findMany({
        where,
        include: {
          doctor: { include: { user: { select: { name: true } } } },
          familyMember: { select: { name: true, relation: true } },
          review: { select: { id: true } },
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
        doctorId: a.doctorId,
        doctorName: a.doctor.user.name,
        specialty: a.doctor.specialty,
        date: a.date,
        startTime: a.startTime,
        endTime: a.endTime,
        status: a.status,
        reason: a.reason,
        bookingType: a.bookingType,
        familyMemberName: a.familyMember?.name,
        hasReview: !!a.review,
      })),
      totalCount,
      page,
      hasMore: page * limit < totalCount,
    });
  } catch (error) {
    console.error("Patient appointments error:", error);
    return NextResponse.json({ error: "Failed to fetch" }, { status: 500 });
  }
}

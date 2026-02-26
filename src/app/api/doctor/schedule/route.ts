import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const scheduleSchema = z.object({
  dayOfWeek: z.number().min(0).max(6),
  startTime: z.string(),
  endTime: z.string(),
  slotDuration: z.number().min(10).max(120).default(30),
  isActive: z.boolean().default(true),
});

async function getDoctorId(userId: string) {
  const doctor = await prisma.doctor.findUnique({ where: { userId } });
  return doctor?.id;
}

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user || session.user.role !== "DOCTOR") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const doctorId = await getDoctorId(session.user.id);
    if (!doctorId) return NextResponse.json({ error: "Doctor not found" }, { status: 404 });

    const schedules = await prisma.schedule.findMany({
      where: { doctorId },
      orderBy: { dayOfWeek: "asc" },
    });

    return NextResponse.json({ schedules });
  } catch (error) {
    console.error("Schedule fetch error:", error);
    return NextResponse.json({ error: "Failed to fetch schedule" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user || session.user.role !== "DOCTOR") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const doctorId = await getDoctorId(session.user.id);
    if (!doctorId) return NextResponse.json({ error: "Doctor not found" }, { status: 404 });

    const body = await request.json();
    const data = scheduleSchema.parse(body);

    const schedule = await prisma.schedule.create({
      data: { doctorId, ...data },
    });

    return NextResponse.json({ schedule }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Validation failed", details: error.issues }, { status: 400 });
    }
    console.error("Schedule create error:", error);
    return NextResponse.json({ error: "Failed to create schedule" }, { status: 500 });
  }
}

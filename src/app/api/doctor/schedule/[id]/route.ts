import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const updateSchema = z.object({
  startTime: z.string().optional(),
  endTime: z.string().optional(),
  slotDuration: z.number().min(10).max(120).optional(),
  isActive: z.boolean().optional(),
});

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user || session.user.role !== "DOCTOR") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();
    const data = updateSchema.parse(body);

    const schedule = await prisma.schedule.findUnique({ where: { id } });
    if (!schedule) return NextResponse.json({ error: "Not found" }, { status: 404 });

    const doctor = await prisma.doctor.findUnique({ where: { userId: session.user.id } });
    if (!doctor || schedule.doctorId !== doctor.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const updated = await prisma.schedule.update({ where: { id }, data });
    return NextResponse.json({ schedule: updated });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Validation failed" }, { status: 400 });
    }
    console.error("Schedule update error:", error);
    return NextResponse.json({ error: "Failed to update" }, { status: 500 });
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user || session.user.role !== "DOCTOR") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const schedule = await prisma.schedule.findUnique({ where: { id } });
    if (!schedule) return NextResponse.json({ error: "Not found" }, { status: 404 });

    const doctor = await prisma.doctor.findUnique({ where: { userId: session.user.id } });
    if (!doctor || schedule.doctorId !== doctor.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    await prisma.schedule.delete({ where: { id } });
    return NextResponse.json({ message: "Deleted" });
  } catch (error) {
    console.error("Schedule delete error:", error);
    return NextResponse.json({ error: "Failed to delete" }, { status: 500 });
  }
}

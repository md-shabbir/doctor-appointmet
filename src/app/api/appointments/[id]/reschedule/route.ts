import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";
import { getAvailableSlots } from "@/lib/availability";

const rescheduleSchema = z.object({
  date: z.string(),
  startTime: z.string(),
  endTime: z.string(),
});

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();
    const data = rescheduleSchema.parse(body);

    const appointment = await prisma.appointment.findUnique({
      where: { id },
      include: { patient: true },
    });

    if (!appointment) {
      return NextResponse.json({ error: "Appointment not found" }, { status: 404 });
    }

    if (appointment.patient.userId !== session.user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    if (!["PENDING", "CONFIRMED"].includes(appointment.status)) {
      return NextResponse.json(
        { error: "Only pending or confirmed appointments can be rescheduled" },
        { status: 400 }
      );
    }

    // Check 24-hour reschedule policy
    const originalDateTime = new Date(appointment.date);
    const [h, m] = appointment.startTime.split(":").map(Number);
    originalDateTime.setHours(h, m, 0, 0);
    const hoursUntil = (originalDateTime.getTime() - Date.now()) / (1000 * 60 * 60);

    if (hoursUntil < 24) {
      return NextResponse.json(
        { error: "Cannot reschedule within 24 hours of appointment time" },
        { status: 400 }
      );
    }

    // Verify new slot is available
    const newDate = new Date(data.date + "T00:00:00");
    const slots = await getAvailableSlots(appointment.doctorId, newDate);
    const selectedSlot = slots.find(
      (s) => s.startTime === data.startTime && s.endTime === data.endTime
    );

    if (!selectedSlot || !selectedSlot.isAvailable) {
      return NextResponse.json(
        { error: "Selected time slot is not available" },
        { status: 409 }
      );
    }

    const updated = await prisma.appointment.update({
      where: { id },
      data: {
        date: newDate,
        startTime: data.startTime,
        endTime: data.endTime,
        status: "PENDING",
      },
    });

    return NextResponse.json({
      message: "Appointment rescheduled",
      appointment: {
        id: updated.id,
        date: data.date,
        startTime: updated.startTime,
        endTime: updated.endTime,
        status: updated.status,
      },
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation failed", details: error.issues },
        { status: 400 }
      );
    }
    console.error("Reschedule error:", error);
    return NextResponse.json({ error: "Failed to reschedule" }, { status: 500 });
  }
}

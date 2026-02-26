import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";
import { getAvailableSlots } from "@/lib/availability";

const bookingSchema = z.object({
  doctorId: z.string(),
  date: z.string(),
  startTime: z.string(),
  endTime: z.string(),
  reason: z.string().optional(),
  bookingType: z.enum(["SELF", "FAMILY_MEMBER"]).default("SELF"),
  familyMemberId: z.string().optional(),
});

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const data = bookingSchema.parse(body);

    // Get patient profile
    const patient = await prisma.patient.findUnique({
      where: { userId: session.user.id },
    });

    if (!patient) {
      return NextResponse.json(
        { error: "Patient profile not found" },
        { status: 404 }
      );
    }

    // Verify doctor exists and is active
    const doctor = await prisma.doctor.findUnique({
      where: { id: data.doctorId },
    });

    if (!doctor || !doctor.isActive || !doctor.isVerified) {
      return NextResponse.json(
        { error: "Doctor not found or unavailable" },
        { status: 404 }
      );
    }

    // Verify family member if booking type is FAMILY_MEMBER
    if (data.bookingType === "FAMILY_MEMBER") {
      if (!data.familyMemberId) {
        return NextResponse.json(
          { error: "Family member ID required for family booking" },
          { status: 400 }
        );
      }
      const familyMember = await prisma.familyMember.findFirst({
        where: { id: data.familyMemberId, patientId: patient.id },
      });
      if (!familyMember) {
        return NextResponse.json(
          { error: "Family member not found" },
          { status: 404 }
        );
      }
    }

    // Use transaction to prevent double booking
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const appointment = await prisma.$transaction(async (tx: any) => {
      // Re-check availability inside transaction
      const bookingDate = new Date(data.date + "T00:00:00");
      const slots = await getAvailableSlots(data.doctorId, bookingDate);
      const selectedSlot = slots.find(
        (s) => s.startTime === data.startTime && s.endTime === data.endTime
      );

      if (!selectedSlot || !selectedSlot.isAvailable) {
        throw new Error("SLOT_UNAVAILABLE");
      }

      // Check for conflicting appointment directly in DB (extra safety)
      const startOfDay = new Date(bookingDate);
      startOfDay.setHours(0, 0, 0, 0);
      const endOfDay = new Date(bookingDate);
      endOfDay.setHours(23, 59, 59, 999);

      const conflict = await tx.appointment.findFirst({
        where: {
          doctorId: data.doctorId,
          date: { gte: startOfDay, lte: endOfDay },
          startTime: data.startTime,
          status: { in: ["PENDING", "CONFIRMED"] },
        },
      });

      if (conflict) {
        throw new Error("SLOT_UNAVAILABLE");
      }

      // Create appointment
      return tx.appointment.create({
        data: {
          patientId: patient.id,
          doctorId: data.doctorId,
          date: bookingDate,
          startTime: data.startTime,
          endTime: data.endTime,
          reason: data.reason,
          bookingType: data.bookingType,
          familyMemberId: data.familyMemberId || null,
          status: "PENDING",
        },
        include: {
          doctor: {
            include: { user: { select: { name: true } } },
          },
        },
      });
    });

    return NextResponse.json(
      {
        message: "Appointment booked successfully",
        appointment: {
          id: appointment.id,
          doctorName: appointment.doctor.user.name,
          date: data.date,
          startTime: data.startTime,
          endTime: data.endTime,
          status: appointment.status,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    if ((error as Error).message === "SLOT_UNAVAILABLE") {
      return NextResponse.json(
        { error: "This time slot is no longer available. Please choose another." },
        { status: 409 }
      );
    }

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation failed", details: error.issues },
        { status: 400 }
      );
    }

    console.error("Booking error:", error);
    return NextResponse.json(
      { error: "Failed to book appointment" },
      { status: 500 }
    );
  }
}

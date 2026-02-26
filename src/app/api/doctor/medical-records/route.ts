import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const recordSchema = z.object({
  appointmentId: z.string(),
  diagnosis: z.string().optional(),
  symptoms: z.string().optional(),
  notes: z.string().optional(),
});

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user || session.user.role !== "DOCTOR") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const doctor = await prisma.doctor.findUnique({ where: { userId: session.user.id } });
    if (!doctor) return NextResponse.json({ error: "Doctor not found" }, { status: 404 });

    const body = await request.json();
    const data = recordSchema.parse(body);

    const appointment = await prisma.appointment.findUnique({
      where: { id: data.appointmentId },
      include: { record: true },
    });

    if (!appointment) return NextResponse.json({ error: "Appointment not found" }, { status: 404 });
    if (appointment.doctorId !== doctor.id) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    if (appointment.status !== "COMPLETED") {
      return NextResponse.json({ error: "Can only add records for completed appointments" }, { status: 400 });
    }
    if (appointment.record) {
      return NextResponse.json({ error: "Medical record already exists for this appointment" }, { status: 409 });
    }

    const record = await prisma.medicalRecord.create({
      data: {
        appointmentId: data.appointmentId,
        patientId: appointment.patientId,
        doctorId: doctor.id,
        diagnosis: data.diagnosis,
        symptoms: data.symptoms,
        notes: data.notes,
      },
    });

    return NextResponse.json({ record }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Validation failed", details: error.issues }, { status: 400 });
    }
    console.error("Medical record error:", error);
    return NextResponse.json({ error: "Failed to create record" }, { status: 500 });
  }
}

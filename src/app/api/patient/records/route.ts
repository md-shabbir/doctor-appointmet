import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const patient = await prisma.patient.findUnique({
      where: { userId: session.user.id },
    });
    if (!patient) return NextResponse.json({ error: "Patient not found" }, { status: 404 });

    const records = await prisma.medicalRecord.findMany({
      where: { patientId: patient.id },
      include: {
        doctor: { include: { user: { select: { name: true } } } },
        appointment: { select: { date: true, startTime: true } },
        prescription: true,
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({
      records: records.map((r: typeof records[number]) => ({
        id: r.id,
        doctorName: r.doctor.user.name,
        specialty: r.doctor.specialty,
        date: r.appointment.date,
        diagnosis: r.diagnosis,
        symptoms: r.symptoms,
        notes: r.notes,
        prescription: r.prescription
          ? {
              medications: r.prescription.medications,
              instructions: r.prescription.instructions,
            }
          : null,
      })),
    });
  } catch (error) {
    console.error("Patient records error:", error);
    return NextResponse.json({ error: "Failed to fetch records" }, { status: 500 });
  }
}

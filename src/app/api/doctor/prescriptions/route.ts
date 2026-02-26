import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const prescriptionSchema = z.object({
  medicalRecordId: z.string(),
  medications: z.array(
    z.object({
      name: z.string(),
      dosage: z.string(),
      frequency: z.string(),
      duration: z.string(),
    })
  ),
  instructions: z.string().optional(),
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
    const data = prescriptionSchema.parse(body);

    const record = await prisma.medicalRecord.findUnique({
      where: { id: data.medicalRecordId },
      include: { prescription: true },
    });

    if (!record) return NextResponse.json({ error: "Medical record not found" }, { status: 404 });
    if (record.doctorId !== doctor.id) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    if (record.prescription) {
      return NextResponse.json({ error: "Prescription already exists" }, { status: 409 });
    }

    const prescription = await prisma.prescription.create({
      data: {
        medicalRecordId: data.medicalRecordId,
        medications: data.medications,
        instructions: data.instructions,
      },
    });

    return NextResponse.json({ prescription }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Validation failed", details: error.issues }, { status: 400 });
    }
    console.error("Prescription error:", error);
    return NextResponse.json({ error: "Failed to create prescription" }, { status: 500 });
  }
}

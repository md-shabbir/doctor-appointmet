import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const statusSchema = z.object({
  status: z.enum(["CONFIRMED", "COMPLETED", "NO_SHOW"]),
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
    const data = statusSchema.parse(body);

    const appointment = await prisma.appointment.findUnique({
      where: { id },
      include: { doctor: true },
    });

    if (!appointment) {
      return NextResponse.json({ error: "Appointment not found" }, { status: 404 });
    }

    // Only doctor can update status
    if (appointment.doctor.userId !== session.user.id) {
      return NextResponse.json({ error: "Only the doctor can update appointment status" }, { status: 403 });
    }

    const updated = await prisma.appointment.update({
      where: { id },
      data: { status: data.status },
    });

    return NextResponse.json({
      message: `Appointment marked as ${data.status.toLowerCase()}`,
      appointment: { id: updated.id, status: updated.status },
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid status. Must be CONFIRMED, COMPLETED, or NO_SHOW" },
        { status: 400 }
      );
    }
    console.error("Status update error:", error);
    return NextResponse.json({ error: "Failed to update status" }, { status: 500 });
  }
}

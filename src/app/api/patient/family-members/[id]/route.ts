import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { id } = await params;
    const patient = await prisma.patient.findUnique({ where: { userId: session.user.id } });
    if (!patient) return NextResponse.json({ error: "Patient not found" }, { status: 404 });

    const member = await prisma.familyMember.findFirst({
      where: { id, patientId: patient.id },
    });
    if (!member) return NextResponse.json({ error: "Not found" }, { status: 404 });

    await prisma.familyMember.delete({ where: { id } });
    return NextResponse.json({ message: "Deleted" });
  } catch (error) {
    console.error("Family member delete error:", error);
    return NextResponse.json({ error: "Failed to delete" }, { status: 500 });
  }
}

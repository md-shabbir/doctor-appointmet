import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function PATCH(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    const doctor = await prisma.doctor.findUnique({ where: { id } });
    if (!doctor) {
      return NextResponse.json({ error: "Doctor not found" }, { status: 404 });
    }

    const updated = await prisma.doctor.update({
      where: { id },
      data: { isVerified: !doctor.isVerified },
    });

    return NextResponse.json({
      message: updated.isVerified ? "Doctor verified" : "Doctor unverified",
      doctor: { id: updated.id, isVerified: updated.isVerified },
    });
  } catch (error) {
    console.error("Verify error:", error);
    return NextResponse.json({ error: "Failed to update" }, { status: 500 });
  }
}

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const approved = searchParams.get("approved");

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const where: any = {};
    if (approved === "true") where.isApproved = true;
    else if (approved === "false") where.isApproved = false;

    const reviews = await prisma.review.findMany({
      where,
      include: {
        patient: { include: { user: { select: { name: true } } } },
        doctor: { include: { user: { select: { name: true } } } },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({
      reviews: reviews.map((r: typeof reviews[number]) => ({
        id: r.id,
        patientName: r.patient.user.name,
        doctorName: r.doctor.user.name,
        rating: r.rating,
        comment: r.comment,
        isApproved: r.isApproved,
        createdAt: r.createdAt,
      })),
    });
  } catch (error) {
    console.error("Admin reviews error:", error);
    return NextResponse.json({ error: "Failed to fetch" }, { status: 500 });
  }
}

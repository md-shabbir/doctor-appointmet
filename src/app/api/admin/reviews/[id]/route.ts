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

    const review = await prisma.review.findUnique({ where: { id } });
    if (!review) return NextResponse.json({ error: "Not found" }, { status: 404 });

    const updated = await prisma.review.update({
      where: { id },
      data: { isApproved: !review.isApproved },
    });

    return NextResponse.json({
      message: updated.isApproved ? "Review approved" : "Review unapproved",
      review: { id: updated.id, isApproved: updated.isApproved },
    });
  } catch (error) {
    console.error("Review moderate error:", error);
    return NextResponse.json({ error: "Failed to update" }, { status: 500 });
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    await prisma.review.delete({ where: { id } });
    return NextResponse.json({ message: "Review deleted" });
  } catch (error) {
    console.error("Review delete error:", error);
    return NextResponse.json({ error: "Failed to delete" }, { status: 500 });
  }
}

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const familyMemberSchema = z.object({
  name: z.string().min(2),
  relation: z.string().min(2),
  dateOfBirth: z.string().optional(),
  gender: z.string().optional(),
  bloodGroup: z.string().optional(),
  allergies: z.string().optional(),
});

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const patient = await prisma.patient.findUnique({ where: { userId: session.user.id } });
    if (!patient) return NextResponse.json({ error: "Patient not found" }, { status: 404 });

    const members = await prisma.familyMember.findMany({
      where: { patientId: patient.id },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ members });
  } catch (error) {
    console.error("Family members error:", error);
    return NextResponse.json({ error: "Failed to fetch" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const patient = await prisma.patient.findUnique({ where: { userId: session.user.id } });
    if (!patient) return NextResponse.json({ error: "Patient not found" }, { status: 404 });

    const body = await request.json();
    const data = familyMemberSchema.parse(body);

    const member = await prisma.familyMember.create({
      data: {
        patientId: patient.id,
        name: data.name,
        relation: data.relation,
        dateOfBirth: data.dateOfBirth ? new Date(data.dateOfBirth) : null,
        gender: data.gender,
        bloodGroup: data.bloodGroup,
        allergies: data.allergies,
      },
    });

    return NextResponse.json({ member }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Validation failed", details: error.issues }, { status: 400 });
    }
    console.error("Family member create error:", error);
    return NextResponse.json({ error: "Failed to create" }, { status: 500 });
  }
}

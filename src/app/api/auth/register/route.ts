import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { PrismaClient } from "@prisma/client";

type TransactionClient = Omit<PrismaClient, "$connect" | "$disconnect" | "$on" | "$transaction" | "$use" | "$extends">;

const registerSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  role: z.enum(["PATIENT", "DOCTOR"]),
  // Doctor-specific fields
  specialty: z.string().optional(),
  qualifications: z.string().optional(),
  experience: z.number().min(0).optional(),
  consultationFee: z.number().min(0).optional(),
  city: z.string().optional(),
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const data = registerSchema.parse(body);

    // Check for existing user
    const existingUser = await prisma.user.findUnique({
      where: { email: data.email },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: "Email already registered" },
        { status: 409 }
      );
    }

    const hashedPassword = await bcrypt.hash(data.password, 12);

    // Create user + profile in a transaction
    const user = await prisma.$transaction(async (tx: TransactionClient) => {
      const newUser = await tx.user.create({
        data: {
          name: data.name,
          email: data.email,
          password: hashedPassword,
          role: data.role,
        },
      });

      if (data.role === "PATIENT") {
        await tx.patient.create({
          data: { userId: newUser.id },
        });
      } else if (data.role === "DOCTOR") {
        if (!data.specialty) {
          throw new Error("Specialty is required for doctors");
        }
        await tx.doctor.create({
          data: {
            userId: newUser.id,
            specialty: data.specialty,
            qualifications: data.qualifications,
            experience: data.experience ?? 0,
            consultationFee: data.consultationFee ?? 0,
            city: data.city,
          },
        });
      }

      return newUser;
    });

    return NextResponse.json(
      {
        message: "Registration successful",
        user: { id: user.id, email: user.email, role: user.role },
      },
      { status: 201 }
    );
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation failed", details: error.issues },
        { status: 400 }
      );
    }

    console.error("Registration error:", error);
    return NextResponse.json(
      { error: (error as Error).message || "Internal server error" },
      { status: 500 }
    );
  }
}

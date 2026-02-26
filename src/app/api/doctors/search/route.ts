import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    const q = searchParams.get("q") || "";
    const specialty = searchParams.get("specialty") || "";
    const city = searchParams.get("city") || "";
    const minRating = searchParams.get("minRating")
      ? parseFloat(searchParams.get("minRating")!)
      : 0;
    const maxFee = searchParams.get("maxFee")
      ? parseFloat(searchParams.get("maxFee")!)
      : undefined;
    const sortBy = searchParams.get("sortBy") || "experience";
    const sortOrder = searchParams.get("sortOrder") || "desc";
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const skip = (page - 1) * limit;

    // Build where clause
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const where: any = {
      isActive: true,
      isVerified: true,
    };

    if (q) {
      where.OR = [
        { specialty: { contains: q, mode: "insensitive" } },
        { user: { name: { contains: q, mode: "insensitive" } } },
      ];
    }

    if (specialty) {
      where.specialty = { contains: specialty, mode: "insensitive" };
    }

    if (city) {
      where.city = { contains: city, mode: "insensitive" };
    }

    if (maxFee !== undefined) {
      where.consultationFee = { lte: maxFee };
    }

    // Get total count
    const totalCount = await prisma.doctor.count({ where });

    // Get doctors with user info and avg rating
    const orderDirection = sortOrder === "asc" ? "asc" as const : "desc" as const;

    const doctors = await prisma.doctor.findMany({
      where,
      include: {
        user: {
          select: { name: true, image: true },
        },
        reviews: {
          where: { isApproved: true },
          select: { rating: true },
        },
      },
      skip,
      take: limit,
      orderBy:
        sortBy === "fee"
          ? { consultationFee: orderDirection }
          : sortBy === "rating"
            ? { reviews: { _count: orderDirection } }
            : { experience: orderDirection },
    });

    // Compute avg rating and format response
    const results = doctors
      .map((doctor: typeof doctors[number]) => {
        const ratings = doctor.reviews.map((r: { rating: number }) => r.rating);
        const avgRating =
          ratings.length > 0
            ? ratings.reduce((a: number, b: number) => a + b, 0) / ratings.length
            : 0;

        return {
          id: doctor.id,
          name: doctor.user.name,
          image: doctor.user.image,
          specialty: doctor.specialty,
          qualifications: doctor.qualifications,
          experience: doctor.experience,
          consultationFee: Number(doctor.consultationFee),
          city: doctor.city,
          bio: doctor.bio,
          avgRating: Math.round(avgRating * 10) / 10,
          reviewCount: ratings.length,
        };
      })
      .filter((d: { avgRating: number }) => d.avgRating >= minRating);

    return NextResponse.json({
      doctors: results,
      totalCount,
      page,
      limit,
      hasMore: skip + limit < totalCount,
    });
  } catch (error) {
    console.error("Search error:", error);
    return NextResponse.json(
      { error: "Failed to search doctors" },
      { status: 500 }
    );
  }
}

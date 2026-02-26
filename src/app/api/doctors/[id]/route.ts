import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const doctor = await prisma.doctor.findUnique({
      where: { id },
      include: {
        user: {
          select: { name: true, image: true, email: true },
        },
        schedules: {
          where: { isActive: true },
          orderBy: { dayOfWeek: "asc" },
        },
        reviews: {
          where: { isApproved: true },
          include: {
            patient: {
              include: {
                user: { select: { name: true } },
              },
            },
          },
          orderBy: { createdAt: "desc" },
          take: 10,
        },
        _count: {
          select: {
            reviews: { where: { isApproved: true } },
            appointments: { where: { status: "COMPLETED" } },
          },
        },
      },
    });

    if (!doctor) {
      return NextResponse.json(
        { error: "Doctor not found" },
        { status: 404 }
      );
    }

    // Calculate average rating
    const allReviews = await prisma.review.findMany({
      where: { doctorId: id, isApproved: true },
      select: { rating: true },
    });

    const ratings = allReviews.map((r: { rating: number }) => r.rating);
    const avgRating =
      ratings.length > 0
        ? ratings.reduce((a: number, b: number) => a + b, 0) / ratings.length
        : 0;

    // Rating distribution
    const ratingDistribution = [5, 4, 3, 2, 1].map((star) => ({
      stars: star,
      count: ratings.filter((r: number) => r === star).length,
    }));

    // Mask patient names in reviews
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const maskedReviews = doctor.reviews.map((review: any) => ({
      id: review.id,
      rating: review.rating,
      comment: review.comment,
      createdAt: review.createdAt,
      patientName: review.patient.user.name
        ? review.patient.user.name.split(" ")[0] +
          " " +
          (review.patient.user.name.split(" ")[1]?.[0] || "") +
          "."
        : "Anonymous",
    }));

    return NextResponse.json({
      id: doctor.id,
      name: doctor.user.name,
      email: doctor.user.email,
      image: doctor.user.image,
      specialty: doctor.specialty,
      qualifications: doctor.qualifications,
      experience: doctor.experience,
      bio: doctor.bio,
      consultationFee: Number(doctor.consultationFee),
      address: doctor.address,
      city: doctor.city,
      state: doctor.state,
      zipCode: doctor.zipCode,
      isVerified: doctor.isVerified,
      schedule: doctor.schedules,
      avgRating: Math.round(avgRating * 10) / 10,
      reviewCount: doctor._count.reviews,
      completedAppointments: doctor._count.appointments,
      ratingDistribution,
      reviews: maskedReviews,
    });
  } catch (error) {
    console.error("Doctor profile error:", error);
    return NextResponse.json(
      { error: "Failed to fetch doctor profile" },
      { status: 500 }
    );
  }
}

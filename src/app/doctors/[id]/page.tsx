import { notFound } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

interface DoctorPageProps {
  params: Promise<{ id: string }>;
}

interface ScheduleItem {
  id: string;
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  slotDuration: number;
}

interface ReviewItem {
  id: string;
  rating: number;
  comment: string | null;
  createdAt: string;
  patientName: string;
}

interface RatingDist {
  stars: number;
  count: number;
}

interface DoctorProfile {
  id: string;
  name: string;
  image: string | null;
  specialty: string;
  qualifications: string | null;
  experience: number;
  bio: string | null;
  consultationFee: number;
  address: string | null;
  city: string | null;
  state: string | null;
  isVerified: boolean;
  schedule: ScheduleItem[];
  avgRating: number;
  reviewCount: number;
  completedAppointments: number;
  ratingDistribution: RatingDist[];
  reviews: ReviewItem[];
}

const dayNames = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

async function getDoctor(id: string): Promise<DoctorProfile | null> {
  const baseUrl = process.env.NEXTAUTH_URL || "http://localhost:3000";
  const res = await fetch(`${baseUrl}/api/doctors/${id}`, { cache: "no-store" });
  if (!res.ok) return null;
  return res.json();
}

export default async function DoctorProfilePage({ params }: DoctorPageProps) {
  const { id } = await params;
  const doctor = await getDoctor(id);

  if (!doctor) {
    notFound();
  }

  const initials = doctor.name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <Link href="/">
            <h1 className="text-xl font-bold">Doctor Appointment</h1>
          </Link>
          <div className="flex gap-2">
            <Link href="/search">
              <Button variant="outline" size="sm">Find Doctors</Button>
            </Link>
            <Link href="/login">
              <Button size="sm">Sign In</Button>
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-8">
        {/* Doctor Header */}
        <Card className="mb-6">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row gap-6">
              <Avatar className="h-24 w-24">
                <AvatarFallback className="text-2xl bg-primary/10 text-primary">
                  {initials}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <h2 className="text-2xl font-bold">Dr. {doctor.name}</h2>
                  {doctor.isVerified && (
                    <Badge variant="default" className="bg-green-600">Verified</Badge>
                  )}
                </div>
                <Badge variant="secondary" className="mb-2">{doctor.specialty}</Badge>
                <div className="flex flex-wrap gap-4 text-sm text-muted-foreground mt-2">
                  <span>{doctor.experience} years experience</span>
                  {doctor.city && <span>📍 {doctor.city}{doctor.state ? `, ${doctor.state}` : ""}</span>}
                  <span>
                    <span className="text-yellow-500">★</span>{" "}
                    {doctor.avgRating > 0 ? doctor.avgRating.toFixed(1) : "New"}{" "}
                    ({doctor.reviewCount} review{doctor.reviewCount !== 1 ? "s" : ""})
                  </span>
                </div>
                <div className="mt-3 flex items-center gap-4">
                  <span className="text-lg font-bold text-primary">
                    ₹{doctor.consultationFee}
                    <span className="text-sm font-normal text-muted-foreground"> / consultation</span>
                  </span>
                  <Link href={`/doctors/${doctor.id}/book`}>
                    <Button>Book Appointment</Button>
                  </Link>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column: About & Qualifications */}
          <div className="lg:col-span-2 space-y-6">
            {doctor.bio && (
              <Card>
                <CardHeader>
                  <CardTitle>About</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">{doctor.bio}</p>
                </CardContent>
              </Card>
            )}

            {doctor.qualifications && (
              <Card>
                <CardHeader>
                  <CardTitle>Qualifications</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">{doctor.qualifications}</p>
                </CardContent>
              </Card>
            )}

            {/* Reviews */}
            <Card>
              <CardHeader>
                <CardTitle>
                  Reviews ({doctor.reviewCount})
                </CardTitle>
              </CardHeader>
              <CardContent>
                {/* Rating Distribution */}
                {doctor.reviewCount > 0 && (
                  <div className="mb-6">
                    <div className="flex items-center gap-4 mb-3">
                      <span className="text-4xl font-bold">{doctor.avgRating.toFixed(1)}</span>
                      <div>
                        <div className="flex text-yellow-500">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <span key={star}>{star <= Math.round(doctor.avgRating) ? "★" : "☆"}</span>
                          ))}
                        </div>
                        <p className="text-sm text-muted-foreground">{doctor.reviewCount} reviews</p>
                      </div>
                    </div>
                    <div className="space-y-1">
                      {doctor.ratingDistribution.map((dist) => (
                        <div key={dist.stars} className="flex items-center gap-2 text-sm">
                          <span className="w-4">{dist.stars}</span>
                          <span className="text-yellow-500">★</span>
                          <div className="flex-1 bg-gray-200 rounded-full h-2">
                            <div
                              className="bg-yellow-500 rounded-full h-2"
                              style={{
                                width: `${doctor.reviewCount > 0 ? (dist.count / doctor.reviewCount) * 100 : 0}%`,
                              }}
                            />
                          </div>
                          <span className="text-muted-foreground w-6 text-right">{dist.count}</span>
                        </div>
                      ))}
                    </div>
                    <Separator className="my-4" />
                  </div>
                )}

                {/* Review List */}
                {doctor.reviews.length > 0 ? (
                  <div className="space-y-4">
                    {doctor.reviews.map((review) => (
                      <div key={review.id} className="border-b pb-4 last:border-0">
                        <div className="flex justify-between items-start">
                          <div>
                            <p className="font-medium text-sm">{review.patientName}</p>
                            <div className="flex text-yellow-500 text-sm">
                              {[1, 2, 3, 4, 5].map((star) => (
                                <span key={star}>{star <= review.rating ? "★" : "☆"}</span>
                              ))}
                            </div>
                          </div>
                          <span className="text-xs text-muted-foreground">
                            {new Date(review.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                        {review.comment && (
                          <p className="text-sm text-muted-foreground mt-2">{review.comment}</p>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-muted-foreground text-sm">No reviews yet.</p>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Right Column: Schedule & Address */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Availability</CardTitle>
              </CardHeader>
              <CardContent>
                {doctor.schedule.length > 0 ? (
                  <div className="space-y-2">
                    {doctor.schedule.map((slot) => (
                      <div key={slot.id} className="flex justify-between text-sm">
                        <span className="font-medium">{dayNames[slot.dayOfWeek]}</span>
                        <span className="text-muted-foreground">
                          {slot.startTime} - {slot.endTime}
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">
                    Schedule not set yet.
                  </p>
                )}
                <Link href={`/doctors/${doctor.id}/book`} className="block mt-4">
                  <Button className="w-full">Book Appointment</Button>
                </Link>
              </CardContent>
            </Card>

            {doctor.address && (
              <Card>
                <CardHeader>
                  <CardTitle>Location</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    {doctor.address}
                    {doctor.city && <>, {doctor.city}</>}
                    {doctor.state && <>, {doctor.state}</>}
                  </p>
                </CardContent>
              </Card>
            )}

            <Card>
              <CardHeader>
                <CardTitle>Stats</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4 text-center">
                  <div>
                    <p className="text-2xl font-bold">{doctor.experience}</p>
                    <p className="text-xs text-muted-foreground">Years Exp</p>
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{doctor.completedAppointments}</p>
                    <p className="text-xs text-muted-foreground">Patients</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}

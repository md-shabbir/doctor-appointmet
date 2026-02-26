import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Link from "next/link";

interface TodayAppointment {
  id: string;
  patientName: string;
  time: string;
  status: string;
  reason: string | null;
}

async function getDashboardData(baseUrl: string, cookie: string) {
  const res = await fetch(`${baseUrl}/api/doctor/dashboard`, {
    headers: { cookie },
    cache: "no-store",
  });
  if (!res.ok) return null;
  return res.json();
}

export default async function DoctorDashboard() {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");

  const baseUrl = process.env.NEXTAUTH_URL || "http://localhost:3000";
  // We can't forward cookies in server components easily, so fetch data directly
  const { prisma } = await import("@/lib/prisma");
  const doctor = await prisma.doctor.findUnique({ where: { userId: session.user.id } });

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  const [todayAppts, pendingCount, totalPatients, avgRating] = await Promise.all([
    prisma.appointment.findMany({
      where: { doctorId: doctor?.id, date: { gte: today, lt: tomorrow } },
      include: {
        patient: { include: { user: { select: { name: true } } } },
        familyMember: { select: { name: true } },
      },
      orderBy: { startTime: "asc" },
    }),
    prisma.appointment.count({ where: { doctorId: doctor?.id, status: "PENDING" } }),
    prisma.appointment.groupBy({ by: ["patientId"], where: { doctorId: doctor?.id } }),
    prisma.review.aggregate({
      where: { doctorId: doctor?.id, isApproved: true },
      _avg: { rating: true },
      _count: true,
    }),
  ]);

  const statusColors: Record<string, string> = {
    PENDING: "bg-yellow-100 text-yellow-800",
    CONFIRMED: "bg-blue-100 text-blue-800",
    COMPLETED: "bg-green-100 text-green-800",
    CANCELLED: "bg-red-100 text-red-800",
    NO_SHOW: "bg-gray-100 text-gray-800",
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-xl font-bold">Doctor Appointment</h1>
          <div className="flex items-center gap-4">
            <span className="text-sm text-muted-foreground">Dr. {session.user.name}</span>
            <Link href="/api/auth/signout">
              <Button variant="outline" size="sm">Sign Out</Button>
            </Link>
          </div>
        </div>
      </header>
      <main className="max-w-7xl mx-auto px-4 py-8">
        <h2 className="text-2xl font-bold mb-6">Doctor Dashboard</h2>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardContent className="p-4 text-center">
              <p className="text-3xl font-bold">{todayAppts.length}</p>
              <p className="text-sm text-muted-foreground">Today</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <p className="text-3xl font-bold">{pendingCount}</p>
              <p className="text-sm text-muted-foreground">Pending</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <p className="text-3xl font-bold">{totalPatients.length}</p>
              <p className="text-sm text-muted-foreground">Patients</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <p className="text-3xl font-bold">
                {avgRating._avg.rating ? avgRating._avg.rating.toFixed(1) : "—"}
              </p>
              <p className="text-sm text-muted-foreground">
                Rating ({avgRating._count})
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Today's Appointments */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Today&apos;s Appointments</CardTitle>
              </CardHeader>
              <CardContent>
                {todayAppts.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No appointments today.</p>
                ) : (
                  <div className="space-y-3">
                    {todayAppts.map((a: typeof todayAppts[number]) => (
                      <div key={a.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div>
                          <p className="font-medium text-sm">
                            {a.bookingType === "FAMILY_MEMBER" && a.familyMember
                              ? a.familyMember.name
                              : a.patient.user.name}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {a.startTime} - {a.endTime}
                            {a.reason && ` · ${a.reason}`}
                          </p>
                        </div>
                        <Badge className={statusColors[a.status] || ""} variant="secondary">
                          {a.status}
                        </Badge>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Quick Actions */}
          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Link href="/doctor/schedule" className="block">
                  <Button className="w-full">Manage Schedule</Button>
                </Link>
                <Link href="/doctor/appointments" className="block">
                  <Button variant="outline" className="w-full">All Appointments</Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}

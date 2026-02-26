import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Link from "next/link";

const statusColors: Record<string, string> = {
  PENDING: "bg-yellow-100 text-yellow-800",
  CONFIRMED: "bg-blue-100 text-blue-800",
  COMPLETED: "bg-green-100 text-green-800",
  CANCELLED: "bg-red-100 text-red-800",
};

export default async function PatientDashboard() {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");

  const patient = await prisma.patient.findUnique({ where: { userId: session.user.id } });

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const [upcomingAppts, totalAppts, recordCount] = await Promise.all([
    prisma.appointment.findMany({
      where: {
        patientId: patient?.id,
        date: { gte: today },
        status: { in: ["PENDING", "CONFIRMED"] },
      },
      include: { doctor: { include: { user: { select: { name: true } } } } },
      orderBy: [{ date: "asc" }, { startTime: "asc" }],
      take: 5,
    }),
    prisma.appointment.count({ where: { patientId: patient?.id } }),
    prisma.medicalRecord.count({ where: { patientId: patient?.id } }),
  ]);

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-xl font-bold">Doctor Appointment</h1>
          <div className="flex items-center gap-4">
            <span className="text-sm text-muted-foreground">Welcome, {session.user.name}</span>
            <Link href="/api/auth/signout">
              <Button variant="outline" size="sm">Sign Out</Button>
            </Link>
          </div>
        </div>
      </header>
      <main className="max-w-7xl mx-auto px-4 py-8">
        <h2 className="text-2xl font-bold mb-6">Patient Dashboard</h2>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardContent className="p-4 text-center">
              <p className="text-3xl font-bold">{upcomingAppts.length}</p>
              <p className="text-sm text-muted-foreground">Upcoming</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <p className="text-3xl font-bold">{totalAppts}</p>
              <p className="text-sm text-muted-foreground">Total Visits</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <p className="text-3xl font-bold">{recordCount}</p>
              <p className="text-sm text-muted-foreground">Records</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <Link href="/search">
                <Button className="w-full h-full">Find a Doctor</Button>
              </Link>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Upcoming Appointments */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Upcoming Appointments</CardTitle>
                <Link href="/patient/appointments">
                  <Button variant="link" size="sm">View All</Button>
                </Link>
              </CardHeader>
              <CardContent>
                {upcomingAppts.length === 0 ? (
                  <div className="text-center py-6">
                    <p className="text-muted-foreground mb-3">No upcoming appointments</p>
                    <Link href="/search">
                      <Button>Book an Appointment</Button>
                    </Link>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {upcomingAppts.map((a: typeof upcomingAppts[number]) => (
                      <div key={a.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div>
                          <p className="font-medium text-sm">Dr. {a.doctor.user.name}</p>
                          <p className="text-xs text-muted-foreground">
                            {new Date(a.date).toLocaleDateString("en-US", {
                              weekday: "short", month: "short", day: "numeric",
                            })} · {a.startTime} - {a.endTime}
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
                <Link href="/search" className="block">
                  <Button className="w-full">Search Doctors</Button>
                </Link>
                <Link href="/patient/appointments" className="block">
                  <Button variant="outline" className="w-full">My Appointments</Button>
                </Link>
                <Link href="/patient/records" className="block">
                  <Button variant="outline" className="w-full">Medical Records</Button>
                </Link>
                <Link href="/patient/family" className="block">
                  <Button variant="outline" className="w-full">Family Members</Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}

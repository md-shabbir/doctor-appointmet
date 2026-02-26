import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default async function AdminDashboard() {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");

  const [totalDoctors, unverified, totalPatients, totalAppts, pendingReviews] = await Promise.all([
    prisma.doctor.count(),
    prisma.doctor.count({ where: { isVerified: false } }),
    prisma.patient.count(),
    prisma.appointment.count(),
    prisma.review.count({ where: { isApproved: false } }),
  ]);

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-xl font-bold">Admin Panel</h1>
          <div className="flex items-center gap-4">
            <span className="text-sm text-muted-foreground">Admin: {session.user.name}</span>
            <Link href="/api/auth/signout">
              <Button variant="outline" size="sm">Sign Out</Button>
            </Link>
          </div>
        </div>
      </header>
      <main className="max-w-7xl mx-auto px-4 py-8">
        <h2 className="text-2xl font-bold mb-6">Dashboard</h2>

        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
          <Card><CardContent className="p-4 text-center"><p className="text-3xl font-bold">{totalDoctors}</p><p className="text-sm text-muted-foreground">Doctors</p></CardContent></Card>
          <Card><CardContent className="p-4 text-center"><p className="text-3xl font-bold text-orange-600">{unverified}</p><p className="text-sm text-muted-foreground">Unverified</p></CardContent></Card>
          <Card><CardContent className="p-4 text-center"><p className="text-3xl font-bold">{totalPatients}</p><p className="text-sm text-muted-foreground">Patients</p></CardContent></Card>
          <Card><CardContent className="p-4 text-center"><p className="text-3xl font-bold">{totalAppts}</p><p className="text-sm text-muted-foreground">Appointments</p></CardContent></Card>
          <Card><CardContent className="p-4 text-center"><p className="text-3xl font-bold text-yellow-600">{pendingReviews}</p><p className="text-sm text-muted-foreground">Pending Reviews</p></CardContent></Card>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardHeader><CardTitle>Manage Doctors</CardTitle></CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-3">Verify and manage doctor registrations</p>
              <Link href="/admin/doctors"><Button className="w-full">View Doctors</Button></Link>
            </CardContent>
          </Card>
          <Card>
            <CardHeader><CardTitle>Moderate Reviews</CardTitle></CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-3">Approve or reject patient reviews</p>
              <Link href="/admin/reviews"><Button variant="outline" className="w-full">View Reviews</Button></Link>
            </CardContent>
          </Card>
          <Card>
            <CardHeader><CardTitle>Analytics</CardTitle></CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-3">View platform statistics</p>
              <Link href="/admin/analytics"><Button variant="outline" className="w-full">View Analytics</Button></Link>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}

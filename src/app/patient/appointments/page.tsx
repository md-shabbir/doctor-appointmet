"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useCurrentUser } from "@/hooks/useCurrentUser";

interface AppointmentItem {
  id: string;
  doctorId: string;
  doctorName: string;
  specialty: string;
  date: string;
  startTime: string;
  endTime: string;
  status: string;
  reason: string | null;
  hasReview: boolean;
}

const statusColors: Record<string, string> = {
  PENDING: "bg-yellow-100 text-yellow-800",
  CONFIRMED: "bg-blue-100 text-blue-800",
  COMPLETED: "bg-green-100 text-green-800",
  CANCELLED: "bg-red-100 text-red-800",
  NO_SHOW: "bg-gray-100 text-gray-800",
};

export default function PatientAppointmentsPage() {
  const { user, isAuthenticated, isLoading: authLoading } = useCurrentUser();
  const router = useRouter();
  const [appointments, setAppointments] = useState<AppointmentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState("upcoming");

  useEffect(() => {
    if (!authLoading && !isAuthenticated) router.push("/login");
  }, [authLoading, isAuthenticated, router]);

  const fetchAppointments = useCallback(async (status?: string) => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (status) params.set("status", status);
      const res = await fetch(`/api/patient/appointments?${params.toString()}`);
      const data = await res.json();
      setAppointments(data.appointments || []);
    } catch {
      toast.error("Failed to load appointments");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (tab === "upcoming") fetchAppointments("PENDING");
    else if (tab === "confirmed") fetchAppointments("CONFIRMED");
    else if (tab === "completed") fetchAppointments("COMPLETED");
    else if (tab === "cancelled") fetchAppointments("CANCELLED");
  }, [tab, fetchAppointments]);

  const handleCancel = async (id: string) => {
    try {
      const res = await fetch(`/api/appointments/${id}/cancel`, { method: "PATCH" });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error || "Failed to cancel");
        return;
      }
      toast.success("Appointment cancelled");
      fetchAppointments(tab === "upcoming" ? "PENDING" : "CONFIRMED");
    } catch {
      toast.error("Failed to cancel");
    }
  };

  if (authLoading) {
    return <div className="min-h-screen flex items-center justify-center"><p>Loading...</p></div>;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b">
        <div className="max-w-5xl mx-auto px-4 py-4 flex justify-between items-center">
          <Link href="/patient/dashboard">
            <h1 className="text-xl font-bold">Doctor Appointment</h1>
          </Link>
          <span className="text-sm text-muted-foreground">{user?.name}</span>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">My Appointments</h2>
          <Link href="/search">
            <Button>Book New</Button>
          </Link>
        </div>

        <Tabs value={tab} onValueChange={setTab}>
          <TabsList className="mb-6">
            <TabsTrigger value="upcoming">Pending</TabsTrigger>
            <TabsTrigger value="confirmed">Confirmed</TabsTrigger>
            <TabsTrigger value="completed">Completed</TabsTrigger>
            <TabsTrigger value="cancelled">Cancelled</TabsTrigger>
          </TabsList>

          <TabsContent value={tab}>
            {loading ? (
              <p className="text-muted-foreground text-sm">Loading...</p>
            ) : appointments.length === 0 ? (
              <Card>
                <CardContent className="p-8 text-center">
                  <p className="text-muted-foreground">No {tab} appointments.</p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-3">
                {appointments.map((a) => (
                  <Card key={a.id}>
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between">
                        <div>
                          <p className="font-medium">Dr. {a.doctorName}</p>
                          <p className="text-sm text-muted-foreground">{a.specialty}</p>
                          <p className="text-sm text-muted-foreground mt-1">
                            {new Date(a.date).toLocaleDateString("en-US", {
                              weekday: "short", month: "short", day: "numeric",
                            })} · {a.startTime} - {a.endTime}
                          </p>
                          {a.reason && (
                            <p className="text-sm text-muted-foreground mt-1">Reason: {a.reason}</p>
                          )}
                        </div>
                        <div className="flex flex-col items-end gap-2">
                          <Badge className={statusColors[a.status] || ""} variant="secondary">
                            {a.status}
                          </Badge>
                          <div className="flex gap-1">
                            {["PENDING", "CONFIRMED"].includes(a.status) && (
                              <Button size="sm" variant="destructive" onClick={() => handleCancel(a.id)}>
                                Cancel
                              </Button>
                            )}
                            {a.status === "COMPLETED" && !a.hasReview && (
                              <Link href={`/patient/review/${a.id}`}>
                                <Button size="sm" variant="outline">Review</Button>
                              </Link>
                            )}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}

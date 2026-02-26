"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useCurrentUser } from "@/hooks/useCurrentUser";

interface AppointmentItem {
  id: string;
  patientName: string;
  patientEmail: string;
  date: string;
  startTime: string;
  endTime: string;
  status: string;
  reason: string | null;
  hasMedicalRecord: boolean;
}

const statusColors: Record<string, string> = {
  PENDING: "bg-yellow-100 text-yellow-800",
  CONFIRMED: "bg-blue-100 text-blue-800",
  COMPLETED: "bg-green-100 text-green-800",
  CANCELLED: "bg-red-100 text-red-800",
  NO_SHOW: "bg-gray-100 text-gray-800",
};

export default function DoctorAppointmentsPage() {
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
      const res = await fetch(`/api/doctor/appointments?${params.toString()}`);
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

  const handleStatusChange = async (id: string, status: string) => {
    try {
      const res = await fetch(`/api/appointments/${id}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      if (!res.ok) {
        const data = await res.json();
        toast.error(data.error || "Failed to update");
        return;
      }
      toast.success(`Appointment ${status.toLowerCase()}`);
      fetchAppointments(tab === "upcoming" ? "PENDING" : tab === "confirmed" ? "CONFIRMED" : undefined);
    } catch {
      toast.error("Failed to update status");
    }
  };

  if (authLoading) {
    return <div className="min-h-screen flex items-center justify-center"><p>Loading...</p></div>;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b">
        <div className="max-w-5xl mx-auto px-4 py-4 flex justify-between items-center">
          <Link href="/doctor/dashboard">
            <h1 className="text-xl font-bold">Doctor Appointment</h1>
          </Link>
          <span className="text-sm text-muted-foreground">Dr. {user?.name}</span>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8">
        <h2 className="text-2xl font-bold mb-6">Appointments</h2>

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
                          <p className="font-medium">{a.patientName}</p>
                          <p className="text-sm text-muted-foreground">
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
                            {a.status === "PENDING" && (
                              <Button size="sm" onClick={() => handleStatusChange(a.id, "CONFIRMED")}>
                                Confirm
                              </Button>
                            )}
                            {a.status === "CONFIRMED" && (
                              <>
                                <Button size="sm" onClick={() => handleStatusChange(a.id, "COMPLETED")}>
                                  Complete
                                </Button>
                                <Button size="sm" variant="outline" onClick={() => handleStatusChange(a.id, "NO_SHOW")}>
                                  No Show
                                </Button>
                              </>
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

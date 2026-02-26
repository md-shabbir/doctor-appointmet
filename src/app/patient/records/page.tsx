"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useCurrentUser } from "@/hooks/useCurrentUser";

interface Medication {
  name: string;
  dosage: string;
  frequency: string;
  duration: string;
}

interface RecordItem {
  id: string;
  doctorName: string;
  specialty: string;
  date: string;
  diagnosis: string | null;
  symptoms: string | null;
  notes: string | null;
  prescription: {
    medications: Medication[];
    instructions: string | null;
  } | null;
}

export default function PatientRecordsPage() {
  const { user, isAuthenticated, isLoading: authLoading } = useCurrentUser();
  const router = useRouter();
  const [records, setRecords] = useState<RecordItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) router.push("/login");
  }, [authLoading, isAuthenticated, router]);

  useEffect(() => {
    fetch("/api/patient/records")
      .then((r) => r.json())
      .then((d) => setRecords(d.records || []))
      .catch(() => toast.error("Failed to load records"))
      .finally(() => setLoading(false));
  }, []);

  if (authLoading || loading) {
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
        <h2 className="text-2xl font-bold mb-6">Medical Records</h2>

        {records.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <p className="text-muted-foreground">No medical records yet.</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {records.map((r) => (
              <Card key={r.id}>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-base">Dr. {r.doctorName}</CardTitle>
                      <p className="text-sm text-muted-foreground">{r.specialty}</p>
                    </div>
                    <Badge variant="secondary">
                      {new Date(r.date).toLocaleDateString("en-US", {
                        month: "short", day: "numeric", year: "numeric",
                      })}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  {r.diagnosis && (
                    <div>
                      <p className="text-sm font-medium">Diagnosis</p>
                      <p className="text-sm text-muted-foreground">{r.diagnosis}</p>
                    </div>
                  )}
                  {r.symptoms && (
                    <div>
                      <p className="text-sm font-medium">Symptoms</p>
                      <p className="text-sm text-muted-foreground">{r.symptoms}</p>
                    </div>
                  )}
                  {r.notes && (
                    <div>
                      <p className="text-sm font-medium">Notes</p>
                      <p className="text-sm text-muted-foreground">{r.notes}</p>
                    </div>
                  )}
                  {r.prescription && (
                    <div className="border-t pt-3">
                      <p className="text-sm font-medium mb-2">Prescription</p>
                      <div className="bg-gray-50 rounded-lg p-3 space-y-2">
                        {(r.prescription.medications as Medication[]).map((med, i) => (
                          <div key={i} className="text-sm">
                            <span className="font-medium">{med.name}</span>
                            <span className="text-muted-foreground">
                              {" "} — {med.dosage}, {med.frequency}, {med.duration}
                            </span>
                          </div>
                        ))}
                        {r.prescription.instructions && (
                          <p className="text-sm text-muted-foreground mt-2 pt-2 border-t">
                            {r.prescription.instructions}
                          </p>
                        )}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

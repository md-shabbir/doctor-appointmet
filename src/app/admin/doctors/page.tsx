"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useCurrentUser } from "@/hooks/useCurrentUser";

interface DoctorItem {
  id: string;
  name: string;
  email: string;
  specialty: string;
  experience: number;
  city: string | null;
  isVerified: boolean;
  isActive: boolean;
}

export default function AdminDoctorsPage() {
  const { user, isAuthenticated, isLoading: authLoading } = useCurrentUser();
  const router = useRouter();
  const [doctors, setDoctors] = useState<DoctorItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) router.push("/login");
  }, [authLoading, isAuthenticated, router]);

  const fetchDoctors = async () => {
    try {
      const res = await fetch("/api/doctors/search?limit=100");
      const data = await res.json();
      // Also fetch unverified doctors
      const res2 = await fetch("/api/admin/doctors-list");
      if (res2.ok) {
        const data2 = await res2.json();
        setDoctors(data2.doctors || []);
      }
    } catch {
      toast.error("Failed to load doctors");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchDoctors(); }, []);

  const handleVerify = async (id: string) => {
    try {
      const res = await fetch(`/api/admin/doctors/${id}/verify`, { method: "PATCH" });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error || "Failed");
        return;
      }
      toast.success(data.message);
      fetchDoctors();
    } catch {
      toast.error("Failed to update");
    }
  };

  if (authLoading || loading) {
    return <div className="min-h-screen flex items-center justify-center"><p>Loading...</p></div>;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b">
        <div className="max-w-5xl mx-auto px-4 py-4 flex justify-between items-center">
          <Link href="/admin/dashboard"><h1 className="text-xl font-bold">Admin Panel</h1></Link>
          <span className="text-sm text-muted-foreground">Admin: {user?.name}</span>
        </div>
      </header>
      <main className="max-w-4xl mx-auto px-4 py-8">
        <h2 className="text-2xl font-bold mb-6">Manage Doctors</h2>
        {doctors.length === 0 ? (
          <Card><CardContent className="p-8 text-center"><p className="text-muted-foreground">No doctors registered.</p></CardContent></Card>
        ) : (
          <div className="space-y-3">
            {doctors.map((d) => (
              <Card key={d.id}>
                <CardContent className="p-4 flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="font-medium">Dr. {d.name}</p>
                      {d.isVerified ? (
                        <Badge className="bg-green-100 text-green-800" variant="secondary">Verified</Badge>
                      ) : (
                        <Badge className="bg-orange-100 text-orange-800" variant="secondary">Unverified</Badge>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {d.specialty} · {d.experience} yrs · {d.email}
                      {d.city && ` · ${d.city}`}
                    </p>
                  </div>
                  <Button
                    size="sm"
                    variant={d.isVerified ? "outline" : "default"}
                    onClick={() => handleVerify(d.id)}
                  >
                    {d.isVerified ? "Unverify" : "Verify"}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

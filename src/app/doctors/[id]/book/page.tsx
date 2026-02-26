"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { useCurrentUser } from "@/hooks/useCurrentUser";

interface TimeSlot {
  startTime: string;
  endTime: string;
  isAvailable: boolean;
}

interface DoctorInfo {
  name: string;
  specialty: string;
  consultationFee: number;
}

export default function BookAppointmentPage() {
  const router = useRouter();
  const params = useParams();
  const doctorId = params.id as string;
  const { user, isAuthenticated, isLoading: authLoading } = useCurrentUser();

  const [doctor, setDoctor] = useState<DoctorInfo | null>(null);
  const [selectedDate, setSelectedDate] = useState("");
  const [slots, setSlots] = useState<TimeSlot[]>([]);
  const [selectedSlot, setSelectedSlot] = useState<TimeSlot | null>(null);
  const [reason, setReason] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [slotsLoading, setSlotsLoading] = useState(false);
  const [step, setStep] = useState(1); // 1=date, 2=slot, 3=confirm

  // Generate next 14 dates
  const dates = Array.from({ length: 14 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() + i);
    return {
      value: d.toISOString().split("T")[0],
      label: i === 0 ? "Today" : i === 1 ? "Tomorrow" : d.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" }),
      dayName: d.toLocaleDateString("en-US", { weekday: "long" }),
    };
  });

  // Fetch doctor info
  useEffect(() => {
    fetch(`/api/doctors/${doctorId}`)
      .then((r) => r.json())
      .then((d) => setDoctor({ name: d.name, specialty: d.specialty, consultationFee: d.consultationFee }))
      .catch(() => toast.error("Failed to load doctor info"));
  }, [doctorId]);

  // Fetch slots when date changes
  const fetchSlots = useCallback(async (date: string) => {
    setSlotsLoading(true);
    setSelectedSlot(null);
    try {
      const res = await fetch(`/api/doctors/${doctorId}/availability?date=${date}`);
      const data = await res.json();
      setSlots(data.slots || []);
    } catch {
      toast.error("Failed to load available slots");
    } finally {
      setSlotsLoading(false);
    }
  }, [doctorId]);

  useEffect(() => {
    if (selectedDate) {
      fetchSlots(selectedDate);
    }
  }, [selectedDate, fetchSlots]);

  // Redirect if not authenticated
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push(`/login?callbackUrl=/doctors/${doctorId}/book`);
    }
  }, [authLoading, isAuthenticated, router, doctorId]);

  const handleBook = async () => {
    if (!selectedSlot || !selectedDate) return;

    setIsLoading(true);
    try {
      const res = await fetch("/api/appointments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          doctorId,
          date: selectedDate,
          startTime: selectedSlot.startTime,
          endTime: selectedSlot.endTime,
          reason: reason || undefined,
          bookingType: "SELF",
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        toast.error(data.error || "Booking failed");
        if (res.status === 409) {
          fetchSlots(selectedDate);
        }
        return;
      }

      toast.success("Appointment booked successfully!");
      router.push("/patient/dashboard");
    } catch {
      toast.error("Something went wrong");
    } finally {
      setIsLoading(false);
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    );
  }

  const availableSlots = slots.filter((s) => s.isAvailable);

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b">
        <div className="max-w-5xl mx-auto px-4 py-4 flex justify-between items-center">
          <Link href="/">
            <h1 className="text-xl font-bold">Doctor Appointment</h1>
          </Link>
          <span className="text-sm text-muted-foreground">
            {user?.name}
          </span>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-8">
        <Link href={`/doctors/${doctorId}`} className="text-sm text-primary hover:underline mb-4 block">
          ← Back to doctor profile
        </Link>

        <h2 className="text-2xl font-bold mb-2">Book Appointment</h2>
        {doctor && (
          <p className="text-muted-foreground mb-6">
            Dr. {doctor.name} · {doctor.specialty} · ₹{doctor.consultationFee}
          </p>
        )}

        {/* Progress steps */}
        <div className="flex items-center gap-2 mb-8">
          {[
            { num: 1, label: "Date" },
            { num: 2, label: "Time" },
            { num: 3, label: "Confirm" },
          ].map((s) => (
            <div key={s.num} className="flex items-center gap-2">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                  step >= s.num
                    ? "bg-primary text-primary-foreground"
                    : "bg-gray-200 text-gray-500"
                }`}
              >
                {s.num}
              </div>
              <span className={`text-sm ${step >= s.num ? "font-medium" : "text-muted-foreground"}`}>
                {s.label}
              </span>
              {s.num < 3 && <div className="w-8 h-px bg-gray-300" />}
            </div>
          ))}
        </div>

        {/* Step 1: Select Date */}
        {step >= 1 && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="text-lg">Select Date</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-7 gap-2">
                {dates.map((d) => (
                  <button
                    key={d.value}
                    onClick={() => {
                      setSelectedDate(d.value);
                      setStep(2);
                    }}
                    className={`p-3 rounded-lg border text-center text-sm transition-colors ${
                      selectedDate === d.value
                        ? "border-primary bg-primary/5 font-medium"
                        : "border-gray-200 hover:border-primary/50"
                    }`}
                  >
                    <div className="font-medium">{d.label}</div>
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Step 2: Select Time Slot */}
        {step >= 2 && selectedDate && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="text-lg">
                Select Time
                <span className="text-sm font-normal text-muted-foreground ml-2">
                  {new Date(selectedDate + "T00:00:00").toLocaleDateString("en-US", {
                    weekday: "long",
                    month: "long",
                    day: "numeric",
                  })}
                </span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {slotsLoading ? (
                <p className="text-muted-foreground text-sm">Loading slots...</p>
              ) : slots.length === 0 ? (
                <p className="text-muted-foreground text-sm">
                  No slots available for this date. The doctor may not work on this day.
                </p>
              ) : availableSlots.length === 0 ? (
                <p className="text-muted-foreground text-sm">
                  All slots are booked for this date. Try another date.
                </p>
              ) : (
                <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2">
                  {slots.map((slot) => (
                    <button
                      key={slot.startTime}
                      disabled={!slot.isAvailable}
                      onClick={() => {
                        setSelectedSlot(slot);
                        setStep(3);
                      }}
                      className={`p-2 rounded-lg border text-sm transition-colors ${
                        !slot.isAvailable
                          ? "bg-gray-100 text-gray-400 cursor-not-allowed border-gray-200"
                          : selectedSlot?.startTime === slot.startTime
                            ? "border-primary bg-primary/5 font-medium"
                            : "border-gray-200 hover:border-primary/50"
                      }`}
                    >
                      {slot.startTime}
                    </button>
                  ))}
                </div>
              )}
              {availableSlots.length > 0 && (
                <p className="text-xs text-muted-foreground mt-3">
                  {availableSlots.length} slot{availableSlots.length !== 1 ? "s" : ""} available
                </p>
              )}
            </CardContent>
          </Card>
        )}

        {/* Step 3: Confirm */}
        {step >= 3 && selectedSlot && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="text-lg">Confirm Booking</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Doctor</span>
                  <span className="font-medium">Dr. {doctor?.name}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Date</span>
                  <span className="font-medium">
                    {new Date(selectedDate + "T00:00:00").toLocaleDateString("en-US", {
                      weekday: "long",
                      month: "long",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Time</span>
                  <span className="font-medium">
                    {selectedSlot.startTime} - {selectedSlot.endTime}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Fee</span>
                  <Badge variant="secondary">₹{doctor?.consultationFee}</Badge>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="reason">Reason for visit (optional)</Label>
                <Textarea
                  id="reason"
                  placeholder="Briefly describe your symptoms or reason..."
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                />
              </div>

              <div className="flex gap-3">
                <Button
                  className="flex-1"
                  onClick={handleBook}
                  disabled={isLoading}
                >
                  {isLoading ? "Booking..." : "Confirm Booking"}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    setSelectedSlot(null);
                    setStep(2);
                  }}
                >
                  Change Time
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  );
}

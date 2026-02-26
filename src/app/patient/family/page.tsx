"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useCurrentUser } from "@/hooks/useCurrentUser";

interface FamilyMember {
  id: string;
  name: string;
  relation: string;
  dateOfBirth: string | null;
  gender: string | null;
  bloodGroup: string | null;
  allergies: string | null;
}

export default function FamilyMembersPage() {
  const { user, isAuthenticated, isLoading: authLoading } = useCurrentUser();
  const router = useRouter();
  const [members, setMembers] = useState<FamilyMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState({
    name: "",
    relation: "",
    dateOfBirth: "",
    gender: "",
    bloodGroup: "",
    allergies: "",
  });

  useEffect(() => {
    if (!authLoading && !isAuthenticated) router.push("/login");
  }, [authLoading, isAuthenticated, router]);

  const fetchMembers = async () => {
    try {
      const res = await fetch("/api/patient/family-members");
      const data = await res.json();
      setMembers(data.members || []);
    } catch {
      toast.error("Failed to load family members");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchMembers(); }, []);

  const handleAdd = async () => {
    if (!form.name || !form.relation) {
      toast.error("Name and relation are required");
      return;
    }
    try {
      const res = await fetch("/api/patient/family-members", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          dateOfBirth: form.dateOfBirth || undefined,
          gender: form.gender || undefined,
          bloodGroup: form.bloodGroup || undefined,
          allergies: form.allergies || undefined,
        }),
      });
      if (!res.ok) {
        const data = await res.json();
        toast.error(data.error || "Failed to add");
        return;
      }
      toast.success("Family member added");
      setShowAdd(false);
      setForm({ name: "", relation: "", dateOfBirth: "", gender: "", bloodGroup: "", allergies: "" });
      fetchMembers();
    } catch {
      toast.error("Failed to add");
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await fetch(`/api/patient/family-members/${id}`, { method: "DELETE" });
      toast.success("Removed");
      fetchMembers();
    } catch {
      toast.error("Failed to remove");
    }
  };

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

      <main className="max-w-3xl mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">Family Members</h2>
          <Button onClick={() => setShowAdd(!showAdd)}>
            {showAdd ? "Cancel" : "+ Add Member"}
          </Button>
        </div>

        {showAdd && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="text-lg">Add Family Member</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Name *</Label>
                  <Input value={form.name} onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))} placeholder="Full name" />
                </div>
                <div className="space-y-2">
                  <Label>Relation *</Label>
                  <Select value={form.relation} onValueChange={(v) => setForm((p) => ({ ...p, relation: v }))}>
                    <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Spouse">Spouse</SelectItem>
                      <SelectItem value="Child">Child</SelectItem>
                      <SelectItem value="Parent">Parent</SelectItem>
                      <SelectItem value="Sibling">Sibling</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>Date of Birth</Label>
                  <Input type="date" value={form.dateOfBirth} onChange={(e) => setForm((p) => ({ ...p, dateOfBirth: e.target.value }))} />
                </div>
                <div className="space-y-2">
                  <Label>Gender</Label>
                  <Select value={form.gender} onValueChange={(v) => setForm((p) => ({ ...p, gender: v }))}>
                    <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Male">Male</SelectItem>
                      <SelectItem value="Female">Female</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Blood Group</Label>
                  <Input value={form.bloodGroup} onChange={(e) => setForm((p) => ({ ...p, bloodGroup: e.target.value }))} placeholder="e.g. O+" />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Allergies</Label>
                <Input value={form.allergies} onChange={(e) => setForm((p) => ({ ...p, allergies: e.target.value }))} placeholder="e.g. Penicillin, Dust" />
              </div>
              <Button onClick={handleAdd} className="w-full">Add Member</Button>
            </CardContent>
          </Card>
        )}

        {members.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <p className="text-muted-foreground">No family members added yet.</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {members.map((m) => (
              <Card key={m.id}>
                <CardContent className="p-4 flex items-center justify-between">
                  <div>
                    <p className="font-medium">{m.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {m.relation}
                      {m.gender && ` · ${m.gender}`}
                      {m.bloodGroup && ` · ${m.bloodGroup}`}
                    </p>
                    {m.allergies && (
                      <p className="text-xs text-red-600 mt-1">Allergies: {m.allergies}</p>
                    )}
                  </div>
                  <Button variant="destructive" size="sm" onClick={() => handleDelete(m.id)}>
                    Remove
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

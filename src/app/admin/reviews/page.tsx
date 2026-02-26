"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useCurrentUser } from "@/hooks/useCurrentUser";

interface ReviewItem {
  id: string;
  patientName: string;
  doctorName: string;
  rating: number;
  comment: string | null;
  isApproved: boolean;
  createdAt: string;
}

export default function AdminReviewsPage() {
  const { user, isAuthenticated, isLoading: authLoading } = useCurrentUser();
  const router = useRouter();
  const [reviews, setReviews] = useState<ReviewItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState("pending");

  useEffect(() => {
    if (!authLoading && !isAuthenticated) router.push("/login");
  }, [authLoading, isAuthenticated, router]);

  const fetchReviews = async (approved?: string) => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (approved !== undefined) params.set("approved", approved);
      const res = await fetch(`/api/admin/reviews?${params.toString()}`);
      const data = await res.json();
      setReviews(data.reviews || []);
    } catch {
      toast.error("Failed to load reviews");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (tab === "pending") fetchReviews("false");
    else if (tab === "approved") fetchReviews("true");
    else fetchReviews();
  }, [tab]);

  const handleToggle = async (id: string) => {
    try {
      const res = await fetch(`/api/admin/reviews/${id}`, { method: "PATCH" });
      const data = await res.json();
      if (!res.ok) { toast.error(data.error); return; }
      toast.success(data.message);
      fetchReviews(tab === "pending" ? "false" : tab === "approved" ? "true" : undefined);
    } catch {
      toast.error("Failed to update");
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await fetch(`/api/admin/reviews/${id}`, { method: "DELETE" });
      toast.success("Review deleted");
      fetchReviews(tab === "pending" ? "false" : tab === "approved" ? "true" : undefined);
    } catch {
      toast.error("Failed to delete");
    }
  };

  if (authLoading) {
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
        <h2 className="text-2xl font-bold mb-6">Review Moderation</h2>

        <Tabs value={tab} onValueChange={setTab}>
          <TabsList className="mb-6">
            <TabsTrigger value="pending">Pending</TabsTrigger>
            <TabsTrigger value="approved">Approved</TabsTrigger>
            <TabsTrigger value="all">All</TabsTrigger>
          </TabsList>

          <TabsContent value={tab}>
            {loading ? (
              <p className="text-muted-foreground text-sm">Loading...</p>
            ) : reviews.length === 0 ? (
              <Card><CardContent className="p-8 text-center"><p className="text-muted-foreground">No reviews.</p></CardContent></Card>
            ) : (
              <div className="space-y-3">
                {reviews.map((r) => (
                  <Card key={r.id}>
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between">
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <div className="flex text-yellow-500 text-sm">
                              {[1,2,3,4,5].map((s) => <span key={s}>{s <= r.rating ? "★" : "☆"}</span>)}
                            </div>
                            {r.isApproved ? (
                              <Badge className="bg-green-100 text-green-800" variant="secondary">Approved</Badge>
                            ) : (
                              <Badge className="bg-yellow-100 text-yellow-800" variant="secondary">Pending</Badge>
                            )}
                          </div>
                          <p className="text-sm">
                            <span className="font-medium">{r.patientName}</span>
                            <span className="text-muted-foreground"> → Dr. {r.doctorName}</span>
                          </p>
                          {r.comment && <p className="text-sm text-muted-foreground mt-1">{r.comment}</p>}
                          <p className="text-xs text-muted-foreground mt-1">
                            {new Date(r.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                        <div className="flex gap-1">
                          <Button size="sm" variant={r.isApproved ? "outline" : "default"} onClick={() => handleToggle(r.id)}>
                            {r.isApproved ? "Unapprove" : "Approve"}
                          </Button>
                          <Button size="sm" variant="destructive" onClick={() => handleDelete(r.id)}>
                            Delete
                          </Button>
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

import { DoctorCard } from "@/components/shared/doctor-card";
import { SearchFilters } from "@/components/shared/search-filters";
import { Button } from "@/components/ui/button";
import Link from "next/link";

interface SearchPageProps {
  searchParams: Promise<{ [key: string]: string | undefined }>;
}

interface DoctorResult {
  id: string;
  name: string;
  image?: string | null;
  specialty: string;
  experience: number;
  consultationFee: number;
  city?: string | null;
  avgRating: number;
  reviewCount: number;
}

async function getDoctors(params: { [key: string]: string | undefined }) {
  const query = new URLSearchParams();
  if (params.q) query.set("q", params.q);
  if (params.specialty) query.set("specialty", params.specialty);
  if (params.city) query.set("city", params.city);
  if (params.maxFee) query.set("maxFee", params.maxFee);
  if (params.minRating) query.set("minRating", params.minRating);
  if (params.sortBy) query.set("sortBy", params.sortBy);
  if (params.sortOrder) query.set("sortOrder", params.sortOrder);
  query.set("page", params.page || "1");
  query.set("limit", "12");

  const baseUrl = process.env.NEXTAUTH_URL || "http://localhost:3000";
  const res = await fetch(`${baseUrl}/api/doctors/search?${query.toString()}`, {
    cache: "no-store",
  });

  if (!res.ok) {
    return { doctors: [], totalCount: 0, page: 1, limit: 12, hasMore: false };
  }

  return res.json();
}

async function getSpecialties() {
  const baseUrl = process.env.NEXTAUTH_URL || "http://localhost:3000";
  const res = await fetch(`${baseUrl}/api/specialties`, {
    cache: "no-store",
  });

  if (!res.ok) return { specialties: [] };
  return res.json();
}

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const params = await searchParams;
  const [doctorData, specialtyData] = await Promise.all([
    getDoctors(params),
    getSpecialties(),
  ]);

  const { doctors, totalCount, page, hasMore } = doctorData;
  const currentPage = parseInt(params.page || "1");

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <Link href="/">
            <h1 className="text-xl font-bold">Doctor Appointment</h1>
          </Link>
          <div className="flex gap-2">
            <Link href="/login">
              <Button variant="outline" size="sm">Sign In</Button>
            </Link>
            <Link href="/register">
              <Button size="sm">Register</Button>
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        <h2 className="text-2xl font-bold mb-6">Find a Doctor</h2>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Filters Sidebar */}
          <aside className="lg:col-span-1">
            <div className="bg-white rounded-lg border p-4 sticky top-4">
              <h3 className="font-semibold mb-4">Filters</h3>
              <SearchFilters specialties={specialtyData.specialties} />
            </div>
          </aside>

          {/* Results */}
          <div className="lg:col-span-3">
            <div className="flex justify-between items-center mb-4">
              <p className="text-sm text-muted-foreground">
                {totalCount} doctor{totalCount !== 1 ? "s" : ""} found
              </p>
            </div>

            {doctors.length === 0 ? (
              <div className="bg-white rounded-lg border p-12 text-center">
                <p className="text-lg font-medium text-muted-foreground">
                  No doctors found
                </p>
                <p className="text-sm text-muted-foreground mt-1">
                  Try adjusting your filters or search criteria
                </p>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                  {doctors.map((doctor: DoctorResult) => (
                    <DoctorCard key={doctor.id} {...doctor} />
                  ))}
                </div>

                {/* Pagination */}
                {totalCount > 12 && (
                  <div className="flex justify-center gap-2 mt-8">
                    {currentPage > 1 && (
                      <Link
                        href={`/search?${new URLSearchParams({
                          ...params as Record<string, string>,
                          page: String(currentPage - 1),
                        }).toString()}`}
                      >
                        <Button variant="outline">Previous</Button>
                      </Link>
                    )}
                    <span className="flex items-center px-4 text-sm text-muted-foreground">
                      Page {page}
                    </span>
                    {hasMore && (
                      <Link
                        href={`/search?${new URLSearchParams({
                          ...params as Record<string, string>,
                          page: String(currentPage + 1),
                        }).toString()}`}
                      >
                        <Button variant="outline">Next</Button>
                      </Link>
                    )}
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

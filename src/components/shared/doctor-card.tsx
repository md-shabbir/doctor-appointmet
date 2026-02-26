import Link from "next/link";
import {
  Card,
  CardContent,
  CardHeader,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

interface DoctorCardProps {
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

export function DoctorCard({
  id,
  name,
  specialty,
  experience,
  consultationFee,
  city,
  avgRating,
  reviewCount,
}: DoctorCardProps) {
  const initials = name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <Link href={`/doctors/${id}`}>
      <Card className="hover:shadow-md transition-shadow cursor-pointer h-full">
        <CardHeader className="flex flex-row items-center gap-4 pb-3">
          <Avatar className="h-14 w-14">
            <AvatarFallback className="text-lg bg-primary/10 text-primary">
              {initials}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-base truncate">Dr. {name}</h3>
            <Badge variant="secondary" className="mt-1">
              {specialty}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="pt-0 space-y-2">
          <div className="flex items-center gap-1 text-sm">
            <span className="text-yellow-500">★</span>
            <span className="font-medium">
              {avgRating > 0 ? avgRating.toFixed(1) : "New"}
            </span>
            {reviewCount > 0 && (
              <span className="text-muted-foreground">
                ({reviewCount} review{reviewCount !== 1 ? "s" : ""})
              </span>
            )}
          </div>
          <div className="flex justify-between text-sm text-muted-foreground">
            <span>{experience} yr{experience !== 1 ? "s" : ""} exp</span>
            {city && <span>{city}</span>}
          </div>
          <div className="text-sm font-semibold text-primary">
            ₹{consultationFee}
            <span className="font-normal text-muted-foreground">
              {" "}/ consultation
            </span>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}

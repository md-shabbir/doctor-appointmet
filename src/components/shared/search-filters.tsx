"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface SearchFiltersProps {
  specialties: string[];
}

export function SearchFilters({ specialties }: SearchFiltersProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [q, setQ] = useState(searchParams.get("q") || "");
  const [specialty, setSpecialty] = useState(
    searchParams.get("specialty") || ""
  );
  const [city, setCity] = useState(searchParams.get("city") || "");
  const [maxFee, setMaxFee] = useState(searchParams.get("maxFee") || "");
  const [sortBy, setSortBy] = useState(
    searchParams.get("sortBy") || "experience"
  );

  const updateURL = useCallback(
    (params: Record<string, string>) => {
      const current = new URLSearchParams(searchParams.toString());
      Object.entries(params).forEach(([key, value]) => {
        if (value) {
          current.set(key, value);
        } else {
          current.delete(key);
        }
      });
      current.set("page", "1");
      router.push(`/search?${current.toString()}`);
    },
    [router, searchParams]
  );

  // Debounce text inputs
  useEffect(() => {
    const timer = setTimeout(() => {
      updateURL({ q, city, maxFee });
    }, 400);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [q, city, maxFee]);

  const handleReset = () => {
    setQ("");
    setSpecialty("");
    setCity("");
    setMaxFee("");
    setSortBy("experience");
    router.push("/search");
  };

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="search">Search</Label>
        <Input
          id="search"
          placeholder="Doctor name or specialty..."
          value={q}
          onChange={(e) => setQ(e.target.value)}
        />
      </div>

      <div className="space-y-2">
        <Label>Specialty</Label>
        <Select
          value={specialty}
          onValueChange={(v) => {
            setSpecialty(v === "all" ? "" : v);
            updateURL({ specialty: v === "all" ? "" : v });
          }}
        >
          <SelectTrigger>
            <SelectValue placeholder="All specialties" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All specialties</SelectItem>
            {specialties.map((s) => (
              <SelectItem key={s} value={s}>
                {s}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="city">City</Label>
        <Input
          id="city"
          placeholder="e.g. Mumbai"
          value={city}
          onChange={(e) => setCity(e.target.value)}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="maxFee">Max Fee (₹)</Label>
        <Input
          id="maxFee"
          type="number"
          placeholder="e.g. 1000"
          min="0"
          value={maxFee}
          onChange={(e) => setMaxFee(e.target.value)}
        />
      </div>

      <div className="space-y-2">
        <Label>Sort By</Label>
        <Select
          value={sortBy}
          onValueChange={(v) => {
            setSortBy(v);
            updateURL({ sortBy: v });
          }}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="experience">Experience</SelectItem>
            <SelectItem value="fee">Consultation Fee</SelectItem>
            <SelectItem value="rating">Rating</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Button variant="outline" className="w-full" onClick={handleReset}>
        Reset Filters
      </Button>
    </div>
  );
}

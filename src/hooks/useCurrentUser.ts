"use client";

import { useSession } from "next-auth/react";

export function useCurrentUser() {
  const { data: session, status } = useSession();

  return {
    user: session?.user ?? null,
    isLoading: status === "loading",
    isAuthenticated: status === "authenticated",
    isPatient: session?.user?.role === "PATIENT",
    isDoctor: session?.user?.role === "DOCTOR",
    isAdmin: session?.user?.role === "ADMIN",
  };
}

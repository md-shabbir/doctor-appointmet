import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token;
    const pathname = req.nextUrl.pathname;

    // Role-based route protection
    if (pathname.startsWith("/patient") && token?.role !== "PATIENT") {
      return NextResponse.redirect(
        new URL(`/${(token?.role as string)?.toLowerCase()}/dashboard`, req.url)
      );
    }

    if (pathname.startsWith("/doctor") && token?.role !== "DOCTOR") {
      return NextResponse.redirect(
        new URL(`/${(token?.role as string)?.toLowerCase()}/dashboard`, req.url)
      );
    }

    if (pathname.startsWith("/admin") && token?.role !== "ADMIN") {
      return NextResponse.redirect(
        new URL(`/${(token?.role as string)?.toLowerCase()}/dashboard`, req.url)
      );
    }

    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token }) => !!token,
    },
  }
);

export const config = {
  matcher: ["/patient/:path*", "/doctor/:path*", "/admin/:path*"],
};

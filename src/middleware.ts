import { NextRequest, NextResponse } from "next/server";
import { jwtVerify } from "jose";

const SESSION_COOKIE = "session";
const RETURNING_COOKIE = "returning_user";

function getSecretKey() {
  const secret = process.env.SESSION_SECRET || "dev-only-insecure-secret-change-me";
  return new TextEncoder().encode(secret);
}

async function hasValidSession(req: NextRequest): Promise<boolean> {
  const token = req.cookies.get(SESSION_COOKIE)?.value;
  if (!token) return false;
  try {
    await jwtVerify(token, getSecretKey());
    return true;
  } catch {
    return false;
  }
}

const PROTECTED_PREFIXES = ["/dashboard", "/reports", "/account", "/health-trends"];

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const authenticated = await hasValidSession(req);

  if (pathname === "/") {
    if (authenticated) {
      return NextResponse.redirect(new URL("/dashboard", req.url));
    }
    const returning = req.cookies.get(RETURNING_COOKIE)?.value === "1";
    return NextResponse.redirect(new URL(returning ? "/login" : "/signup", req.url));
  }

  if (pathname === "/login" || pathname === "/signup") {
    if (authenticated) {
      return NextResponse.redirect(new URL("/dashboard", req.url));
    }
    return NextResponse.next();
  }

  if (PROTECTED_PREFIXES.some((p) => pathname === p || pathname.startsWith(p + "/"))) {
    if (!authenticated) {
      return NextResponse.redirect(new URL("/login", req.url));
    }
    return NextResponse.next();
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/", "/login", "/signup", "/dashboard/:path*", "/reports/:path*", "/account/:path*", "/health-trends/:path*"],
};

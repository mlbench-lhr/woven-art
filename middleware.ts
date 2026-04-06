import { NextResponse, type NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const protectedRoutes = ["/dashboard"];
  const authRoutes = [
    "/auth/login",
    "/auth/signup",
    "/auth/forgot-password",
    "/auth/reset-password",
    "/auth/verify-email",
  ];

  const isProtected = protectedRoutes.some((r) => pathname.startsWith(r));
  const isAuthRoute = authRoutes.includes(pathname);

  // Get token
  let token =
    request.cookies.get("auth_token")?.value ||
    request.headers.get("authorization")?.replace("Bearer ", "").trim();

  const isLoggedIn = !!token;

  if (pathname === "/") {
    return NextResponse.next();
  }

  if (isLoggedIn && isAuthRoute) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  // Not logged in → protected route access
  if (!isLoggedIn && isProtected) {
    return NextResponse.redirect(new URL("/auth/login", request.url));
  }

  // Refresh cookie if valid
  if (isLoggedIn && token) {
    const response = NextResponse.next();
    response.cookies.set("auth_token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      path: "/",
      sameSite: "strict",
      maxAge: 60 * 60 * 24 * 7,
    });
    return response;
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};

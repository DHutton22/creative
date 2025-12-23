import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function updateSession(request: NextRequest) {
  // If Supabase env vars are not set, just pass through
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey || supabaseUrl === "https://placeholder.supabase.co") {
    // No Supabase configured - allow all routes but redirect root to work-centres
    if (request.nextUrl.pathname === "/") {
      const url = request.nextUrl.clone();
      url.pathname = "/work-centres";
      return NextResponse.redirect(url);
    }
    return NextResponse.next();
  }

  let supabaseResponse = NextResponse.next({
    request,
  });

  try {
    const supabase = createServerClient(
      supabaseUrl,
      supabaseAnonKey,
      {
        cookies: {
          getAll() {
            return request.cookies.getAll();
          },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value }) =>
              request.cookies.set(name, value)
            );
            supabaseResponse = NextResponse.next({
              request,
            });
            cookiesToSet.forEach(({ name, value, options }) =>
              supabaseResponse.cookies.set(name, value, options)
            );
          },
        },
      }
    );

    const {
      data: { user },
    } = await supabase.auth.getUser();

    // Protected routes - redirect to login if not authenticated
    const isAuthRoute = request.nextUrl.pathname.startsWith("/login") || 
                        request.nextUrl.pathname.startsWith("/signup");
    const isProtectedRoute = request.nextUrl.pathname.startsWith("/checklists") ||
                             request.nextUrl.pathname.startsWith("/maintenance") ||
                             request.nextUrl.pathname.startsWith("/work-centres") ||
                             request.nextUrl.pathname.startsWith("/machines") ||
                             request.nextUrl.pathname.startsWith("/admin") ||
                             request.nextUrl.pathname.startsWith("/reports");

    // Redirect root to appropriate place
    if (request.nextUrl.pathname === "/") {
      const url = request.nextUrl.clone();
      url.pathname = user ? "/work-centres" : "/login";
      return NextResponse.redirect(url);
    }

    // Protected routes - redirect to login if not authenticated
    if (!user && isProtectedRoute) {
      const url = request.nextUrl.clone();
      url.pathname = "/login";
      url.searchParams.set("redirectTo", request.nextUrl.pathname);
      return NextResponse.redirect(url);
    }

    // If user is logged in and tries to access auth routes, redirect to work-centres
    if (user && isAuthRoute) {
      const url = request.nextUrl.clone();
      url.pathname = "/work-centres";
      return NextResponse.redirect(url);
    }
  } catch (error) {
    console.error("Middleware error:", error);
    // On auth error, redirect to login to refresh session
    if (request.nextUrl.pathname !== "/login" && request.nextUrl.pathname !== "/signup") {
      const url = request.nextUrl.clone();
      url.pathname = "/login";
      return NextResponse.redirect(url);
    }
  }

  return supabaseResponse;
}

import { type NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";

export async function middleware(request: NextRequest) {
    let response = NextResponse.next({
        request: {
            headers: request.headers,
        },
    });

    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                getAll() {
                    return request.cookies.getAll();
                },
                setAll(cookiesToSet) {
                    cookiesToSet.forEach(({ name, value, options }) =>
                        request.cookies.set(name, value)
                    );
                    response = NextResponse.next({
                        request,
                    });
                    cookiesToSet.forEach(({ name, value, options }) =>
                        response.cookies.set(name, value, options)
                    );
                },
            },
        }
    );

    // Refresh session if expired - required for Server Components
    // https://supabase.com/docs/guides/auth/server-side/nextjs
    const {
        data: { user },
    } = await supabase.auth.getUser();

    const path = request.nextUrl.pathname;

    // 1. Define Public Routes (No Login Required)
    const isPublicRoute =
        path === "/" ||  // Landing Page
        path.startsWith("/login") ||
        path.startsWith("/signup") ||
        path.startsWith("/forgot-password") ||
        path.startsWith("/auth/callback") || // Auth callbacks
        path.startsWith("/api/public");      // Public APIs if any

    // 2. Define Protected Routes (Login Required)
    // In our "compulsory login" model, EVERYTHING is protected unless explicitly public.
    const isProtectedRoute = !isPublicRoute;

    // 3. Handle Redirects
    if (isProtectedRoute && !user) {
        // Redirect to login if trying to access protected route without user
        const loginUrl = new URL("/login", request.url);
        loginUrl.searchParams.set("next", path); // Remember where they wanted to go
        return NextResponse.redirect(loginUrl);
    }

    if (user) {
        // If logged in and trying to access Auth pages, redirect to dashboard
        if (['/login', '/signup', '/forgot-password'].includes(path)) {
            return NextResponse.redirect(new URL("/dashboard", request.url));
        }
    }

    return response;
}

export const config = {
    matcher: [
        /*
         * Match all request paths except for the ones starting with:
         * - _next/static (static files)
         * - _next/image (image optimization files)
         * - favicon.ico (favicon file)
         * - public assets (svg, png, jpg, etc)
         */
        "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
    ],
};

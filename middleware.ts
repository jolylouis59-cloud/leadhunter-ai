import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          supabaseResponse = NextResponse.next({ request });
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

  const { pathname } = request.nextUrl;

  if (pathname.startsWith("/dashboard") && !user) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  if (user && pathname.startsWith("/dashboard")) {
    const { data: config } = await supabase
      .from("user_configs")
      .select("onboarding_completed")
      .eq("user_id", user.id)
      .maybeSingle();

    const onboardingCompleted = config?.onboarding_completed === true;
    const isOnboardingRoute = pathname.startsWith("/dashboard/onboarding");

    if (!onboardingCompleted && !isOnboardingRoute) {
      return NextResponse.redirect(new URL("/dashboard/onboarding", request.url));
    }

    if (onboardingCompleted && isOnboardingRoute) {
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }
  }

  if (pathname === "/login" && user) {
    const { data: config } = await supabase
      .from("user_configs")
      .select("onboarding_completed")
      .eq("user_id", user.id)
      .maybeSingle();

    const destination = config?.onboarding_completed ? "/dashboard" : "/dashboard/onboarding";
    return NextResponse.redirect(new URL(destination, request.url));
  }

  return supabaseResponse;
}

export const config = {
  matcher: ["/dashboard/:path*", "/login"],
};

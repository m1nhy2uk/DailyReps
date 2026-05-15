import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/middleware";

const PROTECTED_PREFIXES = ["/dashboard", "/workout", "/profile"];
const AUTH_PREFIXES = ["/login", "/signup"];

export async function middleware(request: NextRequest) {
  const { supabase, getResponse } = createClient(request);

  // getUser()는 Auth 서버에서 토큰을 검증하고, 만료 시 갱신 후 쿠키에 기록한다
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { pathname } = request.nextUrl;
  const isProtected = PROTECTED_PREFIXES.some((p) => pathname.startsWith(p));
  const isAuthPage = AUTH_PREFIXES.some((p) => pathname.startsWith(p));

  if (isProtected && !user) {
    const url = new URL("/login", request.url);
    url.searchParams.set("next", pathname);
    return NextResponse.redirect(url);
  }

  if (isAuthPage && user) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  return getResponse();
}

export const config = {
  matcher: [
    // 정적 자산(_next, 이미지, favicon)은 제외
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};

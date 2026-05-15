import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import type { Database } from "@/types/database.types";

/**
 * 미들웨어용 Supabase 클라이언트를 생성한다.
 *
 * setAll이 호출될 때 supabaseResponse가 재생성되므로,
 * auth.getUser() 호출 후 getResponse()로 최신 응답을 가져와야 한다.
 */
export function createClient(request: NextRequest): {
  supabase: ReturnType<typeof createServerClient<Database>>;
  getResponse: () => NextResponse;
} {
  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet, headers) {
          // 갱신된 토큰을 현재 요청의 쿠키에 반영 (downstream 서버 코드에서 읽기 위해)
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          // 새 request context를 가진 response 생성 후 쿠키 + 캐시 방지 헤더 추가
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
          Object.entries(headers).forEach(([key, value]) =>
            supabaseResponse.headers.set(key, value)
          );
        },
      },
    }
  );

  return {
    supabase,
    getResponse: () => supabaseResponse,
  };
}

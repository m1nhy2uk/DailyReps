import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import type { Database } from "@/types/database.types";

export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet, headers) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
            // headers: Cache-Control 등 캐시 방지 헤더 — 미들웨어에서만 의미 있음
            void headers;
          } catch {
            // Server Component에서 호출 시 쿠키 쓰기 불가 → 미들웨어가 세션 갱신 처리
          }
        },
      },
    }
  );
}

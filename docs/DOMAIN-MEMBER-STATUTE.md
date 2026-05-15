# 회원 도메인 규칙

## 1. DB 스키마

```sql
-- Supabase Auth가 auth.users를 자동 관리
-- 추가 프로필 정보는 public.profiles 테이블에 저장

CREATE TABLE public.profiles (
  id          uuid        REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  nickname    text        NOT NULL,
  avatar_url  text        DEFAULT NULL,
  created_at  timestamptz DEFAULT now() NOT NULL,
  updated_at  timestamptz DEFAULT now() NOT NULL,
  deleted_at  timestamptz DEFAULT NULL
);

-- RLS 활성화
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- 정책
CREATE POLICY "profiles: view own"
ON public.profiles FOR SELECT
USING (auth.uid() = id);

CREATE POLICY "profiles: update own"
ON public.profiles FOR UPDATE
USING (auth.uid() = id);

-- 회원가입 시 자동 프로필 생성 트리거
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, nickname)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'nickname', split_part(NEW.email, '@', 1)));
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION handle_new_user();
```

## 2. 타입 정의

```typescript
// types/member.types.ts

export interface Profile {
  id: string;
  nickname: string;
  avatar_url: string | null;
  created_at: string;
  updated_at: string;
}

export interface UpdateProfileInput {
  nickname?: string;
  avatar_url?: string | null;
}

export interface SignUpInput {
  email: string;
  password: string;
  nickname: string;
}

export interface SignInInput {
  email: string;
  password: string;
}
```

## 3. 서비스 함수 목록

```typescript
// lib/services/auth.service.ts
signUp(input: SignUpInput): Promise<ServiceResult<User>>
signIn(input: SignInInput): Promise<ServiceResult<User>>
signOut(): Promise<ServiceResult<null>>
getSession(): Promise<ServiceResult<Session>>

// lib/services/member.service.ts
getProfile(userId: string): Promise<ServiceResult<Profile>>
updateProfile(userId: string, input: UpdateProfileInput): Promise<ServiceResult<Profile>>
deleteAccount(userId: string): Promise<ServiceResult<null>>
```

## 4. 유효성 검사 규칙
- 이메일: 표준 이메일 형식 검사
- 비밀번호: 최소 8자, 영문+숫자 조합
- 닉네임: 2~20자, 특수문자 불가 (영문/한글/숫자/언더스코어 허용)

## 5. 라우트 구조
| 경로 | 설명 | 인증 필요 |
|------|------|-----------|
| `/login` | 로그인 페이지 | 아니오 |
| `/signup` | 회원가입 페이지 | 아니오 |
| `/profile` | 프로필 조회/수정 | 예 |

## 6. 미들웨어 보호 규칙
- `/login`, `/signup`은 로그인 상태에서 접근 시 `/dashboard`로 리다이렉트
- `/(protected)` 하위 경로는 비로그인 시 `/login`으로 리다이렉트
- 미들웨어 경로 패턴: `middleware.ts`에서 일괄 관리

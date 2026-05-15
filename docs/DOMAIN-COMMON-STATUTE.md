# 공통 도메인 규칙

## 1. 공통 DB 컬럼 규칙
모든 Supabase 테이블에 다음 컬럼을 포함한다:

```sql
id          uuid        DEFAULT gen_random_uuid() PRIMARY KEY
created_at  timestamptz DEFAULT now() NOT NULL
updated_at  timestamptz DEFAULT now() NOT NULL
deleted_at  timestamptz DEFAULT NULL  -- 소프트 삭제용
```

`updated_at` 자동 갱신 트리거를 모든 테이블에 적용한다:

```sql
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_update_updated_at
BEFORE UPDATE ON <table_name>
FOR EACH ROW EXECUTE FUNCTION update_updated_at();
```

## 2. RLS 공통 패턴
- 모든 테이블에 RLS를 활성화한다: `ALTER TABLE <table> ENABLE ROW LEVEL SECURITY;`
- 기본 정책: 자신의 데이터만 접근 가능

```sql
-- 조회
CREATE POLICY "users can view own data"
ON <table> FOR SELECT
USING (auth.uid() = user_id);

-- 생성
CREATE POLICY "users can insert own data"
ON <table> FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- 수정
CREATE POLICY "users can update own data"
ON <table> FOR UPDATE
USING (auth.uid() = user_id);

-- 삭제
CREATE POLICY "users can delete own data"
ON <table> FOR DELETE
USING (auth.uid() = user_id);
```

## 3. 공통 응답 타입

```typescript
// types/common.types.ts

export type ServiceResult<T> = {
  data: T | null;
  error: string | null;
};

export type PaginatedResult<T> = {
  data: T[];
  nextCursor: string | null;
  error: string | null;
};
```

## 4. 유효성 검사 규칙
- 유효성 검사는 서비스 레이어 진입 시 수행한다
- 빈 문자열, null, undefined를 동일하게 처리한다
- 숫자형 필드는 양수 여부를 검사한다
- 날짜 형식은 `YYYY-MM-DD` 문자열을 표준으로 사용한다

## 5. 소프트 삭제 규칙
- 삭제 시 `deleted_at = now()`로 설정한다
- 조회 시 항상 `WHERE deleted_at IS NULL` 조건을 포함한다
- Repository 레이어에서 이 조건을 자동으로 적용한다

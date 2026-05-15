"use client";

import { useState, useTransition } from "react";
import { deleteAccountAction } from "@/lib/services/member.service";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

export default function DeleteAccountSection() {
  const [confirming, setConfirming] = useState(false);
  const [error, setError] = useState<string>();
  const [isPending, startTransition] = useTransition();

  const handleDelete = () => {
    startTransition(async () => {
      const result = await deleteAccountAction();
      if (result?.error) {
        setError(result.error);
        setConfirming(false);
      }
    });
  };

  const handleCancel = () => {
    setConfirming(false);
    setError(undefined);
  };

  return (
    <div className="flex flex-col gap-4">
      <Separator />
      <div>
        <h2 className="text-sm font-semibold text-destructive">위험 구역</h2>
        <p className="text-xs text-muted-foreground mt-0.5">
          탈퇴 시 모든 운동 기록이 영구 삭제되며 복구할 수 없습니다.
        </p>
      </div>

      {error && (
        <p role="alert" className="text-sm text-destructive">
          {error}
        </p>
      )}

      {!confirming ? (
        <Button
          type="button"
          variant="destructive"
          size="sm"
          className="self-start"
          onClick={() => setConfirming(true)}
        >
          탈퇴하기
        </Button>
      ) : (
        <div className="flex flex-col gap-3 p-4 rounded-xl border border-destructive/30 bg-destructive/5">
          <p className="text-sm font-medium text-destructive">
            정말 탈퇴하시겠습니까?
          </p>
          <p className="text-xs text-muted-foreground">
            모든 운동 기록이 즉시 영구 삭제됩니다. 이 작업은 되돌릴 수 없습니다.
          </p>
          <div className="flex gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="flex-1"
              onClick={handleCancel}
              disabled={isPending}
            >
              취소
            </Button>
            <Button
              type="button"
              variant="destructive"
              size="sm"
              className="flex-1"
              onClick={handleDelete}
              disabled={isPending}
            >
              {isPending ? "처리 중..." : "탈퇴 확인"}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

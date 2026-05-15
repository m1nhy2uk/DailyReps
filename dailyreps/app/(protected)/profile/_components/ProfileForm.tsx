"use client";

import { useActionState, useState, useRef } from "react";
import Image from "next/image";
import {
  updateProfileAction,
  type ProfileActionState,
} from "@/lib/services/member.service";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { Profile } from "@/types/member.types";

interface ProfileFormProps {
  profile: Profile;
}

const initialState: ProfileActionState = {};

export default function ProfileForm({ profile }: ProfileFormProps) {
  const [state, action, pending] = useActionState(updateProfileAction, initialState);
  const [preview, setPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (preview) URL.revokeObjectURL(preview);
    setPreview(URL.createObjectURL(file));
  };

  const avatarSrc = preview ?? profile.avatar_url;
  const initials = profile.nickname.charAt(0).toUpperCase();

  return (
    <form action={action} className="flex flex-col gap-6">
      {/* 아바타 */}
      <div className="flex flex-col items-center gap-2">
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={pending}
          aria-label="프로필 이미지 변경"
          className="relative w-24 h-24 rounded-full overflow-hidden border-2 border-border hover:border-foreground/40 transition-colors disabled:opacity-50 bg-muted group"
        >
          {avatarSrc ? (
            <Image
              src={avatarSrc}
              alt="프로필 이미지"
              fill
              sizes="96px"
              className="object-cover"
              unoptimized={!!preview}
            />
          ) : (
            <span className="flex items-center justify-center w-full h-full text-2xl text-muted-foreground font-semibold select-none">
              {initials}
            </span>
          )}
          <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
            <span className="text-white text-xs font-medium">변경</span>
          </div>
        </button>
        <input
          ref={fileInputRef}
          type="file"
          name="avatar"
          accept="image/jpeg,image/png,image/webp,image/gif"
          onChange={handleFileChange}
          disabled={pending}
          className="hidden"
        />
        <p className="text-xs text-muted-foreground">JPG · PNG · WebP · GIF · 최대 2MB</p>
      </div>

      {/* 닉네임 */}
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="nickname">닉네임</Label>
        <Input
          id="nickname"
          name="nickname"
          type="text"
          defaultValue={profile.nickname}
          maxLength={20}
          required
          disabled={pending}
          placeholder="닉네임 입력"
        />
        <p className="text-xs text-muted-foreground">2~20자 · 영문/한글/숫자/언더스코어</p>
      </div>

      {state.error && (
        <p role="alert" className="text-sm text-destructive">
          {state.error}
        </p>
      )}
      {state.success && (
        <p role="status" className="text-sm text-green-600 dark:text-green-400">
          프로필이 저장됐습니다
        </p>
      )}

      <Button type="submit" size="lg" className="w-full" disabled={pending}>
        {pending ? "저장 중..." : "저장"}
      </Button>
    </form>
  );
}

"use client";

import { useActionState, useRef, useState, useEffect } from "react";
import {
  createEntryAction,
  searchExerciseNames,
  type WorkoutActionState,
} from "@/lib/services/workout.service";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface AddEntryFormProps {
  date: string;
}

const initialState: WorkoutActionState = {};

export default function AddEntryForm({ date }: AddEntryFormProps) {
  const [state, action, pending] = useActionState(createEntryAction, initialState);
  const inputRef = useRef<HTMLInputElement>(null);
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!query.trim()) return;
    const timer = setTimeout(async () => {
      const results = await searchExerciseNames(query);
      setSuggestions(results);
      setOpen(results.length > 0);
    }, 300);
    return () => clearTimeout(timer);
  }, [query]);

  const showDropdown = open && query.trim().length > 0 && suggestions.length > 0;

  const pickSuggestion = (name: string) => {
    setQuery(name);
    setSuggestions([]);
    setOpen(false);
    inputRef.current?.focus();
  };

  const handleBlur = () => {
    setTimeout(() => setOpen(false), 150);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Escape") setOpen(false);
  };

  return (
    <div className="flex flex-col gap-1">
      <form
        action={async (formData) => {
          await action(formData);
          setQuery("");
          setSuggestions([]);
          setOpen(false);
        }}
        className="flex gap-2"
      >
        <input type="hidden" name="date" value={date} />

        <div className="relative flex-1">
          <Input
            ref={inputRef}
            name="exercise_name"
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onFocus={() => suggestions.length > 0 && query.trim() && setOpen(true)}
            onBlur={handleBlur}
            onKeyDown={handleKeyDown}
            placeholder="종목 이름 (예: 벤치프레스)"
            maxLength={50}
            required
            disabled={pending}
            autoComplete="off"
          />

          {/* 자동완성 드롭다운 */}
          {showDropdown && (
            <ul
              role="listbox"
              className="absolute z-10 top-full left-0 right-0 mt-1 bg-popover border border-border rounded-lg shadow-md overflow-hidden"
            >
              {suggestions.map((name) => (
                <li key={name}>
                  <button
                    type="button"
                    onMouseDown={() => pickSuggestion(name)}
                    className="w-full text-left px-3 py-2 text-sm hover:bg-accent hover:text-accent-foreground transition-colors"
                  >
                    {highlightMatch(name, query)}
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

        <Button type="submit" disabled={pending} className="shrink-0">
          {pending ? "추가 중…" : "+ 종목 추가"}
        </Button>
      </form>

      {state.error && (
        <p role="alert" className="text-xs text-destructive">
          {state.error}
        </p>
      )}
    </div>
  );
}

function highlightMatch(text: string, query: string) {
  if (!query.trim()) return text;
  const idx = text.toLowerCase().indexOf(query.toLowerCase());
  if (idx === -1) return text;
  return (
    <>
      {text.slice(0, idx)}
      <span className="font-semibold">{text.slice(idx, idx + query.length)}</span>
      {text.slice(idx + query.length)}
    </>
  );
}

"use client";

import { useActionState, useRef, useState, useEffect, useTransition } from "react";
import {
  createEntryAction,
  createMultipleEntries,
  searchExerciseNames,
  type WorkoutActionState,
} from "@/lib/services/workout.service";
import { EXERCISES_BY_CATEGORY } from "@/lib/utils/exercise-category";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface AddEntryFormProps {
  date: string;
}

const initialState: WorkoutActionState = {};

export default function AddEntryForm({ date }: AddEntryFormProps) {
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [selected, setSelected] = useState<string[]>([]);
  const [isPending, startTransition] = useTransition();
  const [pickerError, setPickerError] = useState<string | null>(null);

  // 직접 입력
  const [state, action, pending] = useActionState(createEntryAction, initialState);
  const inputRef = useRef<HTMLInputElement>(null);
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  useEffect(() => {
    if (!query.trim()) { setSuggestions([]); setDropdownOpen(false); return; }
    const timer = setTimeout(async () => {
      const results = await searchExerciseNames(query);
      setSuggestions(results);
      setDropdownOpen(results.length > 0);
    }, 300);
    return () => clearTimeout(timer);
  }, [query]);

  const showDropdown = dropdownOpen && query.trim().length > 0 && suggestions.length > 0;

  const pickSuggestion = (name: string) => {
    setQuery(name);
    setSuggestions([]);
    setDropdownOpen(false);
    inputRef.current?.focus();
  };

  const toggleCategory = (id: string) => {
    setActiveCategory((prev) => (prev === id ? null : id));
    setSelected([]);
    setPickerError(null);
  };

  const toggleExercise = (name: string) => {
    setSelected((prev) =>
      prev.includes(name) ? prev.filter((n) => n !== name) : [...prev, name]
    );
  };

  const handlePickerSubmit = () => {
    if (selected.length === 0) return;
    setPickerError(null);
    startTransition(async () => {
      const result = await createMultipleEntries(selected, date);
      if (result.error) {
        setPickerError(result.error);
      } else {
        setSelected([]);
      }
    });
  };

  return (
    <div className="flex flex-col gap-3">
      {/* 카테고리 목록 */}
      {EXERCISES_BY_CATEGORY.map(({ category, exercises }) => {
        const isOpen = activeCategory === category.id;
        return (
          <div key={category.id} className="flex flex-col">
            {/* 카테고리 헤더 */}
            <button
              type="button"
              onClick={() => toggleCategory(category.id)}
              className={`flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors text-left ${
                isOpen
                  ? "bg-muted text-foreground"
                  : "hover:bg-muted/60 text-muted-foreground hover:text-foreground"
              }`}
            >
              <span className={`w-2 h-2 rounded-full shrink-0 ${category.dotColor}`} />
              {category.label}
              <span className="ml-auto text-xs opacity-50">{isOpen ? "▲" : "▼"}</span>
            </button>

            {/* 펼쳐진 카테고리 내부 */}
            {isOpen && (
              <div className="flex flex-col gap-3 px-3 py-3 border-l-2 border-border ml-4 mt-1">
                {/* 프리셋 종목 */}
                <div className="flex flex-wrap gap-2">
                  {exercises.map((name) => {
                    const isSelected = selected.includes(name);
                    return (
                      <button
                        key={name}
                        type="button"
                        onClick={() => toggleExercise(name)}
                        className={`px-3 py-1.5 rounded-lg text-sm border transition-colors ${
                          isSelected
                            ? "bg-foreground text-background border-foreground"
                            : "border-border hover:bg-accent"
                        }`}
                      >
                        {name}
                      </button>
                    );
                  })}
                </div>

                {/* 직접 입력 */}
                <form
                  action={async (formData) => {
                    await action(formData);
                    setQuery("");
                    setSuggestions([]);
                    setDropdownOpen(false);
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
                      onFocus={() => suggestions.length > 0 && query.trim() && setDropdownOpen(true)}
                      onBlur={() => setTimeout(() => setDropdownOpen(false), 150)}
                      onKeyDown={(e) => { if (e.key === "Escape") setDropdownOpen(false); }}
                      placeholder="직접 입력..."
                      maxLength={50}
                      disabled={pending}
                      autoComplete="off"
                    />
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
                  <Button type="submit" disabled={pending || !query.trim()} size="sm" className="shrink-0">
                    {pending ? "…" : "+ 추가"}
                  </Button>
                </form>

                {state.error && (
                  <p role="alert" className="text-xs text-destructive">{state.error}</p>
                )}

                {/* 선택된 종목 + 추가 버튼 */}
                {selected.length > 0 && (
                  <div className="flex flex-col gap-2 pt-1 border-t">
                    <div className="flex flex-wrap gap-1.5">
                      {selected.map((name) => (
                        <span
                          key={name}
                          className="flex items-center gap-1 px-2.5 py-1 bg-foreground text-background rounded-full text-xs"
                        >
                          {name}
                          <button
                            type="button"
                            onClick={() => toggleExercise(name)}
                            className="opacity-70 hover:opacity-100"
                            aria-label={`${name} 제거`}
                          >
                            ×
                          </button>
                        </span>
                      ))}
                    </div>
                    <Button
                      type="button"
                      onClick={handlePickerSubmit}
                      disabled={isPending}
                      size="sm"
                      className="self-end"
                    >
                      {isPending ? "추가 중…" : `${selected.length}개 종목 추가`}
                    </Button>
                    {pickerError && (
                      <p role="alert" className="text-xs text-destructive">{pickerError}</p>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        );
      })}
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

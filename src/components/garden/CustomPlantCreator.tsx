"use client";

import { useCallback, useEffect, useId, useRef, useState } from "react";
import { ChevronDown, Loader2, PenLine, Search } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  draftFromAI,
  draftFromCatalog,
  EMOJI_PICKER_OPTIONS,
  type CustomPlantDraft,
} from "@/lib/plants/custom-plant";
import type { CatalogPlant } from "@/lib/plants/catalog";
import {
  lookupPlantByName,
  searchPlantCatalog,
} from "@/lib/plants/search";
import { toPlant } from "@/lib/plants/catalog";
import type { PlantCategory, SunExposure } from "@/types/plant";

type InputMode = "search" | "manual";

type CustomPlantCreatorProps = {
  onSave: (draft: CustomPlantDraft) => void;
  disabled?: boolean;
};

const EMPTY_DRAFT: CustomPlantDraft = { name: "" };

const SUN_OPTIONS: { value: SunExposure; label: string }[] = [
  { value: "full", label: "Full sun" },
  { value: "partial", label: "Partial sun" },
  { value: "shade", label: "Shade" },
];

const CATEGORY_OPTIONS: { value: PlantCategory; label: string }[] = [
  { value: "vegetable", label: "🥕 Vegetable" },
  { value: "flower", label: "🌸 Flower" },
  { value: "tree", label: "🌳 Tree" },
];

export function CustomPlantCreator({
  onSave,
  disabled = false,
}: CustomPlantCreatorProps) {
  const listboxId = useId();
  const [expanded, setExpanded] = useState(false);
  const [mode, setMode] = useState<InputMode>("search");
  const [query, setQuery] = useState("");
  const [draft, setDraft] = useState<CustomPlantDraft>(EMPTY_DRAFT);
  const [suggestions, setSuggestions] = useState<CatalogPlant[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isLookingUp, setIsLookingUp] = useState(false);
  const [lookupMessage, setLookupMessage] = useState<string | null>(null);
  const [activeIndex, setActiveIndex] = useState(-1);
  const containerRef = useRef<HTMLDivElement>(null);

  const updateSuggestions = useCallback((value: string) => {
    setSuggestions(searchPlantCatalog(value, 8));
  }, []);

  useEffect(() => {
    if (mode !== "search") return;
    const timer = window.setTimeout(() => updateSuggestions(query), 150);
    return () => window.clearTimeout(timer);
  }, [query, mode, updateSuggestions]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setShowSuggestions(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const applyCatalogEntry = (entry: CatalogPlant) => {
    setDraft(draftFromCatalog(entry));
    setQuery(entry.name);
    setShowSuggestions(false);
    setLookupMessage(`Filled from database: ${entry.name}`);
  };

  const runLookup = async () => {
    const trimmed = query.trim();
    if (!trimmed) return;

    setIsLookingUp(true);
    setLookupMessage(null);

    try {
      const result = await lookupPlantByName(trimmed);

      if (result.source === "ai" && result.plant) {
        setDraft(draftFromAI({
          name: result.plant.name,
          category: result.plant.category,
          emoji: result.plant.emoji,
          sun: result.plant.sun,
          water: result.plant.water,
          wateringIntervalDays: result.plant.wateringIntervalDays,
          minTempC: result.plant.minTempC,
          spreadM: result.plant.spreadM,
          heightM: result.plant.heightM,
        }));
        setLookupMessage("Filled from AI lookup.");
        return;
      }

      if (result.plant) {
        const entry = searchPlantCatalog(trimmed, 1)[0];
        if (entry) applyCatalogEntry(entry);
        return;
      }

      if (result.suggestions.length > 0) {
        setSuggestions(
          result.suggestions
            .map((p) => searchPlantCatalog(p.name, 1)[0])
            .filter((e): e is CatalogPlant => Boolean(e)),
        );
        setShowSuggestions(true);
        setLookupMessage("Pick a match below, or switch to manual entry.");
        return;
      }

      setDraft({ name: trimmed });
      setMode("manual");
      setLookupMessage(`"${trimmed}" not in database — enter details manually.`);
    } finally {
      setIsLookingUp(false);
    }
  };

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    if (!draft.name.trim()) {
      if (mode === "search" && query.trim()) {
        void runLookup();
      }
      return;
    }
    onSave(draft);
    resetForm();
  };

  const resetForm = () => {
    setDraft(EMPTY_DRAFT);
    setQuery("");
    setSuggestions([]);
    setLookupMessage(null);
    setMode("search");
    setShowSuggestions(false);
  };

  const switchToManual = () => {
    setMode("manual");
    if (!draft.name.trim() && query.trim()) {
      setDraft({ name: query.trim() });
    }
    setShowSuggestions(false);
  };

  if (!expanded) {
    return (
      <Button
        type="button"
        variant="outline"
        className="w-full"
        disabled={disabled}
        onClick={() => setExpanded(true)}
      >
        + Custom Plant
      </Button>
    );
  }

  return (
    <div className="rounded-lg border border-border bg-card p-3">
      <div className="mb-3 flex items-center justify-between gap-2">
        <h3 className="text-sm font-medium">Custom Plant</h3>
        <button
          type="button"
          onClick={() => {
            setExpanded(false);
            resetForm();
          }}
          className="text-xs text-muted-foreground hover:text-foreground"
        >
          Close
        </button>
      </div>

      <div className="mb-3 flex gap-1 rounded-lg border border-border p-0.5">
        <button
          type="button"
          disabled={disabled}
          onClick={() => setMode("search")}
          className={`flex flex-1 items-center justify-center gap-1 rounded-md px-2 py-1.5 text-xs font-medium ${
            mode === "search"
              ? "bg-primary text-primary-foreground"
              : "text-muted-foreground hover:bg-muted"
          }`}
        >
          <Search className="size-3.5" aria-hidden />
          Smart search
        </button>
        <button
          type="button"
          disabled={disabled}
          onClick={switchToManual}
          className={`flex flex-1 items-center justify-center gap-1 rounded-md px-2 py-1.5 text-xs font-medium ${
            mode === "manual"
              ? "bg-primary text-primary-foreground"
              : "text-muted-foreground hover:bg-muted"
          }`}
        >
          <PenLine className="size-3.5" aria-hidden />
          Manual
        </button>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-3">
        {mode === "search" ? (
          <div ref={containerRef} className="relative">
            <label htmlFor={`${listboxId}-search`} className="sr-only">
              Search plants
            </label>
            <input
              id={`${listboxId}-search`}
              type="text"
              disabled={disabled || isLookingUp}
              value={query}
              onChange={(event) => {
                setQuery(event.target.value);
                setShowSuggestions(true);
                setActiveIndex(-1);
                if (draft.name && event.target.value !== draft.name) {
                  setDraft(EMPTY_DRAFT);
                }
              }}
              onFocus={() => {
                setShowSuggestions(true);
                updateSuggestions(query);
              }}
              onKeyDown={(event) => {
                if (event.key === "ArrowDown") {
                  event.preventDefault();
                  setActiveIndex((i) =>
                    Math.min(i + 1, suggestions.length - 1),
                  );
                } else if (event.key === "ArrowUp") {
                  event.preventDefault();
                  setActiveIndex((i) => Math.max(i - 1, 0));
                } else if (event.key === "Enter" && activeIndex >= 0) {
                  event.preventDefault();
                  const entry = suggestions[activeIndex];
                  if (entry) applyCatalogEntry(entry);
                } else if (event.key === "Escape") {
                  setShowSuggestions(false);
                }
              }}
              placeholder='e.g. 장미, Rose, Mint…'
              className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
              role="combobox"
              aria-expanded={showSuggestions && suggestions.length > 0}
              aria-controls={`${listboxId}-listbox`}
              aria-autocomplete="list"
            />
            {showSuggestions && suggestions.length > 0 ? (
              <ul
                id={`${listboxId}-listbox`}
                role="listbox"
                className="absolute z-30 mt-1 max-h-48 w-full overflow-auto rounded-lg border border-border bg-popover py-1 shadow-lg"
              >
                {suggestions.map((entry, index) => {
                  const plant = toPlant(entry);
                  return (
                    <li key={entry.id} role="option" aria-selected={index === activeIndex}>
                      <button
                        type="button"
                        className={`flex w-full items-center gap-2 px-3 py-2 text-left text-sm hover:bg-muted ${
                          index === activeIndex ? "bg-muted" : ""
                        }`}
                        onMouseDown={(event) => event.preventDefault()}
                        onClick={() => applyCatalogEntry(entry)}
                      >
                        <span className="text-lg" aria-hidden>
                          {plant.emoji}
                        </span>
                        <span className="flex-1 font-medium">{plant.name}</span>
                        <span className="text-xs text-muted-foreground capitalize">
                          {plant.category}
                        </span>
                      </button>
                    </li>
                  );
                })}
              </ul>
            ) : null}
            <div className="mt-2 flex flex-wrap gap-2">
              <Button
                type="button"
                size="sm"
                variant="secondary"
                disabled={disabled || isLookingUp || !query.trim()}
                onClick={() => void runLookup()}
              >
                {isLookingUp ? (
                  <Loader2 className="size-3.5 animate-spin" aria-hidden />
                ) : (
                  <Search className="size-3.5" aria-hidden />
                )}
                Look up
              </Button>
              <Button
                type="button"
                size="sm"
                variant="ghost"
                disabled={disabled}
                onClick={switchToManual}
              >
                Enter manually
              </Button>
            </div>
          </div>
        ) : null}

        {(mode === "manual" || draft.name) && (
          <ManualFields
            draft={draft}
            disabled={disabled}
            onChange={setDraft}
          />
        )}

        {lookupMessage ? (
          <p className="text-xs text-muted-foreground" role="status">
            {lookupMessage}
          </p>
        ) : null}

        <Button
          type="submit"
          size="sm"
          disabled={disabled || (!draft.name.trim() && !query.trim())}
        >
          Add to palette
        </Button>
      </form>
    </div>
  );
}

function ManualFields({
  draft,
  disabled,
  onChange,
}: {
  draft: CustomPlantDraft;
  disabled: boolean;
  onChange: (draft: CustomPlantDraft) => void;
}) {
  const [emojiOpen, setEmojiOpen] = useState(false);

  return (
    <div className="flex flex-col gap-2.5 border-t border-border pt-3">
      <label className="flex flex-col gap-1 text-xs font-medium">
        Name <span className="text-destructive">*</span>
        <input
          type="text"
          required
          disabled={disabled}
          value={draft.name}
          onChange={(e) => onChange({ ...draft, name: e.target.value })}
          className="rounded-lg border border-input bg-background px-3 py-2 text-sm font-normal outline-none focus-visible:ring-2 focus-visible:ring-ring"
          placeholder="My plant"
        />
      </label>

      <div className="flex flex-col gap-1 text-xs font-medium">
        Emoji
        <div className="relative">
          <button
            type="button"
            disabled={disabled}
            onClick={() => setEmojiOpen((v) => !v)}
            className="flex w-full items-center justify-between rounded-lg border border-input bg-background px-3 py-2 text-sm font-normal"
          >
            <span className="text-xl">{draft.emoji ?? "🌱"}</span>
            <ChevronDown className="size-4 text-muted-foreground" aria-hidden />
          </button>
          {emojiOpen ? (
            <div className="absolute z-20 mt-1 grid w-full grid-cols-6 gap-1 rounded-lg border border-border bg-popover p-2 shadow-lg">
              {EMOJI_PICKER_OPTIONS.map((emoji) => (
                <button
                  key={emoji}
                  type="button"
                  className="rounded-md p-1.5 text-xl hover:bg-muted"
                  onClick={() => {
                    onChange({ ...draft, emoji });
                    setEmojiOpen(false);
                  }}
                >
                  {emoji}
                </button>
              ))}
            </div>
          ) : null}
        </div>
      </div>

      <label className="flex flex-col gap-1 text-xs font-medium">
        Category
        <select
          disabled={disabled}
          value={draft.category ?? "vegetable"}
          onChange={(e) =>
            onChange({
              ...draft,
              category: e.target.value as PlantCategory,
            })
          }
          className="rounded-lg border border-input bg-background px-3 py-2 text-sm font-normal outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          {CATEGORY_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </label>

      <label className="flex flex-col gap-1 text-xs font-medium">
        Water every (days)
        <input
          type="number"
          min={1}
          disabled={disabled}
          value={draft.wateringIntervalDays ?? ""}
          onChange={(e) =>
            onChange({
              ...draft,
              wateringIntervalDays: e.target.value
                ? Number(e.target.value)
                : undefined,
            })
          }
          placeholder="3"
          className="rounded-lg border border-input bg-background px-3 py-2 text-sm font-normal outline-none focus-visible:ring-2 focus-visible:ring-ring"
        />
      </label>

      <label className="flex flex-col gap-1 text-xs font-medium">
        Sun
        <select
          disabled={disabled}
          value={draft.sun ?? ""}
          onChange={(e) =>
            onChange({
              ...draft,
              sun: (e.target.value || undefined) as SunExposure | undefined,
            })
          }
          className="rounded-lg border border-input bg-background px-3 py-2 text-sm font-normal outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <option value="">—</option>
          {SUN_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </label>

      <label className="flex flex-col gap-1 text-xs font-medium">
        Min temp (°C)
        <input
          type="number"
          disabled={disabled}
          value={draft.minTempC ?? ""}
          onChange={(e) =>
            onChange({
              ...draft,
              minTempC: e.target.value ? Number(e.target.value) : undefined,
            })
          }
          placeholder="5"
          className="rounded-lg border border-input bg-background px-3 py-2 text-sm font-normal outline-none focus-visible:ring-2 focus-visible:ring-ring"
        />
      </label>
    </div>
  );
}

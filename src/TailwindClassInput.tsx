import React, {
  useState,
  useRef,
  useCallback,
  useEffect,
  useMemo,
  KeyboardEvent,
  forwardRef,
  useId,
  memo,
} from "react";
import {
  Box,
  Chip,
  Paper,
  FormControl,
  FormHelperText,
  MenuList,
  MenuItem,
  Popper,
  Tooltip,
  Typography,
  useTheme,
  SxProps,
  Theme,
} from "@mui/material";
import { TAILWIND_CLASSES } from "./tailwindClasses";
import { FRIENDLY_LABELS } from "./friendlyLabels";
import { PresetsPanel } from "./PresetsPanel";
import { mergeClasses } from "./classConflicts";
import type { PresetGroupKey } from "./presets";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface TailwindClassInputProps {
  /**
   * Controlled value — an array of Tailwind class strings.
   * e.g. ['flex', 'items-center', 'gap-4']
   */
  value?: string[];
  /**
   * Uncontrolled default value — array of class strings.
   */
  defaultValue?: string[];
  /**
   * Called whenever the class list changes.
   * Receives the full updated array of class strings.
   */
  onChange?: (value: string[]) => void;
  /** Input name — wires a hidden <input> for HTML/RA form binding (joined with spaces). */
  name?: string;
  /**
   * Called when the input loses focus.
   * React Admin / RHF uses this to mark the field as touched.
   */
  onBlur?: () => void;
  label?: React.ReactNode;
  helperText?: React.ReactNode;
  error?: boolean;
  required?: boolean;
  disabled?: boolean;
  readOnly?: boolean;
  placeholder?: string;
  /** Custom class list to autocomplete from. Defaults to full Tailwind v3 list. */
  classList?: string[];
  /** Extra or override friendly labels merged on top of the built-in map. */
  extraFriendlyLabels?: Record<string, string>;
  /** Hide all friendly labels in dropdown and chip tooltips. */
  hideFriendlyLabels?: boolean;
  /** Max suggestions in dropdown. Default: 14. */
  maxSuggestions?: number;
  /** Autocomplete matching strategy. Default: 'includes'. */
  matchMode?: "includes" | "startsWith" | "fuzzy";
  /**
   * Enable preset groups.
   * - `true` = all defaults
   * - `PresetGroupKey[]` = specific groups
   *
   * Available: 'layout' | 'padding' | 'margin' | 'gap' | 'width' |
   *   'typography' | 'fontWeight' | 'textColor' | 'bgColor' |
   *   'borderColor' | 'borderRadius' | 'shadow'
   */
  presets?: true | PresetGroupKey[];
  /**
   * Debounce delay in ms for autocomplete search. Default: 0 (synchronous).
   * Try 80–150 if you notice lag with a large custom classList.
   */
  searchDebounceMs?: number;
  /**
   * Lazy-mount chip tooltips (only on first hover). Default: true.
   * Disable if you need tooltips to be in the DOM immediately (e.g. for testing).
   */
  lazyChipTooltips?: boolean;
  sx?: SxProps<Theme>;
  variant?: "outlined" | "filled" | "standard";
  size?: "small" | "medium";
  fullWidth?: boolean;
  className?: string;
  id?: string;
  [key: string]: unknown;
}

// ---------------------------------------------------------------------------
// Static sx constants — never recreated on re-render
// ---------------------------------------------------------------------------
const SX_CHIP_LABEL = { px: 1 } as const;

// ---------------------------------------------------------------------------
// Inverted friendly-label index for label-aware search
// ---------------------------------------------------------------------------
function buildLabelIndex(
  labels: Record<string, string>,
): Map<string, string[]> {
  const index = new Map<string, string[]>();
  for (const [cls, label] of Object.entries(labels)) {
    const words = label
      .toLowerCase()
      .split(/\W+/)
      .filter((w) => w.length > 1);
    for (const word of words) {
      const list = index.get(word);
      if (list) list.push(cls);
      else index.set(word, [cls]);
    }
  }
  return index;
}

// ---------------------------------------------------------------------------
// Suggestion engine
// ---------------------------------------------------------------------------
function fuzzyMatch(cls: string, query: string): boolean {
  let qi = 0;
  for (let ci = 0; ci < cls.length && qi < query.length; ci++) {
    if (cls[ci] === query[qi]) qi++;
  }
  return qi === query.length;
}

function getSuggestions(
  query: string,
  excluded: ReadonlySet<string>,
  classList: string[],
  classSet: ReadonlySet<string>,
  labelIndex: Map<string, string[]>,
  matchMode: "includes" | "startsWith" | "fuzzy",
  max: number,
): string[] {
  if (!query) return [];
  const lower = query.toLowerCase();
  const nameExact: string[] = [];
  const namePartial: string[] = [];

  for (const cls of classList) {
    if (excluded.has(cls)) continue;
    let matched: boolean;
    if (matchMode === "startsWith") matched = cls.startsWith(lower);
    else if (matchMode === "fuzzy") matched = fuzzyMatch(cls, lower);
    else matched = cls.includes(lower);
    if (matched) {
      if (cls.startsWith(lower)) nameExact.push(cls);
      else namePartial.push(cls);
      if (nameExact.length + namePartial.length >= max * 2) break;
    }
  }

  const labelHits = new Set<string>();
  for (const [word, classes] of labelIndex) {
    if (word.includes(lower) || lower.includes(word)) {
      for (const cls of classes) {
        if (!excluded.has(cls) && classSet.has(cls)) labelHits.add(cls);
      }
    }
  }

  const seen = new Set<string>();
  const result: string[] = [];
  for (const cls of nameExact) {
    if (!seen.has(cls)) {
      seen.add(cls);
      result.push(cls);
    }
  }
  for (const cls of namePartial) {
    if (!seen.has(cls)) {
      seen.add(cls);
      result.push(cls);
    }
  }
  for (const cls of labelHits) {
    if (!seen.has(cls)) {
      seen.add(cls);
      result.push(cls);
    }
    if (result.length >= max) break;
  }
  return result.slice(0, max);
}

// ---------------------------------------------------------------------------
// Value coercion helpers
// Internally the component always works with string[].
// We accept string | string[] at the boundary (value/defaultValue) so the
// component gracefully handles both a DB string field and a DB array field.
// ---------------------------------------------------------------------------

/** Normalise an incoming value (string | string[] | null | undefined) → string[] */
export function coerceToArray(value: unknown): string[] {
  if (!value) return [];
  if (Array.isArray(value))
    return value.filter((v) => typeof v === "string" && v.trim());
  if (typeof value === "string")
    return value.trim().split(/\s+/).filter(Boolean);
  return [];
}

// ---------------------------------------------------------------------------
// OutlinedNotch
// ---------------------------------------------------------------------------
interface OutlinedNotchProps {
  label: React.ReactNode;
  shrunk: boolean;
  focused: boolean;
  error: boolean;
  required: boolean;
  borderColor: string;
}

const OutlinedNotch = memo(function OutlinedNotch({
  label,
  shrunk,
  focused,
  borderColor,
  required,
}: OutlinedNotchProps) {
  return (
    <fieldset
      aria-hidden="true"
      style={{
        position: "absolute",
        inset: "-5px 0 0",
        margin: 0,
        padding: "0 8px",
        pointerEvents: "none",
        borderRadius: 4,
        border: `${focused ? 2 : 1}px solid ${borderColor}`,
        overflow: "hidden",
        transition: "border-color 200ms",
      }}
    >
      <legend
        style={{
          float: "unset",
          width: "auto",
          overflow: "hidden",
          display: "block",
          padding: 0,
          height: "11px",
          fontSize: "0.75em",
          visibility: "hidden",
          maxWidth: shrunk ? "100%" : "0.01px",
          whiteSpace: "nowrap",
          transition: "max-width 150ms cubic-bezier(0,0,0.2,1) 0ms",
        }}
      >
        <span
          style={{ paddingLeft: 5, paddingRight: 5, display: "inline-block" }}
        >
          {label}
          {required ? "\u00a0*" : ""}
        </span>
      </legend>
    </fieldset>
  );
});

// ---------------------------------------------------------------------------
// ActiveClassChip — memoized
// ---------------------------------------------------------------------------
const ActiveClassChip = memo(function ActiveClassChip({
  cls,
  friendly,
  isSmall,
  disabled,
  readOnly,
  lazyTooltip,
  onRemove,
}: {
  cls: string;
  friendly: string | undefined;
  isSmall: boolean;
  disabled: boolean;
  readOnly: boolean;
  lazyTooltip: boolean;
  onRemove: (cls: string) => void;
}) {
  const handleDelete = useCallback(() => onRemove(cls), [onRemove, cls]);

  const chip = (
    <Chip
      label={cls}
      size="small"
      onDelete={disabled || readOnly ? undefined : handleDelete}
      sx={{
        fontFamily: "monospace",
        fontSize: isSmall ? "0.7rem" : "0.75rem",
        height: isSmall ? 22 : 26,
        "& .MuiChip-label": SX_CHIP_LABEL,
      }}
    />
  );

  if (!friendly) return chip;

  return (
    <Tooltip
      title={friendly}
      placement="top"
      arrow
      disableInteractive={lazyTooltip}
    >
      {chip}
    </Tooltip>
  );
});

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------
export const TailwindClassInput = forwardRef<
  HTMLDivElement,
  TailwindClassInputProps
>(function TailwindClassInput(props, ref) {
  const {
    value: valueProp,
    defaultValue,
    onChange,
    name,
    label,
    helperText,
    error = false,
    required = false,
    disabled = false,
    readOnly = false,
    placeholder = "Search or type a class…",
    classList = TAILWIND_CLASSES,
    extraFriendlyLabels,
    hideFriendlyLabels = false,
    maxSuggestions = 14,
    matchMode = "includes",
    presets,
    searchDebounceMs = 0,
    lazyChipTooltips = true,
    sx,
    variant = "outlined",
    size = "medium",
    fullWidth = true,
    className,
    onBlur: onBlurProp,
    id: idProp,
    ...rest
  } = props;

  const theme = useTheme();
  const autoId = useId();
  const id = idProp ?? autoId;

  // ---- Friendly labels ---------------------------------------------------
  const friendlyLabels = useMemo(
    () =>
      hideFriendlyLabels ? {} : { ...FRIENDLY_LABELS, ...extraFriendlyLabels },
    [hideFriendlyLabels, extraFriendlyLabels],
  );

  // ---- Label index + class set -------------------------------------------
  const labelIndex = useRef<Map<string, string[]>>(new Map());
  const classSet = useRef<Set<string>>(new Set(classList));

  useEffect(() => {
    labelIndex.current = buildLabelIndex(friendlyLabels);
  }, [friendlyLabels]);
  useEffect(() => {
    classSet.current = new Set(classList);
  }, [classList]);

  // ---- Value management --------------------------------------------------
  // Controlled: derive from prop on every render (coerce string|string[] → string[])
  // Uncontrolled: manage internally
  const isControlled = valueProp !== undefined;

  const [internalClasses, setInternalClasses] = useState<string[]>(() =>
    coerceToArray(isControlled ? valueProp : defaultValue),
  );

  // For controlled mode, coerce prop every render.
  // Use a ref-based cache to avoid re-coercing when reference is stable.
  const prevValuePropRef = useRef<unknown>(undefined);
  const coercedValueRef = useRef<string[]>([]);
  const getActiveClasses = (): string[] => {
    if (!isControlled) return internalClasses;
    if (valueProp !== prevValuePropRef.current) {
      coercedValueRef.current = coerceToArray(valueProp);
      prevValuePropRef.current = valueProp;
    }
    return coercedValueRef.current;
  };
  const activeClasses = getActiveClasses();

  // Stable Set for O(1) active checks — only rebuilt when classes actually change
  const activeClassesKey = activeClasses.join("\x00");
  const activeSet = useMemo(
    () => new Set(activeClasses),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [activeClassesKey],
  );

  // ---- UI state ----------------------------------------------------------
  const [inputValue, setInputValue] = useState("");
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const [popperOpen, setPopperOpen] = useState(false);
  const [isFocused, setIsFocused] = useState(false);

  const textBoxRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const popperRef = useRef<HTMLDivElement>(null);
  const debounceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const labelShrunk =
    activeClasses.length > 0 || inputValue.length > 0 || isFocused;

  // ---- Commit ------------------------------------------------------------
  const commitChange = useCallback(
    (next: string[]) => {
      if (!isControlled) setInternalClasses(next);
      onChange?.(next);
    },
    [isControlled, onChange],
  );

  const addClasses = useCallback(
    (raw: string) => {
      const incoming = raw.trim().split(/\s+/).filter(Boolean);
      if (!incoming.length) return;
      const next = mergeClasses(activeClasses, incoming);
      // Only fire if something actually changed
      if (next.join("\x00") !== activeClasses.join("\x00")) commitChange(next);
      setInputValue("");
      setSuggestions([]);
      setPopperOpen(false);
      inputRef.current?.focus();
    },
    [activeClasses, commitChange],
  );

  const removeTag = useCallback(
    (cls: string) => {
      commitChange(activeClasses.filter((c) => c !== cls));
      inputRef.current?.focus();
    },
    [activeClasses, commitChange],
  );

  // ---- Search ------------------------------------------------------------
  const runSearch = useCallback(
    (val: string) => {
      const s = getSuggestions(
        val,
        activeSet,
        classList,
        classSet.current,
        labelIndex.current,
        matchMode,
        maxSuggestions,
      );
      setSuggestions(s);
      setHighlightedIndex(-1);
      setPopperOpen(s.length > 0 && val.length > 0);
    },
    [activeSet, classList, matchMode, maxSuggestions],
  );

  const scheduleSearch = useCallback(
    (val: string) => {
      if (searchDebounceMs <= 0) {
        runSearch(val);
        return;
      }
      if (debounceTimer.current) clearTimeout(debounceTimer.current);
      debounceTimer.current = setTimeout(
        () => runSearch(val),
        searchDebounceMs,
      );
    },
    [runSearch, searchDebounceMs],
  );

  useEffect(
    () => () => {
      if (debounceTimer.current) clearTimeout(debounceTimer.current);
    },
    [],
  );

  // ---- Input handlers ----------------------------------------------------
  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const val = e.target.value;
      if (val.endsWith(" ")) {
        const t = val.trim();
        if (t) addClasses(t);
        return;
      }
      setInputValue(val);
      scheduleSearch(val);
    },
    [addClasses, scheduleSearch],
  );

  const handleKeyDown = useCallback(
    (e: KeyboardEvent<HTMLInputElement>) => {
      if (e.key === "ArrowDown") {
        e.preventDefault();
        setHighlightedIndex((i) => Math.min(i + 1, suggestions.length - 1));
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setHighlightedIndex((i) => Math.max(i - 1, 0));
      } else if (e.key === "Enter") {
        e.preventDefault();
        if (highlightedIndex >= 0) addClasses(suggestions[highlightedIndex]);
        else if (inputValue.trim()) addClasses(inputValue.trim());
      } else if (e.key === "Escape") {
        setPopperOpen(false);
        setSuggestions([]);
      } else if (
        e.key === "Backspace" &&
        inputValue === "" &&
        activeClasses.length > 0
      ) {
        removeTag(activeClasses[activeClasses.length - 1]);
      } else if (e.key === "Tab" && suggestions.length > 0) {
        e.preventDefault();
        addClasses(
          highlightedIndex >= 0
            ? suggestions[highlightedIndex]
            : suggestions[0],
        );
      }
    },
    [
      addClasses,
      removeTag,
      suggestions,
      highlightedIndex,
      inputValue,
      activeClasses,
    ],
  );

  const handleFocus = useCallback(() => {
    setIsFocused(true);
    if (inputValue && suggestions.length > 0) setPopperOpen(true);
  }, [inputValue, suggestions.length]);

  const handleBlur = useCallback(() => {
    setIsFocused(false);
    onBlurProp?.();
  }, [onBlurProp]);
  const handleSurfaceClick = useCallback(() => {
    if (!disabled && !readOnly) inputRef.current?.focus();
  }, [disabled, readOnly]);
  const handlePresetClick = useCallback(
    (classStr: string) => addClasses(classStr),
    [addClasses],
  );

  // Close popper on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (
        textBoxRef.current &&
        !textBoxRef.current.contains(e.target as Node) &&
        popperRef.current &&
        !popperRef.current.contains(e.target as Node)
      )
        setPopperOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  // ---- Styling -----------------------------------------------------------
  const isSmall = size === "small";
  const isFilled = variant === "filled";
  const isStandard = variant === "standard";
  const isOutlined = variant === "outlined";

  const borderColor = useMemo(
    () =>
      error
        ? theme.palette.error.main
        : isFocused
          ? theme.palette.primary.main
          : theme.palette.mode === "dark"
            ? "rgba(255,255,255,0.23)"
            : "rgba(0,0,0,0.23)",
    [error, isFocused, theme],
  );

  const inputMinHeight = isSmall ? 40 : 48;
  const inputPx = isSmall ? 12 : 14;
  const inputPy = isSmall ? 8 : 12;
  const labelTop = labelShrunk ? -9 : isSmall ? 8 : 14;

  // Hidden input value: join with spaces for HTML form/RA compatibility
  const hiddenValue = activeClasses.join(" ");

  return (
    <FormControl
      ref={ref}
      fullWidth={fullWidth}
      error={error}
      required={required}
      disabled={disabled}
      sx={sx}
      className={className}
      variant={variant}
      size={size}
      {...(rest as object)}
    >
      {/* Hidden native input — space-joined for form/RA interop */}
      <input type="hidden" id={id} name={name} value={hiddenValue} />

      <Box sx={{ position: "relative" }}>
        {/* Floating label */}
        {label && (
          <Box
            component="label"
            htmlFor={id}
            sx={{
              position: "absolute",
              left: isOutlined ? 14 : 0,
              top: labelTop,
              ...(labelShrunk && {
                transform: "translateY(-50%) scale(0.75)",
                transformOrigin: "left center",
              }),
              zIndex: 1,
              pointerEvents: "none",
              transition:
                "top 150ms cubic-bezier(0,0,0.2,1), transform 150ms cubic-bezier(0,0,0.2,1), color 150ms",
              color: error
                ? theme.palette.error.main
                : isFocused
                  ? theme.palette.primary.main
                  : theme.palette.text.secondary,
              fontSize: "1rem",
              lineHeight: 1,
              userSelect: "none",
              ...(labelShrunk &&
                isOutlined && {
                  backgroundColor: theme.palette.background.paper,
                  px: 0.5,
                  mx: -0.5,
                }),
            }}
          >
            {label}
            {required && (
              <Box component="span" aria-hidden sx={{ ml: 0.25 }}>
                *
              </Box>
            )}
          </Box>
        )}

        {/* Input surface */}
        <Box
          ref={textBoxRef}
          sx={{
            display: "flex",
            alignItems: "center",
            minHeight: inputMinHeight,
            px: `${inputPx}px`,
            py: `${inputPy}px`,
            cursor: disabled ? "not-allowed" : "text",
            borderRadius: isStandard ? 0 : "4px",
            position: "relative",
            backgroundColor: isFilled
              ? theme.palette.mode === "dark"
                ? "rgba(255,255,255,0.09)"
                : "rgba(0,0,0,0.06)"
              : "transparent",
            ...(isStandard && {
              borderBottom: `${isFocused ? 2 : 1}px solid ${borderColor}`,
            }),
            opacity: disabled ? 0.5 : 1,
            "&:hover fieldset": {
              borderColor:
                !disabled && !isFocused
                  ? theme.palette.mode === "dark"
                    ? "#fff"
                    : "rgba(0,0,0,0.87)"
                  : undefined,
            },
          }}
          onClick={handleSurfaceClick}
        >
          {isOutlined && label && (
            <OutlinedNotch
              label={label}
              shrunk={labelShrunk}
              focused={isFocused}
              error={error}
              required={required}
              borderColor={borderColor}
            />
          )}
          {isOutlined && !label && (
            <fieldset
              aria-hidden="true"
              style={{
                position: "absolute",
                inset: "-5px 0 0",
                margin: 0,
                padding: "0 8px",
                pointerEvents: "none",
                borderRadius: 4,
                border: `${isFocused ? 2 : 1}px solid ${borderColor}`,
                transition: "border-color 200ms",
              }}
            >
              <legend
                style={{ float: "unset", width: 0, height: "11px", padding: 0 }}
              />
            </fieldset>
          )}

          <Box
            component="input"
            ref={inputRef}
            value={inputValue}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            onFocus={handleFocus}
            onBlur={handleBlur}
            disabled={disabled}
            readOnly={readOnly}
            placeholder={labelShrunk || !label ? placeholder : ""}
            autoComplete="off"
            autoCorrect="off"
            autoCapitalize="off"
            spellCheck={false}
            sx={{
              flex: 1,
              border: "none",
              outline: "none",
              background: "transparent",
              fontFamily: "monospace",
              fontSize: isSmall ? "0.8rem" : "0.875rem",
              color: "text.primary",
              p: 0,
              lineHeight: 1.5,
              width: "100%",
              position: "relative",
              zIndex: 1,
              cursor: disabled ? "not-allowed" : "text",
              "&::placeholder": { color: "text.disabled", opacity: 1 },
            }}
          />
        </Box>
      </Box>

      {/* Active chips below the input */}
      {activeClasses.length > 0 && (
        <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5, mt: 0.75 }}>
          {activeClasses.map((cls) => (
            <ActiveClassChip
              key={cls}
              cls={cls}
              friendly={friendlyLabels[cls]}
              isSmall={isSmall}
              disabled={disabled}
              readOnly={readOnly}
              lazyTooltip={lazyChipTooltips}
              onRemove={removeTag}
            />
          ))}
        </Box>
      )}

      {/* Autocomplete dropdown */}
      <Popper
        open={popperOpen}
        anchorEl={textBoxRef.current}
        placement="bottom-start"
        style={{ zIndex: theme.zIndex.modal }}
        ref={popperRef}
        modifiers={[{ name: "offset", options: { offset: [0, 4] } }]}
      >
        <Paper
          elevation={4}
          sx={{
            width: textBoxRef.current?.offsetWidth ?? 300,
            maxHeight: 280,
            overflowY: "auto",
            py: 0.5,
          }}
        >
          <MenuList dense disablePadding>
            {suggestions.map((cls, i) => {
              const friendly = friendlyLabels[cls];
              return (
                <MenuItem
                  key={cls}
                  selected={i === highlightedIndex}
                  onMouseEnter={() => setHighlightedIndex(i)}
                  onMouseDown={(e) => {
                    e.preventDefault();
                    addClasses(cls);
                  }}
                  sx={{
                    display: "flex",
                    alignItems: "baseline",
                    gap: 1.5,
                    py: friendly ? 0.75 : 0.5,
                    px: 1.5,
                  }}
                >
                  <Typography
                    component="span"
                    sx={{
                      fontFamily: "monospace",
                      fontSize: "0.8rem",
                      flexShrink: 0,
                    }}
                  >
                    {cls}
                  </Typography>
                  {friendly && (
                    <Typography
                      component="span"
                      sx={{
                        fontSize: "0.72rem",
                        color: "text.secondary",
                        fontStyle: "italic",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                        minWidth: 0,
                      }}
                    >
                      {friendly}
                    </Typography>
                  )}
                </MenuItem>
              );
            })}
          </MenuList>
        </Paper>
      </Popper>

      {/* Presets panel */}
      {presets && (
        <PresetsPanel
          presets={presets}
          activeSet={activeSet}
          onPresetClick={handlePresetClick}
          sx={{ mt: activeClasses.length > 0 ? 0.5 : 0.75 }}
        />
      )}

      {helperText && (
        <FormHelperText error={error}>{helperText}</FormHelperText>
      )}
    </FormControl>
  );
});

TailwindClassInput.displayName = "TailwindClassInput";
export default TailwindClassInput;

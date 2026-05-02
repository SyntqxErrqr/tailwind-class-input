/**
 * React Admin entrypoint for tailwind-class-input.
 *
 * Import from 'tailwind-class-input/react-admin' to get components that are
 * already wired into React Admin's form context via useInput.
 *
 * VALUE FORMAT
 * ────────────
 * Values are stored as string[] — an array of Tailwind class strings.
 *   e.g. ['flex', 'items-center', 'gap-4']
 *
 * If your DB column is a plain string (e.g. Postgres text), pass:
 *   storageFormat="string"
 * and the adapter converts both ways automatically.
 *
 * USAGE
 * ─────
 * import { TailwindClassInput } from 'tailwind-class-input/react-admin';
 *
 * <TailwindClassInput source="classes" label="Tailwind Classes" />
 * <TailwindClassInput source="classes" presets={true} storageFormat="string" />
 */
import React, { useRef, useCallback } from "react";
// useInput is imported directly — react-admin is a peer dep of this entrypoint.
// If your bundler complains, ensure 'react-admin' is in your dependencies.
import { useInput } from "react-admin";
import {
  TailwindClassInput as TailwindClassInputBase,
  TailwindClassInputProps as TailwindClassInputBaseProps,
  coerceToArray,
} from "./TailwindClassInput";

// ---------------------------------------------------------------------------
// Props — extends base props, adds RA-specific ones
// ---------------------------------------------------------------------------

export interface TailwindClassInputProps extends Omit<
  TailwindClassInputBaseProps,
  // Managed internally by useInput — not passed by the consumer
  "value" | "onChange" | "name" | "error" | "required"
> {
  /** React Admin record field name — the key in your record / dataProvider. */
  source: string;

  /**
   * How the value is stored in your database / React Admin record.
   * - 'array'  (default) — string[], e.g. ["flex", "p-4"]
   * - 'string'           — space-separated string, e.g. "flex p-4"
   */
  storageFormat?: "array" | "string";

  /** RA validation rules (same as validate on any RA Input). */
  validate?: unknown;

  /**
   * Default value when the record field is absent.
   * Accepts either format regardless of storageFormat.
   */
  defaultValue?: string[] | string;

  /** Helper text below the input. Validation errors take priority. */
  helperText?: string;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

/**
 * TailwindClassInput wired for React Admin.
 *
 * Drop-in replacement for the base TailwindClassInput inside any RA form.
 * Reads from and writes to the form context via useInput / react-hook-form.
 */
export function TailwindClassInput(props: TailwindClassInputProps) {
  const {
    source,
    storageFormat = "array",
    validate,
    defaultValue,
    label,
    helperText,
    ...rest
  } = props;

  // Keep storageFormat accessible in callbacks without making it a dep
  const storageFormatRef = useRef(storageFormat);
  storageFormatRef.current = storageFormat;

  const {
    field,
    fieldState: { invalid, error },
    isRequired,
    id,
  } = useInput({
    source,
    validate,
    // defaultValue must be normalized to the stored format.
    // coerceToArray handles string | string[] | undefined.
    defaultValue:
      defaultValue !== undefined
        ? storageFormat === "string"
          ? coerceToArray(defaultValue).join(" ")
          : coerceToArray(defaultValue)
        : storageFormat === "string"
          ? ""
          : [],
  });

  // field.value is whatever is in the RHF store — could be string, string[],
  // undefined (first render before defaultValue is applied), or null.
  // Coerce to string[] for the base component regardless.
  const currentValue = coerceToArray(field.value);

  const handleChange = useCallback(
    (newClasses: string[]) => {
      const stored: string[] | string =
        storageFormatRef.current === "string"
          ? newClasses.join(" ")
          : newClasses;
      // Call field.onChange with the raw value — this is how RHF custom inputs work.
      // Do NOT wrap in a synthetic event; RHF Controller accepts raw values directly.
      field.onChange(stored);
    },
    [field],
  );

  const handleBlur = useCallback(() => {
    field.onBlur();
  }, [field]);

  return (
    <TailwindClassInputBase
      {...rest}
      id={id}
      name={field.name}
      value={currentValue}
      onChange={handleChange}
      onBlur={handleBlur}
      label={label ?? source}
      error={invalid}
      helperText={invalid && error?.message ? error.message : helperText}
      required={isRequired}
    />
  );
}

TailwindClassInput.displayName = "TailwindClassInput";

// ---------------------------------------------------------------------------
// Also export the factory for anyone who wants to avoid the direct RA import
// (e.g. library authors who don't want react-admin in their own peer deps)
// ---------------------------------------------------------------------------

type RHFField = {
  name: string;
  value: unknown;
  onChange: (...args: unknown[]) => void;
  onBlur: () => void;
  ref: React.Ref<unknown>;
};
type UseInputReturn = {
  field: RHFField;
  fieldState: { invalid: boolean; error?: { message?: string } };
  formState: { isSubmitting: boolean };
  id: string;
  isRequired: boolean;
};
type UseInputOptions = {
  source: string;
  defaultValue?: unknown;
  validate?: unknown;
  [key: string]: unknown;
};
type UseInputFn = (opts: UseInputOptions) => UseInputReturn;

export interface TailwindClassFieldProps extends Omit<
  TailwindClassInputProps,
  "source"
> {
  source: string;
}

export function createTailwindClassField(useInputFn: UseInputFn) {
  function TailwindClassField(props: TailwindClassFieldProps) {
    const {
      source,
      storageFormat = "array",
      validate,
      defaultValue,
      label,
      helperText,
      ...rest
    } = props;

    const storageFormatRef = useRef(storageFormat);
    storageFormatRef.current = storageFormat;

    const {
      field,
      fieldState: { invalid, error },
      isRequired,
      id,
    } = useInputFn({
      source,
      validate,
      defaultValue:
        defaultValue !== undefined
          ? storageFormat === "string"
            ? coerceToArray(defaultValue).join(" ")
            : coerceToArray(defaultValue)
          : storageFormat === "string"
            ? ""
            : [],
    });

    const currentValue = coerceToArray(field.value);

    const handleChange = useCallback(
      (newClasses: string[]) => {
        const stored: string[] | string =
          storageFormatRef.current === "string"
            ? newClasses.join(" ")
            : newClasses;
        field.onChange(stored);
      },
      [field],
    );

    const handleBlur = useCallback(() => field.onBlur(), [field]);

    return (
      <TailwindClassInputBase
        {...rest}
        id={id}
        name={field.name}
        value={currentValue}
        onChange={handleChange}
        onBlur={handleBlur}
        label={label ?? source}
        error={invalid}
        helperText={invalid && error?.message ? error.message : helperText}
        required={isRequired}
      />
    );
  }

  TailwindClassField.displayName = "TailwindClassField";
  return TailwindClassField;
}

// Re-export base for convenience
export { TailwindClassInputBase as TailwindClassInputBase };
export type { TailwindClassInputBaseProps };

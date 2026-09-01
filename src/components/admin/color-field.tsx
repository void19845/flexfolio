"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { isValidHex } from "@/lib/palette";

/** Swatch + hex text input, kept in sync. The swatch (native color picker)
 *  always yields a valid 6-digit hex; the paired text input is free-form
 *  so someone can paste a value, hence the inline warning below it. */
export function ColorField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (hex: string) => void;
}) {
  const valid = isValidHex(value);

  return (
    <div className="flex flex-col gap-1.5">
      <Label>{label}</Label>
      <div className="flex items-center gap-2">
        <input
          type="color"
          value={valid ? value : "#000000"}
          onChange={(e) => onChange(e.target.value)}
          aria-label={`${label} — sélecteur`}
          className="h-10 w-10 shrink-0 cursor-pointer border border-input bg-transparent p-0.5"
        />
        <Input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="#000000"
          spellCheck={false}
          className="max-w-[140px] font-mono uppercase"
        />
      </div>
      {!valid && <p className="text-xs text-destructive">Format attendu : #rrggbb</p>}
    </div>
  );
}

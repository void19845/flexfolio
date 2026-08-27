"use client";

import { PlusIcon, Trash2Icon, ChevronUpIcon, ChevronDownIcon } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import type { CVEntry } from "@/lib/types";

/** Add/remove/reorder editor for a list of {period, org, role} CV entries.
 *  Shared by the "Expériences" and "Formation" sections of the settings
 *  form — same shape, same editing needs. */
export function CVEntryList({
  entries,
  onChange,
  addLabel,
}: {
  entries: CVEntry[];
  onChange: (entries: CVEntry[]) => void;
  addLabel: string;
}) {
  function update(index: number, patch: Partial<CVEntry>) {
    onChange(entries.map((entry, i) => (i === index ? { ...entry, ...patch } : entry)));
  }

  function remove(index: number) {
    onChange(entries.filter((_, i) => i !== index));
  }

  function move(index: number, direction: -1 | 1) {
    const target = index + direction;
    if (target < 0 || target >= entries.length) return;
    const next = [...entries];
    [next[index], next[target]] = [next[target], next[index]];
    onChange(next);
  }

  function add() {
    onChange([...entries, { period: "", org: "", role: "" }]);
  }

  return (
    <div className="flex flex-col gap-3">
      {entries.map((entry, index) => (
        <div
          key={index}
          className="flex flex-col gap-2 border border-border p-3 sm:flex-row sm:items-start"
        >
          <div className="grid flex-1 gap-2 sm:grid-cols-3">
            <Input
              placeholder="Période (ex. 2023 — Aujourd'hui)"
              value={entry.period}
              onChange={(e) => update(index, { period: e.target.value })}
              aria-label="Période"
            />
            <Input
              placeholder="Organisation"
              value={entry.org}
              onChange={(e) => update(index, { org: e.target.value })}
              aria-label="Organisation"
            />
            <Input
              placeholder="Rôle"
              value={entry.role}
              onChange={(e) => update(index, { role: e.target.value })}
              aria-label="Rôle"
            />
          </div>
          <div className="flex shrink-0 gap-1">
            <Button
              type="button"
              variant="outline"
              size="icon"
              onClick={() => move(index, -1)}
              disabled={index === 0}
              aria-label="Monter"
            >
              <ChevronUpIcon className="h-4 w-4" />
            </Button>
            <Button
              type="button"
              variant="outline"
              size="icon"
              onClick={() => move(index, 1)}
              disabled={index === entries.length - 1}
              aria-label="Descendre"
            >
              <ChevronDownIcon className="h-4 w-4" />
            </Button>
            <Button
              type="button"
              variant="outline"
              size="icon"
              onClick={() => remove(index)}
              aria-label="Supprimer cette ligne"
            >
              <Trash2Icon className="h-4 w-4" />
            </Button>
          </div>
        </div>
      ))}
      <Button type="button" variant="outline" size="sm" className="w-fit gap-1.5" onClick={add}>
        <PlusIcon className="h-4 w-4" />
        {addLabel}
      </Button>
    </div>
  );
}

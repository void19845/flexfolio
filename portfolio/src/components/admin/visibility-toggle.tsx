"use client";

import { useTransition } from "react";
import { toast } from "sonner";
import { toggleVisibility } from "@/actions/projects";
import { Switch } from "@/components/ui/switch";

export function VisibilityToggle({ id, isVisible }: { id: string; isVisible: boolean }) {
  const [pending, startTransition] = useTransition();

  return (
    <Switch
      checked={isVisible}
      disabled={pending}
      onCheckedChange={(checked) =>
        startTransition(async () => {
          const { error } = await toggleVisibility(id, checked);
          if (error) toast.error(error);
        })
      }
    />
  );
}

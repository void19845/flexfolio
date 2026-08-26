import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { ProjectsTable } from "@/components/admin/projects-table";
import { Button } from "@/components/ui/button";
import type { ProjectWithImages } from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function AdminDashboardPage() {
  const supabase = await createClient();
  const { data: projects } = await supabase
    .from("projects")
    .select("*, project_images(*)")
    .order("created_at", { ascending: true })
    .order("display_order", { ascending: true });

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="font-serif text-2xl text-brand-ink">Projets</h1>
        <Button asChild>
          <Link href="/admin/projets/nouveau">Nouveau projet</Link>
        </Button>
      </div>
      <ProjectsTable projects={(projects as ProjectWithImages[] | null) ?? []} />
    </div>
  );
}

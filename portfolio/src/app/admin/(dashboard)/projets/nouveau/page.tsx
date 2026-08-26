import { ProjectForm } from "@/components/admin/project-form";

export default function NewProjectPage() {
  return (
    <div className="flex flex-col gap-6">
      <h1 className="font-serif text-2xl text-brand-ink">Nouveau projet</h1>
      <ProjectForm />
    </div>
  );
}

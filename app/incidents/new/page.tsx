import { AppShell } from "@/app/components/app-shell";
import { ProgramCreationForm } from "./program-creation-form";

export default function NewIncidentPage() {
  return (
    <AppShell active="Programs">
      <div className="space-y-6">
        <header>
          <p className="text-sm font-semibold text-[#244a9b]">
            Program management
          </p>
          <h1 className="mt-2 text-3xl font-semibold text-zinc-950">
            Create Program
          </h1>
          <p className="mt-3 max-w-3xl text-base leading-7 text-zinc-600">
            Capture the operating picture, location, master budget, and first fund
            request for a new response program.
          </p>
        </header>

        <ProgramCreationForm />
      </div>
    </AppShell>
  );
}

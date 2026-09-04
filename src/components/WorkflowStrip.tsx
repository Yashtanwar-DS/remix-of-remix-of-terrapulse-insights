import {
  Satellite,
  MapPinned,
  BrainCircuit,
  History,
  Gauge,
  Layers,
  ShieldCheck,
  ChevronRight,
} from "lucide-react";

const STEPS = [
  { label: "Thermal Hotspot", icon: Satellite },
  { label: "Context Analysis", icon: MapPinned },
  { label: "AI Classification", icon: BrainCircuit },
  { label: "Persistence", icon: History },
  { label: "Risk Score", icon: Gauge },
  { label: "GIS Visualization", icon: Layers },
  { label: "Alert / Verification", icon: ShieldCheck },
];

export function WorkflowStrip() {
  return (
    <div className="rounded-lg border border-border bg-card p-3 shadow-xs">
      <div className="flex flex-wrap items-center gap-y-2">
        {STEPS.map((step, i) => (
          <div key={step.label} className="flex items-center">
            <div className="flex items-center gap-2 rounded-md bg-secondary px-2.5 py-1.5">
              <step.icon className="h-4 w-4 text-primary" />
              <span className="text-xs font-medium text-secondary-foreground">{step.label}</span>
            </div>
            {i < STEPS.length - 1 ? (
              <ChevronRight className="mx-1 h-4 w-4 shrink-0 text-muted-foreground" />
            ) : null}
          </div>
        ))}
      </div>
    </div>
  );
}

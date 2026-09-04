import { Search, RotateCcw, SlidersHorizontal } from "lucide-react";
import type { FacilityType, PersistenceBand, ProbableClass, RiskLevel, VerificationStatus } from "@/types";
import { ALL_CLASSES, STATUS_LABELS } from "@/utils/labels";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import type { EventFilters } from "@/types";

const RISKS: RiskLevel[] = ["HIGH", "MEDIUM", "LOW"];
const PERSISTENCE: PersistenceBand[] = ["Single detection", "Repeated", "Persistent"];
const FACILITY_TYPES: FacilityType[] = ["Refinery", "Power Plant", "Factory", "Mining", "Oil & Gas", "Industrial Area", "Other"];
const VERIFICATION: VerificationStatus[] = ["REQUIRES_VERIFICATION", "HUMAN_VERIFIED", "NEEDS_REVIEW", "DISMISSED"];

function Chip({
  active,
  onClick,
  children,
  tone = "default",
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
  tone?: "default" | "high" | "medium" | "low";
}) {
  const tones: Record<string, string> = {
    default: "border-primary bg-primary/10 text-primary",
    high: "border-risk-high/50 bg-risk-high/10 text-risk-high",
    medium: "border-risk-medium/50 bg-risk-medium/10 text-risk-medium",
    low: "border-risk-low/50 bg-risk-low/10 text-risk-low",
  };
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "rounded-md border px-2.5 py-1 text-xs font-medium transition-colors",
        active ? tones[tone] : "border-border bg-background text-muted-foreground hover:bg-accent",
      )}
    >
      {children}
    </button>
  );
}

export function FiltersPanel({
  filters,
  setFilters,
  resetFilters,
  resultCount,
}: {
  filters: EventFilters;
  setFilters: (f: Partial<EventFilters>) => void;
  resetFilters: () => void;
  resultCount: number;
}) {
  const toggle = <T,>(key: keyof EventFilters, value: T) => {
    const current = filters[key] as T[];
    const next = current.includes(value) ? current.filter((v) => v !== value) : [...current, value];
    setFilters({ [key]: next } as Partial<EventFilters>);
  };

  return (
    <div className="rounded-lg border border-border bg-card p-4 shadow-xs">
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 text-sm font-medium text-foreground">
          <SlidersHorizontal className="h-4 w-4 text-primary" />
          Filters
        </div>
        <div className="flex items-center gap-3">
          <span className="text-xs text-muted-foreground">{resultCount} match</span>
          <Button size="sm" variant="ghost" onClick={resetFilters} className="h-7 gap-1.5 text-xs">
            <RotateCcw className="h-3.5 w-3.5" /> Reset
          </Button>
        </div>
      </div>

      <div className="relative mt-3">
        <Search className="pointer-events-none absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Search event ID, facility, region, class…"
          value={filters.search}
          onChange={(e) => setFilters({ search: e.target.value })}
          className="pl-8"
        />
      </div>

      <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        <div className="space-y-1.5">
          <p className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">Risk</p>
          <div className="flex flex-wrap gap-1.5">
            {RISKS.map((r) => (
              <Chip
                key={r}
                tone={r === "HIGH" ? "high" : r === "MEDIUM" ? "medium" : "low"}
                active={filters.risk.includes(r)}
                onClick={() => toggle("risk", r)}
              >
                {r}
              </Chip>
            ))}
          </div>
        </div>

        <div className="space-y-1.5">
          <p className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">Class</p>
          <div className="flex flex-wrap gap-1.5">
            {ALL_CLASSES.map((c) => (
              <Chip key={c} active={filters.classes.includes(c)} onClick={() => toggle("classes", c)}>
                {c.replace(/_/g, " ").toLowerCase()}
              </Chip>
            ))}
          </div>
        </div>

        <div className="space-y-1.5">
          <p className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">Persistence</p>
          <div className="flex flex-wrap gap-1.5">
            {PERSISTENCE.map((p) => (
              <Chip key={p} active={filters.persistence.includes(p)} onClick={() => toggle("persistence", p)}>
                {p}
              </Chip>
            ))}
          </div>
        </div>

        <div className="space-y-1.5">
          <p className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">Verification</p>
          <div className="flex flex-wrap gap-1.5">
            {VERIFICATION.map((v) => (
              <Chip key={v} active={filters.verification.includes(v)} onClick={() => toggle("verification", v)}>
                {STATUS_LABELS[v]}
              </Chip>
            ))}
          </div>
        </div>

        <div className="space-y-1.5">
          <p className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">Facility type</p>
          <div className="flex flex-wrap gap-1.5">
            {FACILITY_TYPES.map((f) => (
              <Chip key={f} active={filters.facilityTypes.includes(f)} onClick={() => toggle("facilityTypes", f)}>
                {f}
              </Chip>
            ))}
          </div>
        </div>

        <div className="space-y-1.5">
          <p className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">Detected range</p>
          <div className="flex items-center gap-2">
            <Input type="date" value={filters.from} onChange={(e) => setFilters({ from: e.target.value })} className="h-8 text-xs" />
            <span className="text-xs text-muted-foreground">→</span>
            <Input type="date" value={filters.to} onChange={(e) => setFilters({ to: e.target.value })} className="h-8 text-xs" />
          </div>
        </div>
      </div>
    </div>
  );
}

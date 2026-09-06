import { createFileRoute, Link } from "@tanstack/react-router";
import { BrainCircuit } from "lucide-react";
import { useTerraPulse } from "@/hooks/useTerraPulse";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ClassBadge, ConfidenceBadge, RiskBadge } from "@/components/badges";
import { DataStatusBar } from "@/components/DataStatusBar";
import { CLASS_LABELS } from "@/utils/labels";
import { prioritise } from "@/services/riskService";
import type { ProbableClass } from "@/types";

export const Route = createFileRoute("/classification")({
  head: () => ({
    meta: [
      { title: "AI Classification — TerraPulse Probable Source Analysis" },
      {
        name: "description",
        content:
          "Prototype AI classification of thermal anomalies into probable sources: industrial fire, gas flare, persistent thermal source, agricultural burning, wildfire or unclassified.",
      },
      { property: "og:title", content: "AI Classification — TerraPulse" },
      {
        property: "og:description",
        content: "Prototype probable-source classification of satellite thermal anomalies.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: ClassificationPage,
});

const CLASSES: ProbableClass[] = [
  "INDUSTRIAL_FIRE",
  "GAS_FLARE",
  "PERSISTENT_INDUSTRIAL_HEAT",
  "AGRICULTURAL_BURNING",
  "WILDFIRE",
  "UNCLASSIFIED",
];

function ClassificationPage() {
  const { events } = useTerraPulse();
  const top = prioritise(events).slice(0, 10);

  return (
    <div className="space-y-5">
      <DataStatusBar />

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-sm">
            <span className="rounded-md bg-primary/10 p-1.5">
              <BrainCircuit className="h-4 w-4 text-primary" />
            </span>
            Prototype AI Classification
          </CardTitle>
          <CardDescription>
            Deterministic, feature-based scoring over thermal intensity, geographic context and
            persistence. Results are probable source classifications, never confirmed fires.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid grid-cols-2 gap-3 md:grid-cols-3">
          {CLASSES.map((c) => {
            const count = events.filter((e) => e.probableClass === c).length;
            return (
              <div key={c} className="rounded-lg border border-border bg-card p-3 shadow-xs">
                <p className="text-xs text-muted-foreground">{CLASS_LABELS[c]}</p>
                <p className="mt-1 text-2xl font-semibold tabular-nums text-foreground">{count}</p>
              </div>
            );
          })}
        </CardContent>
      </Card>

      <section className="space-y-3">
        <h2 className="text-sm font-semibold text-foreground">Highest-priority classifications</h2>
        <div className="grid gap-3 md:grid-cols-2">
          {top.map((e) => (
            <Link
              key={e.id}
              to="/events/$id"
              params={{ id: e.id }}
              className="rounded-lg border border-border bg-card p-3 shadow-xs transition-colors hover:border-primary/40"
            >
              <div className="flex items-center justify-between gap-2">
                <span className="font-mono text-sm font-semibold text-foreground">{e.id}</span>
                <RiskBadge score={e.riskScore} />
              </div>
              <div className="mt-2 flex flex-wrap items-center gap-2">
                <ClassBadge probableClass={e.probableClass} />
                <ConfidenceBadge value={e.confidence} />
              </div>
              <div className="mt-3 space-y-1.5">
                {e.probabilities.slice(0, 3).map((p) => (
                  <div key={p.probableClass}>
                    <div className="flex items-center justify-between text-[11px] text-muted-foreground">
                      <span>{CLASS_LABELS[p.probableClass]}</span>
                      <span className="tabular-nums">{Math.round(p.probability * 100)}%</span>
                    </div>
                    <div className="mt-0.5 h-1.5 w-full overflow-hidden rounded-full bg-secondary">
                      <div
                        className="h-full rounded-full bg-primary"
                        style={{ width: `${p.probability * 100}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}

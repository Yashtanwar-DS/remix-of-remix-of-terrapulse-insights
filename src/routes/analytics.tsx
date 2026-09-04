import { createFileRoute } from "@tanstack/react-router";
import { useMemo } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
  CartesianGrid,
  AreaChart,
  Area,
} from "recharts";
import { useTerraPulse } from "@/hooks/useTerraPulse";
import { CLASS_LABELS, CLASS_COLOR, RISK_COLOR } from "@/utils/labels";
import type { ProbableClass, RiskLevel } from "@/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export const Route = createFileRoute("/analytics")({
  head: () => ({
    meta: [
      { title: "Analytics — TerraPulse" },
      { name: "description", content: "Aggregate breakdown of thermal detections by probable class, region, risk level and detection trend over the observation window." },
      { property: "og:title", content: "Analytics — TerraPulse" },
      { property: "og:description", content: "Aggregate breakdown of thermal detections by class, region and risk level." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: AnalyticsPage,
});

function AnalyticsPage() {
  const { events } = useTerraPulse();

  const byClass = useMemo(() => {
    const counts: Record<ProbableClass, number> = {
      INDUSTRIAL_FIRE: 0,
      GAS_FLARE: 0,
      PERSISTENT_INDUSTRIAL_HEAT: 0,
      AGRICULTURAL_BURNING: 0,
      WILDFIRE: 0,
      UNCLASSIFIED: 0,
    };
    for (const e of events) counts[e.probableClass]++;
    return (Object.keys(counts) as ProbableClass[]).map((k) => ({
      label: CLASS_LABELS[k].replace("Possible ", "").replace("Persistent Thermal Source", "Persistent Heat"),
      value: counts[k],
      color: CLASS_COLOR[k],
    }));
  }, [events]);

  const byRegion = useMemo(() => {
    const map = new Map<string, number>();
    for (const e of events) map.set(e.region, (map.get(e.region) ?? 0) + 1);
    return [...map.entries()]
      .map(([label, value]) => ({ label, value }))
      .sort((a, b) => b.value - a.value);
  }, [events]);

  const byRisk = useMemo(() => {
    const counts: Record<RiskLevel, number> = { HIGH: 0, MEDIUM: 0, LOW: 0 };
    for (const e of events) {
      const level = e.riskScore >= 80 ? "HIGH" : e.riskScore >= 50 ? "MEDIUM" : "LOW";
      counts[level]++;
    }
    return (["HIGH", "MEDIUM", "LOW"] as RiskLevel[]).map((k) => ({
      label: k,
      value: counts[k],
      color: RISK_COLOR[k],
    }));
  }, [events]);

  const trend = useMemo(() => {
    const map = new Map<string, number>();
    for (const e of events) {
      const day = e.timestamp.slice(0, 10);
      map.set(day, (map.get(day) ?? 0) + 1);
    }
    return [...map.entries()].sort(([a], [b]) => a.localeCompare(b)).map(([day, value]) => ({ day, value }));
  }, [events]);

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-lg font-semibold text-foreground">Detection analytics</h2>
        <p className="text-sm text-muted-foreground">{events.length} events across the 7-day window.</p>
      </div>

      <div className="grid gap-5 lg:grid-cols-2">
        <Card>
          <CardHeader><CardTitle className="text-sm">Detections by probable class</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={byClass} margin={{ left: -16, right: 8, top: 8 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                <XAxis dataKey="label" tick={{ fontSize: 10 }} interval={0} angle={-20} textAnchor="end" height={56} stroke="var(--muted-foreground)" />
                <YAxis allowDecimals={false} tick={{ fontSize: 11 }} stroke="var(--muted-foreground)" />
                <Tooltip contentStyle={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 8, fontSize: 12 }} />
                <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                  {byClass.map((d, i) => <Cell key={i} fill={d.color} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="text-sm">Risk distribution</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={260}>
              <PieChart>
                <Pie data={byRisk} dataKey="value" nameKey="label" innerRadius={50} outerRadius={90} paddingAngle={2}>
                  {byRisk.map((d, i) => <Cell key={i} fill={d.color} />)}
                </Pie>
                <Legend wrapperStyle={{ fontSize: 11 }} />
                <Tooltip contentStyle={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 8, fontSize: 12 }} />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="text-sm">Detections by region</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={byRegion} layout="vertical" margin={{ left: 20, right: 16 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" horizontal={false} />
                <XAxis type="number" allowDecimals={false} tick={{ fontSize: 11 }} stroke="var(--muted-foreground)" />
                <YAxis type="category" dataKey="label" tick={{ fontSize: 11 }} width={90} stroke="var(--muted-foreground)" />
                <Tooltip contentStyle={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 8, fontSize: 12 }} />
                <Bar dataKey="value" fill="var(--chart-1)" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="text-sm">Daily detection trend</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={260}>
              <AreaChart data={trend} margin={{ left: -16, right: 8, top: 8 }}>
                <defs>
                  <linearGradient id="trendFill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="var(--chart-1)" stopOpacity={0.5} />
                    <stop offset="100%" stopColor="var(--chart-1)" stopOpacity={0.05} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                <XAxis dataKey="day" tick={{ fontSize: 10 }} stroke="var(--muted-foreground)" />
                <YAxis allowDecimals={false} tick={{ fontSize: 11 }} stroke="var(--muted-foreground)" />
                <Tooltip contentStyle={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 8, fontSize: 12 }} />
                <Area type="monotone" dataKey="value" stroke="var(--chart-1)" strokeWidth={2} fill="url(#trendFill)" />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

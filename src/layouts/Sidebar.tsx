import { Link } from "@tanstack/react-router";
import {
  LayoutDashboard,
  Map as MapIcon,
  ListChecks,
  BrainCircuit,
  History,
  Gauge,
  BellRing,
  LineChart,
  Database,
  Radar,
} from "lucide-react";

export const NAV = [
  { to: "/", label: "Dashboard", icon: LayoutDashboard },
  { to: "/map", label: "Live Thermal Map", icon: MapIcon },
  { to: "/events", label: "Event Monitoring", icon: ListChecks },
  { to: "/classification", label: "AI Classification", icon: BrainCircuit },
  { to: "/persistence", label: "Persistence Analysis", icon: History },
  { to: "/analytics", label: "Risk Analytics", icon: Gauge },
  { to: "/alerts", label: "Alerts & Notifications", icon: BellRing },
  { to: "/trends", label: "Historical Trends", icon: LineChart },
  { to: "/data-sources", label: "Data Sources", icon: Database },
] as const;

export function SidebarNav({ onNavigate }: { onNavigate?: () => void }) {
  return (
    <nav className="flex flex-col gap-1.5 p-3">
      {NAV.map((item) => (
        <Link
          key={item.to}
          to={item.to}
          onClick={onNavigate}
          activeOptions={{ exact: item.to === "/" }}
          activeProps={{
            className:
              "border-sidebar-primary/35 bg-sidebar-accent text-sidebar-accent-foreground shadow-sm",
          }}
          inactiveProps={{ className: "border-sidebar-border" }}
          className="group flex items-center gap-2.5 rounded-lg border bg-card px-3 py-2 text-[13px] font-medium text-sidebar-foreground shadow-xs transition-all hover:border-sidebar-primary/30 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground hover:shadow-sm"
        >
          <item.icon className="h-4 w-4 shrink-0 opacity-80" />
          <span className="truncate">{item.label}</span>
        </Link>
      ))}
    </nav>
  );
}

export function DesktopSidebar() {
  return (
    <aside className="hidden w-56 shrink-0 flex-col border-r border-sidebar-border bg-sidebar lg:flex">
      <div className="flex items-center gap-2 border-b border-sidebar-border px-4 py-4">
        <span className="rounded-md bg-sidebar-primary/15 p-2">
          <Radar className="h-5 w-5 text-sidebar-primary" />
        </span>
        <div>
          <p className="text-sm font-semibold text-sidebar-foreground">TerraPulse</p>
          <p className="text-[11px] text-sidebar-foreground/60">Thermal Risk Detection</p>
        </div>
      </div>
      <SidebarNav />
      <div className="mt-auto border-t border-sidebar-border p-3">
        <p className="text-[11px] leading-relaxed text-sidebar-foreground/60">
          Prototype AI classification. Results are probabilistic and require human verification.
        </p>
      </div>
    </aside>
  );
}

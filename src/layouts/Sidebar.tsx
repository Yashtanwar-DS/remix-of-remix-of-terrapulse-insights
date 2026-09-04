import { Link } from "@tanstack/react-router";
import {
  LayoutDashboard,
  Map as MapIcon,
  BarChart3,
  BellRing,
  Database,
  Radar,
} from "lucide-react";

export const NAV = [
  { to: "/", label: "Dashboard", icon: LayoutDashboard },
  { to: "/map", label: "Thermal Events / Live Map", icon: MapIcon },
  { to: "/analytics", label: "Analytics", icon: BarChart3 },
  { to: "/alerts", label: "Alerts", icon: BellRing },
  { to: "/data-sources", label: "Settings / Data Sources", icon: Database },
] as const;

export function SidebarNav({ onNavigate }: { onNavigate?: () => void }) {
  return (
    <nav className="flex flex-col gap-1 p-3">
      {NAV.map((item) => (
        <Link
          key={item.to}
          to={item.to}
          onClick={onNavigate}
          activeOptions={{ exact: item.to === "/" }}
          activeProps={{
            className: "bg-sidebar-accent text-sidebar-accent-foreground",
          }}
          className="flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium text-sidebar-foreground/80 transition-colors hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
        >
          <item.icon className="h-4 w-4 shrink-0" />
          <span className="truncate">{item.label}</span>
        </Link>
      ))}
    </nav>
  );
}

export function DesktopSidebar() {
  return (
    <aside className="hidden w-64 shrink-0 flex-col border-r border-sidebar-border bg-sidebar lg:flex">
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

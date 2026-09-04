import { useState } from "react";
import { Link, useRouterState } from "@tanstack/react-router";
import { Menu, RefreshCw, Radio, AlertTriangle } from "lucide-react";
import { DesktopSidebar, NAV, SidebarNav } from "@/layouts/Sidebar";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { useTerraPulse } from "@/hooks/useTerraPulse";
import { DemoBadge } from "@/components/badges";
import { cn } from "@/lib/utils";

function useActiveTitle() {
  const { pathname } = useRouterState({ select: (s) => s.location });
  const match = NAV.find((n) => (n.to === "/" ? pathname === "/" : pathname.startsWith(n.to)));
  return match?.label ?? "TerraPulse";
}

function TopBar() {
  const { mode, lastUpdated, loading, refresh } = useTerraPulse();
  const title = useActiveTitle();
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-30 flex h-14 items-center gap-3 border-b border-border bg-background/85 px-4 backdrop-blur">
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetTrigger asChild>
          <Button variant="ghost" size="icon" className="lg:hidden" aria-label="Open navigation">
            <Menu className="h-5 w-5" />
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="w-64 bg-sidebar p-0">
          <SheetHeader className="border-b border-sidebar-border px-4 py-4">
            <SheetTitle className="flex items-center gap-2 text-sidebar-foreground">
              <span className="rounded-md bg-sidebar-primary/15 p-1.5">
                <Radio className="h-4 w-4 text-sidebar-primary" />
              </span>
              TerraPulse
            </SheetTitle>
          </SheetHeader>
          <div className="overflow-y-auto p-3">
            <SidebarNav onNavigate={() => setOpen(false)} />
          </div>
        </SheetContent>
      </Sheet>

      <div className="flex min-w-0 flex-1 items-center gap-2">
        <h1 className="truncate text-base font-semibold text-foreground">{title}</h1>
        {mode === "DEMO" ? <DemoBadge /> : null}
      </div>

      <div className="hidden items-center gap-2 text-xs text-muted-foreground sm:flex">
        <AlertTriangle className="h-3.5 w-3.5 text-risk-medium" />
        <span>Prototype · human verification required</span>
      </div>

      <div className="hidden text-xs text-muted-foreground md:block">
        {lastUpdated ? `Updated ${new Date(lastUpdated).toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" })}` : "—"}
      </div>

      <Button
        size="sm"
        variant="outline"
        onClick={refresh}
        disabled={loading}
        className="h-8 gap-1.5"
      >
        <RefreshCw className={cn("h-3.5 w-3.5", loading && "animate-spin")} />
        Refresh
      </Button>
    </header>
  );
}

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen bg-background">
      <DesktopSidebar />
      <div className="flex min-w-0 flex-1 flex-col">
        <TopBar />
        <main className="flex-1 overflow-y-auto">
          <div className="mx-auto w-full max-w-[1500px] px-4 py-5 lg:px-6">{children}</div>
        </main>
        <footer className="border-t border-border px-4 py-3 text-center text-[11px] text-muted-foreground">
          TerraPulse prototype — synthetic demo data. Probabilistic classifications require human verification.
          <span className="mx-1.5">·</span>
          <Link to="/" className="underline-offset-2 hover:underline">Dashboard</Link>
        </footer>
      </div>
    </div>
  );
}

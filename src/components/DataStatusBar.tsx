import { RefreshCw, Satellite, MapPin, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { LiveBadge } from "@/components/badges";
import { useTerraPulse } from "@/hooks/useTerraPulse";
import { cn } from "@/lib/utils";

export function DataStatusBar() {
  const { mode, lastUpdated, loading, refresh, notice, sources } = useTerraPulse();
  const live = mode === "LIVE";

  return (
    <div className="flex flex-wrap items-center gap-x-4 gap-y-2 rounded-lg border border-border bg-card px-3 py-2.5 shadow-xs">
      <LiveBadge live={live} />

      <span className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
        <Satellite className="h-3.5 w-3.5" />
        {live ? (sources.length ? sources.join(", ") : "NASA FIRMS") : "Bundled sample dataset"}
      </span>

      <span className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
        <MapPin className="h-3.5 w-3.5" />
        Region: India
      </span>

      <span className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
        <Clock className="h-3.5 w-3.5" />
        {lastUpdated
          ? `Last updated ${new Date(lastUpdated).toLocaleString("en-GB", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" })}`
          : "Loading…"}
      </span>

      {notice ? <span className="text-xs text-risk-medium">{notice}</span> : null}

      <Button
        size="sm"
        variant="outline"
        onClick={refresh}
        disabled={loading}
        className="ml-auto h-8 gap-1.5"
      >
        <RefreshCw className={cn("h-3.5 w-3.5", loading && "animate-spin")} />
        Refresh Live Data
      </Button>
    </div>
  );
}

import { cn } from "@/lib/utils";
import type { ProbableClass, RiskLevel, VerificationStatus } from "@/types";
import { CLASS_LABELS, STATUS_LABELS, riskLevel } from "@/utils/labels";

const base =
  "inline-flex items-center gap-1 rounded-md border px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide";

export function RiskBadge({ score, className }: { score: number; className?: string }) {
  const level: RiskLevel = riskLevel(score);
  const styles: Record<RiskLevel, string> = {
    HIGH: "border-risk-high/30 bg-risk-high/10 text-risk-high",
    MEDIUM: "border-risk-medium/30 bg-risk-medium/10 text-risk-medium",
    LOW: "border-risk-low/30 bg-risk-low/10 text-risk-low",
  };
  return <span className={cn(base, styles[level], className)}>{level} RISK</span>;
}

export function ConfidenceBadge({ value, className }: { value: number; className?: string }) {
  const pct = Math.round(value * 100);
  const tone =
    pct > 80
      ? "border-ok/30 bg-ok/10 text-ok"
      : pct >= 60
        ? "border-risk-medium/30 bg-risk-medium/10 text-risk-medium"
        : "border-neutral/30 bg-neutral/10 text-neutral";
  return <span className={cn(base, tone, className)}>{pct}% confidence</span>;
}

export function StatusBadge({
  status,
  className,
}: {
  status: VerificationStatus;
  className?: string;
}) {
  const tone: Record<VerificationStatus, string> = {
    REQUIRES_VERIFICATION: "border-risk-medium/30 bg-risk-medium/10 text-risk-medium",
    HUMAN_VERIFIED: "border-ok/30 bg-ok/10 text-ok",
    DISMISSED: "border-border bg-muted text-muted-foreground",
    NEEDS_REVIEW: "border-risk-low/30 bg-risk-low/10 text-risk-low",
  };
  return <span className={cn(base, tone[status], className)}>{STATUS_LABELS[status]}</span>;
}

export function ClassBadge({
  probableClass,
  className,
}: {
  probableClass: ProbableClass;
  className?: string;
}) {
  return (
    <span className={cn(base, "border-border bg-secondary text-secondary-foreground", className)}>
      {CLASS_LABELS[probableClass]}
    </span>
  );
}

export function DemoBadge({ className }: { className?: string }) {
  return (
    <span className={cn(base, "border-risk-low/30 bg-risk-low/10 text-risk-low", className)}>
      Sample Data
    </span>
  );
}

export function LiveBadge({ live, className }: { live: boolean; className?: string }) {
  return (
    <span
      className={cn(
        base,
        live
          ? "border-ok/30 bg-ok/10 text-ok"
          : "border-risk-medium/30 bg-risk-medium/10 text-risk-medium",
        className,
      )}
    >
      <span
        className={cn("h-1.5 w-1.5 rounded-full", live ? "bg-ok animate-pulse" : "bg-risk-medium")}
      />
      {live ? "Live — NASA FIRMS" : "FIRMS connection unavailable"}
    </span>
  );
}

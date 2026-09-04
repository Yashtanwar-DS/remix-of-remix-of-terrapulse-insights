import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { buildDemoEvents } from "@/data/events";
import { fetchThermalEvents, firmsMode, type DataMode } from "@/services/firmsService";
import type { EventFilters, ThermalEvent, VerificationStatus } from "@/types";
import { confidenceBand, persistenceBand, riskLevel } from "@/utils/labels";

interface Ctx {
  events: ThermalEvent[];
  mode: DataMode;
  lastUpdated: string;
  loading: boolean;
  refresh: () => void;
  setStatus: (id: string, status: VerificationStatus) => void;
  filters: EventFilters;
  setFilters: (f: Partial<EventFilters>) => void;
  resetFilters: () => void;
  filtered: ThermalEvent[];
}

export const emptyFilters: EventFilters = {
  search: "",
  from: "",
  to: "",
  risk: [],
  classes: [],
  confidence: [],
  persistence: [],
  facilityTypes: [],
  verification: [],
};

const TerraPulseContext = createContext<Ctx | null>(null);

export function TerraPulseProvider({ children }: { children: ReactNode }) {
  const [events, setEvents] = useState<ThermalEvent[]>(() => buildDemoEvents(new Date(0)));
  const [mode, setMode] = useState<DataMode>(firmsMode());
  const [lastUpdated, setLastUpdated] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [filters, setFiltersState] = useState<EventFilters>(emptyFilters);

  const refresh = useCallback(() => {
    setLoading(true);
    void fetchThermalEvents().then((res) => {
      setEvents(res.events);
      setMode(res.mode);
      setLastUpdated(res.fetchedAt);
      setLoading(false);
    });
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const setStatus = useCallback((id: string, status: VerificationStatus) => {
    setEvents((prev) =>
      prev.map((e) =>
        e.id === id
          ? {
              ...e,
              verificationStatus: status,
              auditLog: [
                ...e.auditLog,
                { at: new Date().toISOString(), action: `Status set to ${status}` },
              ],
            }
          : e,
      ),
    );
  }, []);

  const setFilters = useCallback((patch: Partial<EventFilters>) => {
    setFiltersState((prev) => ({ ...prev, ...patch }));
  }, []);
  const resetFilters = useCallback(() => setFiltersState(emptyFilters), []);

  const filtered = useMemo(() => applyFilters(events, filters), [events, filters]);

  const value: Ctx = {
    events,
    mode,
    lastUpdated,
    loading,
    refresh,
    setStatus,
    filters,
    setFilters,
    resetFilters,
    filtered,
  };

  return <TerraPulseContext.Provider value={value}>{children}</TerraPulseContext.Provider>;
}

export function applyFilters(events: ThermalEvent[], f: EventFilters) {
  return events.filter((e) => {
    if (f.search) {
      const q = f.search.toLowerCase();
      const hay = `${e.id} ${e.facilityName} ${e.region} ${e.probableClass}`.toLowerCase();
      if (!hay.includes(q)) return false;
    }
    if (f.from && new Date(e.timestamp) < new Date(f.from)) return false;
    if (f.to && new Date(e.timestamp) > new Date(`${f.to}T23:59:59`)) return false;
    if (f.risk.length && !f.risk.includes(riskLevel(e.riskScore))) return false;
    if (f.classes.length && !f.classes.includes(e.probableClass)) return false;
    if (f.confidence.length && !f.confidence.includes(confidenceBand(e.confidence))) return false;
    if (f.persistence.length && !f.persistence.includes(persistenceBand(e.persistenceCount)))
      return false;
    if (f.facilityTypes.length && !f.facilityTypes.includes(e.facilityType)) return false;
    if (f.verification.length && !f.verification.includes(e.verificationStatus)) return false;
    return true;
  });
}

export function useTerraPulse() {
  const ctx = useContext(TerraPulseContext);
  if (!ctx) throw new Error("useTerraPulse must be used inside TerraPulseProvider");
  return ctx;
}

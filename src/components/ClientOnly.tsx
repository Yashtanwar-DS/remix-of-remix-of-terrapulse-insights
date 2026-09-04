import { useEffect, useState, type ReactNode } from "react";

/**
 * Renders children only after hydration in the browser. Use to gate
 * browser-only libraries (Leaflet, window APIs) so SSR doesn't crash.
 */
export function ClientOnly({ children, fallback = null }: { children: ReactNode; fallback?: ReactNode }) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  return mounted ? <>{children}</> : <>{fallback}</>;
}

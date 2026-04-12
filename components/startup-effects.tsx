import { useEffect } from "react";
import { useSyncIntegration } from "@/hooks/use-sync-integration";

/**
 * Component that runs startup effects inside providers
 * Must be rendered inside QueryClientProvider and trpc.Provider
 */
export function StartupEffects({ children }: { children: React.ReactNode }) {
  // Initialize sync integration inside providers context
  useSyncIntegration();

  return <>{children}</>;
}

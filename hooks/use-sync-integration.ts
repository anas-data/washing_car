import { useEffect } from "react";
import { syncService } from "@/lib/sync-service";
import { useRealtimeUpdates } from "./use-realtime-updates";

/**
 * Hook to integrate sync service with the app
 * Should be called once at app startup
 */

export function useSyncIntegration() {
  const { pollForUpdates } = useRealtimeUpdates();

  useEffect(() => {
    // Initialize sync service
    syncService.initialize();

    return () => {
      // Cleanup
      syncService.destroy();
    };
  }, []);

  return {
    getSyncState: () => syncService.getSyncState(),
    addPendingChange: (type: any, action: any, id: number, data?: any) => {
      syncService.addPendingChange(type, action, id, data);
    },
  };
}

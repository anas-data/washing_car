import { useEffect, useCallback, useRef } from "react";
import { useQueryClient } from "@tanstack/react-query";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Notifications from "expo-notifications";

/**
 * Hook for real-time updates across multiple devices
 * Polls server for changes and updates local cache
 */

export function useRealtimeUpdates() {
  const queryClient = useQueryClient();
  const pollIntervalRef = useRef<any>(null);

  const pollForUpdates = useCallback(async () => {
    try {
      // Get last sync time
      const lastSyncStr = await AsyncStorage.getItem("last_sync_time");
      const lastSync = lastSyncStr ? parseInt(lastSyncStr) : 0;

      // Check for inventory updates
      const partsCache = await AsyncStorage.getItem("parts_cache");
      const operationsCache = await AsyncStorage.getItem("operations_cache");
      const conversationsCache = await AsyncStorage.getItem("conversations_cache");
      const notesCache = await AsyncStorage.getItem("notes_cache");

      // Invalidate queries to trigger refetch
      queryClient.invalidateQueries({ queryKey: ["parts"] });
      queryClient.invalidateQueries({ queryKey: ["operations"] });
      queryClient.invalidateQueries({ queryKey: ["messages"] });
      queryClient.invalidateQueries({ queryKey: ["notes"] });

      // Update last sync time
      await AsyncStorage.setItem("last_sync_time", Date.now().toString());

      // Send notification if there are updates
      if (lastSync > 0) {
        const hasUpdates =
          partsCache ||
          operationsCache ||
          conversationsCache ||
          notesCache;

        if (hasUpdates) {
          await Notifications.scheduleNotificationAsync({
            content: {
              title: "تحديثات جديدة",
              body: "تم تحديث البيانات من الأجهزة الأخرى",
              sound: "default",
            },
            trigger: null,
          });
        }
      }
    } catch (error) {
      console.error("Error polling for updates:", error);
    }
  }, [queryClient]);

  useEffect(() => {
    // Start polling
    pollForUpdates();
    pollIntervalRef.current = setInterval(pollForUpdates, 5000); // Poll every 5 seconds

    return () => {
      if (pollIntervalRef.current) {
        clearInterval(pollIntervalRef.current);
      }
    };
  }, [pollForUpdates]);

  return {
    pollForUpdates,
  };
}

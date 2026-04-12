import { View, Text, ActivityIndicator } from "react-native";
import { useColors } from "@/hooks/use-colors";
import { useSyncIntegration } from "@/hooks/use-sync-integration";
import { useEffect, useState } from "react";

/**
 * Sync Status Indicator Component
 * Shows real-time sync status and pending changes
 */

export function SyncStatusIndicator() {
  const colors = useColors();
  const { getSyncState } = useSyncIntegration();
  const [syncState, setSyncState] = useState(getSyncState());

  useEffect(() => {
    const interval = setInterval(() => {
      setSyncState(getSyncState());
    }, 1000);

    return () => clearInterval(interval);
  }, [getSyncState]);

  const getPendingCount = () => syncState.pendingChanges.length;
  const isSyncing = syncState.syncInProgress;
  const hasError = !!syncState.lastError;

  if (getPendingCount() === 0 && !isSyncing && !hasError) {
    return null;
  }

  return (
    <View className="flex-row items-center gap-2 rounded-lg border border-border bg-surface px-3 py-2">
      {isSyncing ? (
        <>
          <ActivityIndicator size="small" color={colors.primary} />
          <Text className="text-xs text-foreground">جاري المزامنة...</Text>
        </>
      ) : hasError ? (
        <>
          <View
            className="h-2 w-2 rounded-full"
            style={{ backgroundColor: colors.error }}
          />
          <Text className="text-xs text-error">خطأ في المزامنة</Text>
        </>
      ) : getPendingCount() > 0 ? (
        <>
          <View
            className="h-2 w-2 rounded-full"
            style={{ backgroundColor: colors.warning }}
          />
          <Text className="text-xs text-foreground">
            {getPendingCount()} تغيير معلق
          </Text>
        </>
      ) : null}

      {!isSyncing && (
        <Text className="ml-auto text-xs text-muted">
          آخر تحديث: {new Date(syncState.lastSyncTime).toLocaleTimeString("ar-SA")}
        </Text>
      )}
    </View>
  );
}

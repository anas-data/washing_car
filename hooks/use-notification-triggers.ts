import { useEffect, useRef } from "react";
import { useNotifications } from "@/lib/notification-context";
import { trpc } from "@/lib/trpc";

export function useNotificationTriggers() {
  const { addNotification } = useNotifications();

  // Monitor low stock parts
  const lowStockQuery = trpc.parts.getLowStock.useQuery(undefined, {
    refetchInterval: 30000, // Check every 30 seconds
  });

  // Monitor pending operations
  const pendingOpsQuery = trpc.operations.list.useQuery(undefined, {
    refetchInterval: 30000, // Check every 30 seconds
  });

  // Track previously notified items to avoid duplicate notifications
  const notifiedLowStockRef = useRef<Set<number>>(new Set());
  const notifiedPendingOpsRef = useRef<Set<number>>(new Set());

  // Check for low stock notifications
  useEffect(() => {
    if (!lowStockQuery.data) return;

    lowStockQuery.data.forEach((part: any) => {
      if (!notifiedLowStockRef.current.has(part.id)) {
        addNotification({
          type: "low_stock",
          title: "تنبيه انخفاض المخزون",
          message: `القطعة "${part.name}" قد انخفضت إلى ${part.quantityAvailable} ${part.unit}`,
          data: {
            itemId: part.id,
            itemName: part.name,
            quantity: part.quantityAvailable,
            alertThreshold: part.alertThreshold,
          },
        });
        notifiedLowStockRef.current.add(part.id);
      }
    });
  }, [lowStockQuery.data, addNotification]);

  // Check for pending operations notifications
  useEffect(() => {
    if (!pendingOpsQuery.data) return;

    const pendingOps = pendingOpsQuery.data.filter((op: any) => op.status === "pending");

    pendingOps.forEach((operation: any) => {
      if (!notifiedPendingOpsRef.current.has(operation.id)) {
        addNotification({
          type: "pending_operation",
          title: "عملية معلقة بانتظار الموافقة",
          message: `العملية #${operation.code} من ${operation.driverName} بانتظار الموافقة`,
          data: {
            itemId: operation.id,
          },
        });
        notifiedPendingOpsRef.current.add(operation.id);
      }
    });
  }, [pendingOpsQuery.data, addNotification]);

  // Clear notifications for items that are no longer low stock
  useEffect(() => {
    if (!lowStockQuery.data) return;

    const currentLowStockIds = new Set(lowStockQuery.data.map((p: any) => p.id));

    notifiedLowStockRef.current.forEach((id) => {
      if (!currentLowStockIds.has(id)) {
        notifiedLowStockRef.current.delete(id);
      }
    });
  }, [lowStockQuery.data]);

  // Clear notifications for operations that are no longer pending
  useEffect(() => {
    if (!pendingOpsQuery.data) return;

    const currentPendingIds = new Set(
      pendingOpsQuery.data
        .filter((op: any) => op.status === "pending")
        .map((op: any) => op.id)
    );

    notifiedPendingOpsRef.current.forEach((id) => {
      if (!currentPendingIds.has(id)) {
        notifiedPendingOpsRef.current.delete(id);
      }
    });
  }, [pendingOpsQuery.data]);
}

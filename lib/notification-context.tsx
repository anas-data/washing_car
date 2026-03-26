import React, { createContext, useContext, useState, useCallback, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Notifications from "expo-notifications";

export interface AppNotification {
  id: string;
  type: "low_stock" | "pending_operation" | "approval_needed" | "info";
  title: string;
  message: string;
  timestamp: number;
  read: boolean;
  data?: {
    itemId?: number;
    itemName?: string;
    quantity?: number;
    alertThreshold?: number;
  };
}

interface NotificationContextType {
  notifications: AppNotification[];
  unreadCount: number;
  addNotification: (notification: Omit<AppNotification, "id" | "timestamp" | "read">) => void;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  deleteNotification: (id: string) => void;
  clearAll: () => void;
  enableNotifications: boolean;
  setEnableNotifications: (enabled: boolean) => void;
  enableSound: boolean;
  setEnableSound: (enabled: boolean) => void;
  enableVibration: boolean;
  setEnableVibration: (enabled: boolean) => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export function NotificationProvider({ children }: { children: React.ReactNode }) {
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [enableNotifications, setEnableNotifications] = useState(true);
  const [enableSound, setEnableSound] = useState(true);
  const [enableVibration, setEnableVibration] = useState(true);

  // Load notifications and settings from storage
  useEffect(() => {
    loadFromStorage();
  }, []);

  // Save notifications to storage whenever they change
  useEffect(() => {
    saveToStorage();
  }, [notifications, enableNotifications, enableSound, enableVibration]);

  const loadFromStorage = async () => {
    try {
      const [notificationsData, settings] = await Promise.all([
        AsyncStorage.getItem("notifications"),
        AsyncStorage.getItem("notificationSettings"),
      ]);

      if (notificationsData) {
        setNotifications(JSON.parse(notificationsData));
      }

      if (settings) {
        const parsedSettings = JSON.parse(settings);
        setEnableNotifications(parsedSettings.enableNotifications ?? true);
        setEnableSound(parsedSettings.enableSound ?? true);
        setEnableVibration(parsedSettings.enableVibration ?? true);
      }
    } catch (error) {
      console.error("Error loading notifications from storage:", error);
    }
  };

  const saveToStorage = async () => {
    try {
      await Promise.all([
        AsyncStorage.setItem("notifications", JSON.stringify(notifications)),
        AsyncStorage.setItem(
          "notificationSettings",
          JSON.stringify({
            enableNotifications,
            enableSound,
            enableVibration,
          })
        ),
      ]);
    } catch (error) {
      console.error("Error saving notifications to storage:", error);
    }
  };

  const addNotification = useCallback(
    (notification: Omit<AppNotification, "id" | "timestamp" | "read">) => {
      if (!enableNotifications) return;

      const newNotification: AppNotification = {
        ...notification,
        id: Date.now().toString(),
        timestamp: Date.now(),
        read: false,
      };

      setNotifications((prev) => [newNotification, ...prev]);

      // Trigger native notification
      if (enableSound || enableVibration) {
        triggerNativeNotification(newNotification);
      }
    },
    [enableNotifications, enableSound, enableVibration]
  );

  const triggerNativeNotification = async (notification: AppNotification) => {
    try {
      // Set notification handler
      Notifications.setNotificationHandler({
        handleNotification: async () => ({
          shouldShowAlert: true,
          shouldPlaySound: enableSound,
          shouldSetBadge: true,
          shouldShowBanner: true,
          shouldShowList: true,
        }),
      });

      // Send local notification
      await Notifications.scheduleNotificationAsync({
        content: {
          title: notification.title,
          body: notification.message,
          sound: enableSound ? "default" : undefined,
          badge: 1,
          data: notification.data,
        },
        trigger: null, // Show immediately
      });
    } catch (error) {
      console.error("Error triggering native notification:", error);
    }
  };

  const markAsRead = useCallback((id: string) => {
    setNotifications((prev) =>
      prev.map((notif) => (notif.id === id ? { ...notif, read: true } : notif))
    );
  }, []);

  const markAllAsRead = useCallback(() => {
    setNotifications((prev) => prev.map((notif) => ({ ...notif, read: true })));
  }, []);

  const deleteNotification = useCallback((id: string) => {
    setNotifications((prev) => prev.filter((notif) => notif.id !== id));
  }, []);

  const clearAll = useCallback(() => {
    setNotifications([]);
  }, []);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const value: NotificationContextType = {
    notifications,
    unreadCount,
    addNotification,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    clearAll,
    enableNotifications,
    setEnableNotifications,
    enableSound,
    setEnableSound,
    enableVibration,
    setEnableVibration,
  };

  return (
    <NotificationContext.Provider value={value}>{children}</NotificationContext.Provider>
  );
}

export function useNotifications() {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error("useNotifications must be used within NotificationProvider");
  }
  return context;
}

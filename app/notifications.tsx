import {
  ScrollView,
  Text,
  View,
  Pressable,
  FlatList,
  I18nManager,
  Alert,
} from "react-native";
import { useEffect, useState } from "react";
import { ScreenContainer } from "@/components/screen-container";
import { useColors } from "@/hooks/use-colors";
import { useNotifications } from "@/lib/notification-context";
import * as Haptics from "expo-haptics";

I18nManager.forceRTL(true);

export default function NotificationsScreen() {
  const colors = useColors();
  const {
    notifications,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    clearAll,
  } = useNotifications();
  const [selectedFilter, setSelectedFilter] = useState<"all" | "unread">("unread");

  const filteredNotifications =
    selectedFilter === "unread"
      ? notifications.filter((n) => !n.read)
      : notifications;

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "low_stock":
        return "⚠️";
      case "pending_operation":
        return "⏳";
      case "approval_needed":
        return "✋";
      case "info":
        return "ℹ️";
      default:
        return "📢";
    }
  };

  const getNotificationColor = (type: string) => {
    switch (type) {
      case "low_stock":
        return colors.error;
      case "pending_operation":
        return colors.warning;
      case "approval_needed":
        return colors.warning;
      case "info":
        return colors.primary;
      default:
        return colors.muted;
    }
  };

  const handleDelete = (id: string) => {
    Alert.alert("حذف الإشعار", "هل تريد حذف هذا الإشعار؟", [
      {
        text: "إلغاء",
        onPress: () => {},
        style: "cancel",
      },
      {
        text: "حذف",
        onPress: () => {
          deleteNotification(id);
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        },
        style: "destructive",
      },
    ]);
  };

  const renderNotificationItem = ({ item }: { item: any }) => (
    <Pressable
      onPress={() => {
        if (!item.read) {
          markAsRead(item.id);
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        }
      }}
      style={({ pressed }) => [
        {
          backgroundColor: item.read ? colors.surface : colors.primary + "15",
          borderLeftWidth: 4,
          borderLeftColor: getNotificationColor(item.type),
          paddingHorizontal: 16,
          paddingVertical: 12,
          marginHorizontal: 16,
          marginVertical: 6,
          borderRadius: 8,
          opacity: pressed ? 0.7 : 1,
        },
      ]}
    >
      <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
        <View style={{ flex: 1, marginRight: 12 }}>
          <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 4 }}>
            <Text style={{ fontSize: 18, marginRight: 8 }}>
              {getNotificationIcon(item.type)}
            </Text>
            <Text
              style={{
                fontSize: 14,
                fontWeight: "700",
                color: colors.foreground,
                flex: 1,
              }}
            >
              {item.title}
            </Text>
            {!item.read && (
              <View
                style={{
                  width: 8,
                  height: 8,
                  borderRadius: 4,
                  backgroundColor: colors.primary,
                  marginLeft: 8,
                }}
              />
            )}
          </View>
          <Text
            style={{
              fontSize: 13,
              color: colors.muted,
              marginBottom: 6,
            }}
          >
            {item.message}
          </Text>
          <Text
            style={{
              fontSize: 11,
              color: colors.muted,
            }}
          >
            {new Date(item.timestamp).toLocaleString("ar-SA")}
          </Text>
        </View>
        <Pressable
          onPress={() => handleDelete(item.id)}
          style={({ pressed }) => [
            {
              opacity: pressed ? 0.5 : 1,
            },
          ]}
        >
          <Text style={{ fontSize: 18 }}>🗑️</Text>
        </Pressable>
      </View>
    </Pressable>
  );

  return (
    <ScreenContainer className="bg-background">
      <View style={{ flex: 1 }}>
        {/* Header */}
        <View
          style={{
            paddingHorizontal: 16,
            paddingTop: 16,
            paddingBottom: 12,
            borderBottomWidth: 1,
            borderBottomColor: colors.border,
          }}
        >
          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: 12,
            }}
          >
            <Text
              style={{
                fontSize: 24,
                fontWeight: "700",
                color: colors.foreground,
              }}
            >
              الإشعارات
            </Text>
            {notifications.length > 0 && (
              <Pressable
                onPress={() => {
                  Alert.alert(
                    "حذف جميع الإشعارات",
                    "هل تريد حذف جميع الإشعارات؟",
                    [
                      {
                        text: "إلغاء",
                        onPress: () => {},
                        style: "cancel",
                      },
                      {
                        text: "حذف",
                        onPress: () => {
                          clearAll();
                          Haptics.notificationAsync(
                            Haptics.NotificationFeedbackType.Success
                          );
                        },
                        style: "destructive",
                      },
                    ]
                  );
                }}
                style={({ pressed }) => [
                  {
                    opacity: pressed ? 0.7 : 1,
                  },
                ]}
              >
                <Text style={{ fontSize: 14, color: colors.error }}>حذف الكل</Text>
              </Pressable>
            )}
          </View>

          {/* Filter Buttons */}
          <View style={{ flexDirection: "row", gap: 8 }}>
            <Pressable
              onPress={() => setSelectedFilter("unread")}
              style={({ pressed }) => [
                {
                  paddingHorizontal: 12,
                  paddingVertical: 6,
                  borderRadius: 20,
                  backgroundColor:
                    selectedFilter === "unread" ? colors.primary : colors.surface,
                  opacity: pressed ? 0.7 : 1,
                },
              ]}
            >
              <Text
                style={{
                  color: selectedFilter === "unread" ? "#ffffff" : colors.foreground,
                  fontSize: 12,
                  fontWeight: "600",
                }}
              >
                غير مقروءة ({notifications.filter((n) => !n.read).length})
              </Text>
            </Pressable>

            <Pressable
              onPress={() => setSelectedFilter("all")}
              style={({ pressed }) => [
                {
                  paddingHorizontal: 12,
                  paddingVertical: 6,
                  borderRadius: 20,
                  backgroundColor:
                    selectedFilter === "all" ? colors.primary : colors.surface,
                  opacity: pressed ? 0.7 : 1,
                },
              ]}
            >
              <Text
                style={{
                  color: selectedFilter === "all" ? "#ffffff" : colors.foreground,
                  fontSize: 12,
                  fontWeight: "600",
                }}
              >
                الكل ({notifications.length})
              </Text>
            </Pressable>

            {filteredNotifications.length > 0 && selectedFilter === "unread" && (
              <Pressable
                onPress={() => {
                  markAllAsRead();
                  Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
                }}
                style={({ pressed }) => [
                  {
                    paddingHorizontal: 12,
                    paddingVertical: 6,
                    borderRadius: 20,
                    backgroundColor: colors.success,
                    opacity: pressed ? 0.7 : 1,
                  },
                ]}
              >
                <Text
                  style={{
                    color: "#ffffff",
                    fontSize: 12,
                    fontWeight: "600",
                  }}
                >
                  ✓ قراءة الكل
                </Text>
              </Pressable>
            )}
          </View>
        </View>

        {/* Notifications List */}
        {filteredNotifications.length > 0 ? (
          <FlatList
            data={filteredNotifications}
            keyExtractor={(item) => item.id}
            renderItem={renderNotificationItem}
            contentContainerStyle={{ paddingVertical: 8 }}
            scrollEnabled={true}
          />
        ) : (
          <View
            style={{
              flex: 1,
              justifyContent: "center",
              alignItems: "center",
              paddingHorizontal: 32,
            }}
          >
            <Text style={{ fontSize: 48, marginBottom: 16 }}>📭</Text>
            <Text
              style={{
                fontSize: 16,
                fontWeight: "600",
                color: colors.foreground,
                marginBottom: 8,
                textAlign: "center",
              }}
            >
              {selectedFilter === "unread"
                ? "لا توجد إشعارات جديدة"
                : "لا توجد إشعارات"}
            </Text>
            <Text
              style={{
                fontSize: 13,
                color: colors.muted,
                textAlign: "center",
              }}
            >
              {selectedFilter === "unread"
                ? "جميع إشعاراتك مقروءة"
                : "ستظهر الإشعارات هنا عند حدوثها"}
            </Text>
          </View>
        )}
      </View>
    </ScreenContainer>
  );
}

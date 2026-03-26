import { View, Text } from "react-native";
import { useColors } from "@/hooks/use-colors";
import { useNotifications } from "@/lib/notification-context";

export function NotificationBadge() {
  const colors = useColors();
  const { unreadCount } = useNotifications();

  if (unreadCount === 0) return null;

  return (
    <View
      style={{
        position: "absolute",
        top: -8,
        right: -8,
        backgroundColor: colors.error,
        borderRadius: 10,
        width: 20,
        height: 20,
        justifyContent: "center",
        alignItems: "center",
        borderWidth: 2,
        borderColor: colors.background,
      }}
    >
      <Text
        style={{
          color: "#ffffff",
          fontSize: 11,
          fontWeight: "700",
        }}
      >
        {unreadCount > 99 ? "99+" : unreadCount}
      </Text>
    </View>
  );
}

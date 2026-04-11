import { View, Text, Pressable } from "react-native";
import { useColors } from "@/hooks/use-colors";
import * as Haptics from "expo-haptics";

export type AlertType = "info" | "warning" | "error" | "success";

export interface AlertBannerProps {
  type: AlertType;
  title: string;
  message: string;
  icon?: string;
  action?: {
    label: string;
    onPress: () => void;
  };
  dismissible?: boolean;
  onDismiss?: () => void;
}

/**
 * Alert Banner Component
 * 
 * Displays important alerts with different severity levels:
 * - info: Blue informational messages
 * - warning: Yellow warning messages
 * - error: Red error messages
 * - success: Green success messages
 */
export function AlertBanner({
  type,
  title,
  message,
  icon,
  action,
  dismissible = true,
  onDismiss,
}: AlertBannerProps) {
  const colors = useColors();

  const getAlertColors = (alertType: AlertType) => {
    switch (alertType) {
      case "warning":
        return {
          bg: "#FEF3C7",
          border: "#F59E0B",
          text: "#92400E",
          icon: "⚠️",
        };
      case "error":
        return {
          bg: "#FEE2E2",
          border: "#EF4444",
          text: "#991B1B",
          icon: "❌",
        };
      case "success":
        return {
          bg: "#DCFCE7",
          border: "#22C55E",
          text: "#166534",
          icon: "✅",
        };
      case "info":
      default:
        return {
          bg: "#DBEAFE",
          border: "#3B82F6",
          text: "#1E40AF",
          icon: "ℹ️",
        };
    }
  };

  const alertColors = getAlertColors(type);

  return (
    <View
      style={{
        backgroundColor: alertColors.bg,
        borderRadius: 12,
        padding: 12,
        marginBottom: 12,
        borderLeftWidth: 4,
        borderLeftColor: alertColors.border,
        flexDirection: "row",
        alignItems: "flex-start",
      }}
    >
      {/* Icon */}
      <Text style={{ fontSize: 20, marginRight: 12, marginTop: 2 }}>
        {icon || alertColors.icon}
      </Text>

      {/* Content */}
      <View style={{ flex: 1 }}>
        <Text
          style={{
            fontSize: 14,
            fontWeight: "600",
            color: alertColors.text,
            marginBottom: 4,
          }}
        >
          {title}
        </Text>
        <Text
          style={{
            fontSize: 12,
            color: alertColors.text,
            lineHeight: 16,
            marginBottom: action ? 8 : 0,
          }}
        >
          {message}
        </Text>

        {/* Action Button */}
        {action && (
          <Pressable
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              action.onPress();
            }}
            style={({ pressed }) => [
              {
                opacity: pressed ? 0.7 : 1,
              },
            ]}
          >
            <Text
              style={{
                fontSize: 12,
                fontWeight: "600",
                color: alertColors.border,
                textDecorationLine: "underline",
              }}
            >
              {action.label}
            </Text>
          </Pressable>
        )}
      </View>

      {/* Dismiss Button */}
      {dismissible && (
        <Pressable
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            onDismiss?.();
          }}
          style={({ pressed }) => [
            {
              opacity: pressed ? 0.5 : 1,
              marginLeft: 12,
            },
          ]}
        >
          <Text style={{ fontSize: 18, color: alertColors.text }}>✕</Text>
        </Pressable>
      )}
    </View>
  );
}

/**
 * Alert Stack Component
 * 
 * Displays multiple alerts stacked vertically
 */
export function AlertStack({ alerts }: { alerts: AlertBannerProps[] }) {
  return (
    <View>
      {alerts.map((alert, index) => (
        <AlertBanner key={index} {...alert} />
      ))}
    </View>
  );
}

/**
 * Inline Alert Component
 * 
 * Smaller alert for inline use within cards
 */
export function InlineAlert({
  type,
  message,
  icon,
}: {
  type: AlertType;
  message: string;
  icon?: string;
}) {
  const colors = useColors();

  const getAlertColors = (alertType: AlertType) => {
    switch (alertType) {
      case "warning":
        return { bg: "#FEF3C7", text: "#92400E", icon: "⚠️" };
      case "error":
        return { bg: "#FEE2E2", text: "#991B1B", icon: "❌" };
      case "success":
        return { bg: "#DCFCE7", text: "#166534", icon: "✅" };
      case "info":
      default:
        return { bg: "#DBEAFE", text: "#1E40AF", icon: "ℹ️" };
    }
  };

  const alertColors = getAlertColors(type);

  return (
    <View
      style={{
        backgroundColor: alertColors.bg,
        borderRadius: 8,
        paddingHorizontal: 10,
        paddingVertical: 8,
        flexDirection: "row",
        alignItems: "center",
        gap: 8,
      }}
    >
      <Text style={{ fontSize: 14 }}>{icon || alertColors.icon}</Text>
      <Text
        style={{
          fontSize: 12,
          color: alertColors.text,
          flex: 1,
        }}
      >
        {message}
      </Text>
    </View>
  );
}

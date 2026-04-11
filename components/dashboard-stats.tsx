import { View, Text, Pressable } from "react-native";
import { useColors } from "@/hooks/use-colors";
import * as Haptics from "expo-haptics";

export interface StatItem {
  id: string;
  label: string;
  value: number | string;
  icon: string;
  color: string;
  trend?: {
    direction: "up" | "down" | "neutral";
    percentage: number;
  };
  onPress?: () => void;
}

interface DashboardStatsProps {
  items: StatItem[];
  columns?: 2 | 3 | 4;
}

/**
 * Dashboard Stats Component
 * 
 * Displays statistics in a grid layout with:
 * - Customizable number of columns
 * - Trend indicators (up/down/neutral)
 * - Haptic feedback on press
 * - Color-coded cards
 * - RTL support
 */
export function DashboardStats({ items, columns = 2 }: DashboardStatsProps) {
  const colors = useColors();

  const handlePress = (item: StatItem) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    item.onPress?.();
  };

  const getTrendIcon = (trend?: StatItem["trend"]) => {
    if (!trend) return null;
    if (trend.direction === "up") return "📈";
    if (trend.direction === "down") return "📉";
    return "➡️";
  };

  const getTrendColor = (trend?: StatItem["trend"]) => {
    if (!trend) return colors.muted;
    if (trend.direction === "up") return colors.success;
    if (trend.direction === "down") return colors.error;
    return colors.muted;
  };

  return (
    <View
      style={{
        flexDirection: "row",
        flexWrap: "wrap",
        marginHorizontal: -6,
      }}
    >
      {items.map((item) => (
        <View
          key={item.id}
          style={{
            width: `${100 / columns}%`,
            paddingHorizontal: 6,
            marginBottom: 12,
          }}
        >
          <Pressable
            onPress={() => handlePress(item)}
            style={({ pressed }) => [
              {
                backgroundColor: colors.surface,
                borderRadius: 12,
                padding: 12,
                borderLeftWidth: 4,
                borderLeftColor: item.color,
                opacity: pressed ? 0.7 : 1,
              },
            ]}
          >
            {/* Icon and Trend */}
            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: 8,
              }}
            >
              <Text style={{ fontSize: 24 }}>{item.icon}</Text>
              {item.trend && (
                <View style={{ alignItems: "center" }}>
                  <Text style={{ fontSize: 14 }}>{getTrendIcon(item.trend)}</Text>
                  <Text
                    style={{
                      fontSize: 10,
                      color: getTrendColor(item.trend),
                      fontWeight: "600",
                      marginTop: 2,
                    }}
                  >
                    {item.trend.percentage > 0 ? "+" : ""}
                    {item.trend.percentage}%
                  </Text>
                </View>
              )}
            </View>

            {/* Value */}
            <Text
              style={{
                fontSize: 20,
                fontWeight: "700",
                color: colors.foreground,
                marginBottom: 4,
              }}
            >
              {item.value}
            </Text>

            {/* Label */}
            <Text
              style={{
                fontSize: 11,
                color: colors.muted,
                lineHeight: 14,
              }}
            >
              {item.label}
            </Text>
          </Pressable>
        </View>
      ))}
    </View>
  );
}

/**
 * Large Stat Card Component
 * 
 * For displaying prominent statistics with more details
 */
export function LargeStatCard({
  label,
  value,
  icon,
  color,
  description,
  onPress,
}: {
  label: string;
  value: number | string;
  icon: string;
  color: string;
  description?: string;
  onPress?: () => void;
}) {
  const colors = useColors();

  return (
    <Pressable
      onPress={() => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        onPress?.();
      }}
      style={({ pressed }) => [
        {
          backgroundColor: colors.surface,
          borderRadius: 16,
          padding: 16,
          marginBottom: 12,
          borderLeftWidth: 5,
          borderLeftColor: color,
          opacity: pressed ? 0.75 : 1,
        },
      ]}
    >
      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "flex-start",
        }}
      >
        <View style={{ flex: 1 }}>
          <Text
            style={{
              fontSize: 14,
              color: colors.muted,
              marginBottom: 4,
            }}
          >
            {label}
          </Text>
          <Text
            style={{
              fontSize: 32,
              fontWeight: "700",
              color: colors.foreground,
              marginBottom: 4,
            }}
          >
            {value}
          </Text>
          {description && (
            <Text
              style={{
                fontSize: 12,
                color: colors.muted,
                lineHeight: 16,
              }}
            >
              {description}
            </Text>
          )}
        </View>
        <Text style={{ fontSize: 40, marginLeft: 12 }}>{icon}</Text>
      </View>
    </Pressable>
  );
}

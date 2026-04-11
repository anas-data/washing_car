import { View, Text, Pressable, FlatList } from "react-native";
import { useColors } from "@/hooks/use-colors";
import * as Haptics from "expo-haptics";

export interface ActivityItem {
  id: string;
  title: string;
  description: string;
  timestamp: Date | string;
  icon: string;
  type: "operation" | "approval" | "alert" | "update";
  status?: "pending" | "completed" | "failed";
  onPress?: () => void;
}

interface RecentActivityProps {
  items: ActivityItem[];
  title?: string;
  maxItems?: number;
  onViewAll?: () => void;
}

/**
 * Recent Activity Component
 * 
 * Displays a list of recent activities with:
 * - Activity type icons
 * - Timestamps
 * - Status indicators
 * - Tap to view details
 */
export function RecentActivity({
  items,
  title = "آخر الأنشطة",
  maxItems = 5,
  onViewAll,
}: RecentActivityProps) {
  const colors = useColors();
  const displayItems = items.slice(0, maxItems);

  const getStatusColor = (status?: string) => {
    switch (status) {
      case "completed":
        return colors.success;
      case "pending":
        return colors.warning;
      case "failed":
        return colors.error;
      default:
        return colors.muted;
    }
  };

  const getStatusLabel = (status?: string) => {
    switch (status) {
      case "completed":
        return "مكتملة";
      case "pending":
        return "قيد الانتظار";
      case "failed":
        return "فشلت";
      default:
        return "";
    }
  };

  const formatTime = (timestamp: Date | string) => {
    const date = typeof timestamp === "string" ? new Date(timestamp) : timestamp;
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return "الآن";
    if (diffMins < 60) return `قبل ${diffMins} دقيقة`;
    if (diffHours < 24) return `قبل ${diffHours} ساعة`;
    if (diffDays < 7) return `قبل ${diffDays} يوم`;
    return date.toLocaleDateString("ar-SA");
  };

  const renderItem = ({ item }: { item: ActivityItem }) => (
    <Pressable
      onPress={() => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        item.onPress?.();
      }}
      style={({ pressed }) => [
        {
          flexDirection: "row",
          alignItems: "center",
          paddingVertical: 12,
          paddingHorizontal: 12,
          backgroundColor: pressed ? colors.border : "transparent",
          borderRadius: 8,
          marginBottom: 8,
        },
      ]}
    >
      {/* Icon */}
      <View
        style={{
          width: 40,
          height: 40,
          borderRadius: 20,
          backgroundColor: colors.surface,
          alignItems: "center",
          justifyContent: "center",
          marginRight: 12,
        }}
      >
        <Text style={{ fontSize: 20 }}>{item.icon}</Text>
      </View>

      {/* Content */}
      <View style={{ flex: 1 }}>
        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: 4,
          }}
        >
          <Text
            style={{
              fontSize: 13,
              fontWeight: "600",
              color: colors.foreground,
              flex: 1,
            }}
          >
            {item.title}
          </Text>
          {item.status && (
            <View
              style={{
                paddingHorizontal: 8,
                paddingVertical: 2,
                backgroundColor: getStatusColor(item.status),
                borderRadius: 4,
                marginLeft: 8,
              }}
            >
              <Text
                style={{
                  fontSize: 10,
                  color: "#ffffff",
                  fontWeight: "600",
                }}
              >
                {getStatusLabel(item.status)}
              </Text>
            </View>
          )}
        </View>

        <Text
          style={{
            fontSize: 12,
            color: colors.muted,
            marginBottom: 4,
            lineHeight: 16,
          }}
        >
          {item.description}
        </Text>

        <Text
          style={{
            fontSize: 11,
            color: colors.muted,
          }}
        >
          {formatTime(item.timestamp)}
        </Text>
      </View>

      {/* Chevron */}
      <Text
        style={{
          fontSize: 16,
          color: colors.muted,
          marginLeft: 8,
        }}
      >
        ←
      </Text>
    </Pressable>
  );

  if (displayItems.length === 0) {
    return (
      <View
        style={{
          backgroundColor: colors.surface,
          borderRadius: 12,
          padding: 16,
          marginBottom: 12,
          alignItems: "center",
        }}
      >
        <Text
          style={{
            fontSize: 14,
            color: colors.muted,
          }}
        >
          لا توجد أنشطة حديثة
        </Text>
      </View>
    );
  }

  return (
    <View
      style={{
        backgroundColor: colors.surface,
        borderRadius: 12,
        padding: 12,
        marginBottom: 12,
      }}
    >
      {/* Header */}
      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 12,
          paddingHorizontal: 4,
        }}
      >
        <Text
          style={{
            fontSize: 16,
            fontWeight: "600",
            color: colors.foreground,
          }}
        >
          {title}
        </Text>
        {items.length > maxItems && onViewAll && (
          <Pressable
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              onViewAll();
            }}
          >
            <Text
              style={{
                fontSize: 12,
                color: colors.primary,
                fontWeight: "600",
              }}
            >
              عرض الكل
            </Text>
          </Pressable>
        )}
      </View>

      {/* Activity List */}
      <FlatList
        data={displayItems}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        scrollEnabled={false}
        nestedScrollEnabled={false}
      />
    </View>
  );
}

/**
 * Activity Timeline Component
 * 
 * Displays activities in a timeline format
 */
export function ActivityTimeline({ items }: { items: ActivityItem[] }) {
  const colors = useColors();

  return (
    <View
      style={{
        backgroundColor: colors.surface,
        borderRadius: 12,
        padding: 16,
        marginBottom: 12,
      }}
    >
      <Text
        style={{
          fontSize: 16,
          fontWeight: "600",
          color: colors.foreground,
          marginBottom: 16,
        }}
      >
        الخط الزمني
      </Text>

      {items.map((item, index) => (
        <View key={item.id} style={{ marginBottom: index === items.length - 1 ? 0 : 16 }}>
          {/* Timeline dot and line */}
          <View
            style={{
              flexDirection: "row",
              alignItems: "flex-start",
            }}
          >
            {/* Dot */}
            <View
              style={{
                width: 12,
                height: 12,
                borderRadius: 6,
                backgroundColor: colors.primary,
                marginTop: 4,
                marginRight: 12,
              }}
            />

            {/* Content */}
            <View style={{ flex: 1 }}>
              <Text
                style={{
                  fontSize: 13,
                  fontWeight: "600",
                  color: colors.foreground,
                  marginBottom: 4,
                }}
              >
                {item.title}
              </Text>
              <Text
                style={{
                  fontSize: 12,
                  color: colors.muted,
                  marginBottom: 4,
                }}
              >
                {item.description}
              </Text>
              <Text
                style={{
                  fontSize: 11,
                  color: colors.muted,
                }}
              >
                {typeof item.timestamp === "string"
                  ? item.timestamp
                  : item.timestamp.toLocaleString("ar-SA")}
              </Text>
            </View>
          </View>

          {/* Vertical line */}
          {index !== items.length - 1 && (
            <View
              style={{
                width: 2,
                height: 16,
                backgroundColor: colors.border,
                marginLeft: 5,
                marginTop: 8,
              }}
            />
          )}
        </View>
      ))}
    </View>
  );
}

import { View, Text, FlatList, ScrollView } from "react-native";
import { useColors } from "@/hooks/use-colors";

export interface ActivityLogEntry {
  id: number;
  userId: number;
  userName: string;
  action: string;
  entityType: string;
  entityName?: string;
  description?: string;
  changes?: string;
  createdAt: string;
  severity: "info" | "warning" | "error" | "success";
}

interface ActivityLogProps {
  activities: ActivityLogEntry[];
  loading?: boolean;
  onLoadMore?: () => void;
}

/**
 * Activity Log Component
 *
 * Displays a timeline of user activities and system changes
 */
export function ActivityLog({
  activities,
  loading = false,
  onLoadMore,
}: ActivityLogProps) {
  const colors = useColors();

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "success":
        return colors.success;
      case "warning":
        return colors.warning;
      case "error":
        return colors.error;
      default:
        return colors.primary;
    }
  };

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case "success":
        return "✓";
      case "warning":
        return "⚠";
      case "error":
        return "✕";
      default:
        return "•";
    }
  };

  const getActionLabel = (action: string) => {
    const actionMap: Record<string, string> = {
      user_created: "تم إنشاء مستخدم",
      user_updated: "تم تحديث المستخدم",
      user_deleted: "تم حذف المستخدم",
      role_assigned: "تم تعيين دور",
      role_removed: "تم إزالة دور",
      permission_granted: "تم منح صلاحية",
      permission_revoked: "تم إلغاء صلاحية",
      status_changed: "تم تغيير الحالة",
      login: "تسجيل دخول",
      logout: "تسجيل خروج",
      operation_created: "تم إنشاء عملية",
      operation_approved: "تمت الموافقة على العملية",
      operation_rejected: "تم رفض العملية",
      inventory_updated: "تم تحديث المخزون",
    };
    return actionMap[action] || action;
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
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

  const renderActivityItem = ({ item }: { item: ActivityLogEntry }) => (
    <View
      style={{
        flexDirection: "row",
        paddingVertical: 12,
        paddingHorizontal: 12,
        borderBottomWidth: 1,
        borderBottomColor: colors.border,
      }}
    >
      {/* Timeline Dot */}
      <View
        style={{
          width: 32,
          height: 32,
          borderRadius: 16,
          backgroundColor: getSeverityColor(item.severity),
          alignItems: "center",
          justifyContent: "center",
          marginRight: 12,
          marginTop: 2,
        }}
      >
        <Text
          style={{
            color: "#ffffff",
            fontSize: 14,
            fontWeight: "bold",
          }}
        >
          {getSeverityIcon(item.severity)}
        </Text>
      </View>

      {/* Activity Info */}
      <View style={{ flex: 1 }}>
        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "flex-start",
            marginBottom: 4,
          }}
        >
          <View style={{ flex: 1 }}>
            <Text
              style={{
                fontSize: 13,
                fontWeight: "600",
                color: colors.foreground,
                marginBottom: 2,
              }}
            >
              {getActionLabel(item.action)}
            </Text>
            <Text
              style={{
                fontSize: 12,
                color: colors.muted,
              }}
            >
              بواسطة {item.userName}
            </Text>
          </View>
          <Text
            style={{
              fontSize: 11,
              color: colors.muted,
              marginLeft: 8,
            }}
          >
            {formatTime(item.createdAt)}
          </Text>
        </View>

        {/* Entity Info */}
        {item.entityName && (
          <View
            style={{
              backgroundColor: colors.surface,
              borderRadius: 6,
              paddingHorizontal: 8,
              paddingVertical: 4,
              marginTop: 6,
              marginBottom: 4,
            }}
          >
            <Text
              style={{
                fontSize: 11,
                color: colors.foreground,
              }}
            >
              <Text style={{ fontWeight: "600" }}>العنصر:</Text> {item.entityName}
            </Text>
          </View>
        )}

        {/* Description */}
        {item.description && (
          <Text
            style={{
              fontSize: 11,
              color: colors.muted,
              marginTop: 4,
              lineHeight: 16,
            }}
          >
            {item.description}
          </Text>
        )}

        {/* Changes */}
        {item.changes && (
          <View
            style={{
              backgroundColor: colors.surface,
              borderRadius: 6,
              padding: 8,
              marginTop: 6,
              borderLeftWidth: 3,
              borderLeftColor: getSeverityColor(item.severity),
            }}
          >
            <Text
              style={{
                fontSize: 10,
                color: colors.foreground,
                fontFamily: "monospace",
              }}
            >
              {item.changes}
            </Text>
          </View>
        )}
      </View>
    </View>
  );

  if (activities.length === 0) {
    return (
      <View
        style={{
          alignItems: "center",
          justifyContent: "center",
          paddingVertical: 40,
        }}
      >
        <Text style={{ fontSize: 18, marginBottom: 8 }}>📋</Text>
        <Text
          style={{
            fontSize: 14,
            color: colors.muted,
            textAlign: "center",
          }}
        >
          لا توجد أنشطة مسجلة
        </Text>
      </View>
    );
  }

  return (
    <FlatList
      data={activities}
      renderItem={renderActivityItem}
      keyExtractor={(item) => item.id.toString()}
      scrollEnabled={false}
      onEndReached={onLoadMore}
      onEndReachedThreshold={0.5}
      ListFooterComponent={
        loading ? (
          <View
            style={{
              paddingVertical: 16,
              alignItems: "center",
            }}
          >
            <Text style={{ color: colors.muted, fontSize: 12 }}>
              جاري التحميل...
            </Text>
          </View>
        ) : null
      }
    />
  );
}

/**
 * Activity Log Card Component
 *
 * Compact card view for displaying recent activities
 */
export function ActivityLogCard({
  activities,
  maxItems = 5,
}: {
  activities: ActivityLogEntry[];
  maxItems?: number;
}) {
  const colors = useColors();

  const recentActivities = activities.slice(0, maxItems);

  return (
    <View
      style={{
        backgroundColor: colors.surface,
        borderRadius: 12,
        padding: 12,
        marginBottom: 12,
      }}
    >
      <Text
        style={{
          fontSize: 14,
          fontWeight: "600",
          color: colors.foreground,
          marginBottom: 12,
        }}
      >
        آخر الأنشطة
      </Text>

      <ActivityLog activities={recentActivities} />

      {activities.length > maxItems && (
        <View
          style={{
            paddingTop: 8,
            borderTopWidth: 1,
            borderTopColor: colors.border,
            marginTop: 8,
          }}
        >
          <Text
            style={{
              fontSize: 12,
              color: colors.primary,
              textAlign: "center",
              fontWeight: "600",
            }}
          >
            عرض جميع الأنشطة ({activities.length})
          </Text>
        </View>
      )}
    </View>
  );
}

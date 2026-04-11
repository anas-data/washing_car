import { View, Text, Pressable } from "react-native";
import { useColors } from "@/hooks/use-colors";
import * as Haptics from "expo-haptics";

export interface PendingOperation {
  id: number;
  code: string;
  operationType: "addition" | "consumption";
  vehicleName: string;
  partName: string;
  quantity: number;
  driverName: string;
  createdAt: string;
  firstLevelStatus: "pending" | "approved" | "rejected";
  secondLevelStatus: "pending" | "approved" | "rejected";
  requestedByName: string;
}

interface PendingOperationCardProps {
  operation: PendingOperation;
  onPress: (operationId: number) => void;
  isPriority?: boolean;
}

/**
 * Pending Operation Card Component
 *
 * Displays a pending operation awaiting approval
 */
export function PendingOperationCard({
  operation,
  onPress,
  isPriority = false,
}: PendingOperationCardProps) {
  const colors = useColors();

  const getOperationTypeLabel = (type: string) => {
    return type === "addition" ? "إضافة" : "استهلاك";
  };

  const getOperationTypeColor = (type: string) => {
    return type === "addition" ? colors.success : colors.warning;
  };

  const getApprovalStatus = () => {
    if (
      operation.firstLevelStatus === "rejected" ||
      operation.secondLevelStatus === "rejected"
    ) {
      return { label: "مرفوض", color: colors.error };
    }
    if (
      operation.firstLevelStatus === "approved" &&
      operation.secondLevelStatus === "approved"
    ) {
      return { label: "موافق عليه", color: colors.success };
    }
    return { label: "قيد الانتظار", color: colors.warning };
  };

  const approvalStatus = getApprovalStatus();

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);

    if (diffMins < 1) return "الآن";
    if (diffMins < 60) return `قبل ${diffMins} دقيقة`;
    if (diffHours < 24) return `قبل ${diffHours} ساعة`;
    return date.toLocaleDateString("ar-SA");
  };

  return (
    <Pressable
      onPress={() => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        onPress(operation.id);
      }}
      style={({ pressed }) => [
        {
          backgroundColor: colors.surface,
          borderRadius: 12,
          padding: 12,
          marginBottom: 12,
          borderLeftWidth: 4,
          borderLeftColor: isPriority ? colors.error : colors.primary,
          opacity: pressed ? 0.8 : 1,
          borderWidth: isPriority ? 1 : 0,
          borderColor: isPriority ? colors.error : "transparent",
        },
      ]}
    >
      {/* Header */}
      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "flex-start",
          marginBottom: 8,
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
            {operation.code}
          </Text>
          <Text
            style={{
              fontSize: 11,
              color: colors.muted,
            }}
          >
            بواسطة {operation.requestedByName}
          </Text>
        </View>

        {/* Priority Badge */}
        {isPriority && (
          <View
            style={{
              backgroundColor: colors.error,
              borderRadius: 6,
              paddingHorizontal: 8,
              paddingVertical: 4,
              marginLeft: 8,
            }}
          >
            <Text
              style={{
                fontSize: 10,
                fontWeight: "600",
                color: "#ffffff",
              }}
            >
              عاجل
            </Text>
          </View>
        )}
      </View>

      {/* Operation Details */}
      <View
        style={{
          backgroundColor: colors.background,
          borderRadius: 8,
          padding: 10,
          marginBottom: 8,
        }}
      >
        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
            marginBottom: 6,
          }}
        >
          <Text
            style={{
              fontSize: 11,
              color: colors.muted,
            }}
          >
            المركبة
          </Text>
          <Text
            style={{
              fontSize: 11,
              fontWeight: "600",
              color: colors.foreground,
            }}
          >
            {operation.vehicleName}
          </Text>
        </View>

        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
            marginBottom: 6,
          }}
        >
          <Text
            style={{
              fontSize: 11,
              color: colors.muted,
            }}
          >
            القطعة
          </Text>
          <Text
            style={{
              fontSize: 11,
              fontWeight: "600",
              color: colors.foreground,
            }}
          >
            {operation.partName}
          </Text>
        </View>

        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              gap: 6,
            }}
          >
            <Text
              style={{
                fontSize: 11,
                color: colors.muted,
              }}
            >
              الكمية
            </Text>
            <View
              style={{
                backgroundColor: getOperationTypeColor(operation.operationType),
                borderRadius: 4,
                paddingHorizontal: 6,
                paddingVertical: 2,
              }}
            >
              <Text
                style={{
                  fontSize: 10,
                  fontWeight: "600",
                  color: "#ffffff",
                }}
              >
                {getOperationTypeLabel(operation.operationType)}
              </Text>
            </View>
          </View>
          <Text
            style={{
              fontSize: 11,
              fontWeight: "600",
              color: colors.foreground,
            }}
          >
            {operation.quantity}
          </Text>
        </View>
      </View>

      {/* Footer */}
      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        {/* Approval Status */}
        <View
          style={{
            paddingHorizontal: 8,
            paddingVertical: 4,
            borderRadius: 6,
            backgroundColor: approvalStatus.color,
          }}
        >
          <Text
            style={{
              fontSize: 10,
              fontWeight: "600",
              color: "#ffffff",
            }}
          >
            {approvalStatus.label}
          </Text>
        </View>

        {/* Time */}
        <Text
          style={{
            fontSize: 10,
            color: colors.muted,
          }}
        >
          {formatDate(operation.createdAt)}
        </Text>

        {/* Chevron */}
        <Text
          style={{
            fontSize: 16,
            color: colors.muted,
          }}
        >
          ←
        </Text>
      </View>

      {/* Approval Levels Indicator */}
      <View
        style={{
          flexDirection: "row",
          gap: 8,
          marginTop: 8,
          paddingTop: 8,
          borderTopWidth: 1,
          borderTopColor: colors.border,
        }}
      >
        {/* First Level */}
        <View
          style={{
            flex: 1,
            alignItems: "center",
          }}
        >
          <View
            style={{
              width: 24,
              height: 24,
              borderRadius: 12,
              backgroundColor:
                operation.firstLevelStatus === "approved"
                  ? colors.success
                  : operation.firstLevelStatus === "rejected"
                    ? colors.error
                    : colors.border,
              alignItems: "center",
              justifyContent: "center",
              marginBottom: 4,
            }}
          >
            <Text
              style={{
                fontSize: 12,
                fontWeight: "bold",
                color:
                  operation.firstLevelStatus === "pending"
                    ? colors.muted
                    : "#ffffff",
              }}
            >
              {operation.firstLevelStatus === "approved"
                ? "✓"
                : operation.firstLevelStatus === "rejected"
                  ? "✕"
                  : "1"}
            </Text>
          </View>
          <Text
            style={{
              fontSize: 9,
              color: colors.muted,
              textAlign: "center",
            }}
          >
            المستوى الأول
          </Text>
        </View>

        {/* Arrow */}
        <View
          style={{
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <Text
            style={{
              fontSize: 14,
              color: colors.border,
            }}
          >
            →
          </Text>
        </View>

        {/* Second Level */}
        <View
          style={{
            flex: 1,
            alignItems: "center",
          }}
        >
          <View
            style={{
              width: 24,
              height: 24,
              borderRadius: 12,
              backgroundColor:
                operation.secondLevelStatus === "approved"
                  ? colors.success
                  : operation.secondLevelStatus === "rejected"
                    ? colors.error
                    : colors.border,
              alignItems: "center",
              justifyContent: "center",
              marginBottom: 4,
            }}
          >
            <Text
              style={{
                fontSize: 12,
                fontWeight: "bold",
                color:
                  operation.secondLevelStatus === "pending"
                    ? colors.muted
                    : "#ffffff",
              }}
            >
              {operation.secondLevelStatus === "approved"
                ? "✓"
                : operation.secondLevelStatus === "rejected"
                  ? "✕"
                  : "2"}
            </Text>
          </View>
          <Text
            style={{
              fontSize: 9,
              color: colors.muted,
              textAlign: "center",
            }}
          >
            المستوى الثاني
          </Text>
        </View>
      </View>
    </Pressable>
  );
}

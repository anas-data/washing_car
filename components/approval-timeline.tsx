import { View, Text } from "react-native";
import { useColors } from "@/hooks/use-colors";

export interface ApprovalStep {
  level: 1 | 2;
  status: "pending" | "approved" | "rejected";
  approverName?: string;
  approvalDate?: string;
  notes?: string;
  rejectionReason?: string;
}

interface ApprovalTimelineProps {
  steps: ApprovalStep[];
}

/**
 * Approval Timeline Component
 *
 * Displays the approval workflow timeline
 */
export function ApprovalTimeline({ steps }: ApprovalTimelineProps) {
  const colors = useColors();

  const getStatusColor = (status: string) => {
    switch (status) {
      case "approved":
        return colors.success;
      case "rejected":
        return colors.error;
      default:
        return colors.warning;
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "approved":
        return "موافق عليه";
      case "rejected":
        return "مرفوض";
      default:
        return "قيد الانتظار";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "approved":
        return "✓";
      case "rejected":
        return "✕";
      default:
        return "⏳";
    }
  };

  return (
    <View style={{ paddingHorizontal: 16, paddingVertical: 12 }}>
      <Text
        style={{
          fontSize: 14,
          fontWeight: "600",
          color: colors.foreground,
          marginBottom: 12,
        }}
      >
        مسار الموافقات
      </Text>

      {steps.map((step, index) => (
        <View key={step.level}>
          {/* Timeline Item */}
          <View style={{ flexDirection: "row", marginBottom: 16 }}>
            {/* Timeline Dot and Line */}
            <View style={{ alignItems: "center", marginRight: 12 }}>
              <View
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: 20,
                  backgroundColor: getStatusColor(step.status),
                  alignItems: "center",
                  justifyContent: "center",
                  marginBottom: 8,
                }}
              >
                <Text
                  style={{
                    fontSize: 16,
                    fontWeight: "bold",
                    color: "#ffffff",
                  }}
                >
                  {getStatusIcon(step.status)}
                </Text>
              </View>

              {/* Connecting Line */}
              {index < steps.length - 1 && (
                <View
                  style={{
                    width: 2,
                    height: 40,
                    backgroundColor: colors.border,
                  }}
                />
              )}
            </View>

            {/* Content */}
            <View style={{ flex: 1, paddingTop: 4 }}>
              <View
                style={{
                  backgroundColor: colors.surface,
                  borderRadius: 8,
                  padding: 12,
                  borderLeftWidth: 3,
                  borderLeftColor: getStatusColor(step.status),
                }}
              >
                {/* Header */}
                <View
                  style={{
                    flexDirection: "row",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginBottom: 8,
                  }}
                >
                  <Text
                    style={{
                      fontSize: 13,
                      fontWeight: "600",
                      color: colors.foreground,
                    }}
                  >
                    المستوى {step.level}
                    {step.level === 1 ? " (التشغيلي)" : " (الإداري)"}
                  </Text>
                  <View
                    style={{
                      backgroundColor: getStatusColor(step.status),
                      borderRadius: 6,
                      paddingHorizontal: 8,
                      paddingVertical: 4,
                    }}
                  >
                    <Text
                      style={{
                        fontSize: 10,
                        fontWeight: "600",
                        color: "#ffffff",
                      }}
                    >
                      {getStatusLabel(step.status)}
                    </Text>
                  </View>
                </View>

                {/* Approver Info */}
                {step.approverName && (
                  <View style={{ marginBottom: 6 }}>
                    <Text
                      style={{
                        fontSize: 11,
                        color: colors.muted,
                        marginBottom: 2,
                      }}
                    >
                      المراجع
                    </Text>
                    <Text
                      style={{
                        fontSize: 12,
                        fontWeight: "500",
                        color: colors.foreground,
                      }}
                    >
                      {step.approverName}
                    </Text>
                  </View>
                )}

                {/* Approval Date */}
                {step.approvalDate && (
                  <View style={{ marginBottom: 6 }}>
                    <Text
                      style={{
                        fontSize: 11,
                        color: colors.muted,
                        marginBottom: 2,
                      }}
                    >
                      التاريخ
                    </Text>
                    <Text
                      style={{
                        fontSize: 12,
                        fontWeight: "500",
                        color: colors.foreground,
                      }}
                    >
                      {new Date(step.approvalDate).toLocaleDateString("ar-SA")}
                    </Text>
                  </View>
                )}

                {/* Notes */}
                {step.notes && (
                  <View style={{ marginBottom: 6 }}>
                    <Text
                      style={{
                        fontSize: 11,
                        color: colors.muted,
                        marginBottom: 2,
                      }}
                    >
                      ملاحظات
                    </Text>
                    <Text
                      style={{
                        fontSize: 12,
                        color: colors.foreground,
                        lineHeight: 16,
                      }}
                    >
                      {step.notes}
                    </Text>
                  </View>
                )}

                {/* Rejection Reason */}
                {step.rejectionReason && (
                  <View
                    style={{
                      backgroundColor: colors.error,
                      borderRadius: 6,
                      padding: 8,
                      marginTop: 6,
                    }}
                  >
                    <Text
                      style={{
                        fontSize: 11,
                        color: colors.muted,
                        marginBottom: 2,
                      }}
                    >
                      سبب الرفض
                    </Text>
                    <Text
                      style={{
                        fontSize: 12,
                        color: "#ffffff",
                        lineHeight: 16,
                      }}
                    >
                      {step.rejectionReason}
                    </Text>
                  </View>
                )}
              </View>
            </View>
          </View>
        </View>
      ))}
    </View>
  );
}

/**
 * Approval Status Badge Component
 *
 * Shows overall approval status
 */
export function ApprovalStatusBadge({
  firstLevelStatus,
  secondLevelStatus,
}: {
  firstLevelStatus: string;
  secondLevelStatus: string;
}) {
  const colors = useColors();

  const getOverallStatus = () => {
    if (firstLevelStatus === "rejected" || secondLevelStatus === "rejected") {
      return {
        label: "مرفوض",
        color: colors.error,
        icon: "✕",
      };
    }
    if (
      firstLevelStatus === "approved" &&
      secondLevelStatus === "approved"
    ) {
      return {
        label: "موافق عليه",
        color: colors.success,
        icon: "✓",
      };
    }
    return {
      label: "قيد الانتظار",
      color: colors.warning,
      icon: "⏳",
    };
  };

  const status = getOverallStatus();

  return (
    <View
      style={{
        backgroundColor: status.color,
        borderRadius: 8,
        paddingHorizontal: 12,
        paddingVertical: 8,
        alignItems: "center",
        flexDirection: "row",
        gap: 6,
      }}
    >
      <Text style={{ fontSize: 16 }}>{status.icon}</Text>
      <Text
        style={{
          fontSize: 12,
          fontWeight: "600",
          color: "#ffffff",
        }}
      >
        {status.label}
      </Text>
    </View>
  );
}

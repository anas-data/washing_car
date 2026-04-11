import {
  ScrollView,
  Text,
  View,
  Pressable,
  FlatList,
  I18nManager,
  Alert,
  TextInput,
  RefreshControl,
} from "react-native";
import { useEffect, useState } from "react";
import { ScreenContainer } from "@/components/screen-container";
import { useColors } from "@/hooks/use-colors";
import { trpc } from "@/lib/trpc";
import { useRouter } from "expo-router";
import * as Haptics from "expo-haptics";
import {
  PendingOperationCard,
  type PendingOperation,
} from "@/components/pending-operation-card";
import {
  ApprovalReviewModal,
  type ApprovalReviewData,
} from "@/components/approval-review-modal";

I18nManager.forceRTL(true);

type FilterStatus = "all" | "pending" | "approved" | "rejected";

interface Approval {
  id: number;
  operationId: number;
  firstLevelStatus: "pending" | "approved" | "rejected";
  secondLevelStatus: "pending" | "approved" | "rejected";
  firstLevelApprovalDate?: Date | null;
  secondLevelApprovalDate?: Date | null;
  rejectionReason?: string | null;
  createdAt: Date;
}

interface MockPendingOperation extends PendingOperation {}

export default function ApprovalsScreen() {
  const colors = useColors();
  const router = useRouter();
  const [approvals, setApprovals] = useState<Approval[]>([]);
  const [operations, setOperations] = useState<MockPendingOperation[]>([]);
  const [filteredOperations, setFilteredOperations] = useState<
    MockPendingOperation[]
  >([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState<FilterStatus>("pending");
  const [selectedOperation, setSelectedOperation] =
    useState<ApprovalReviewData | null>(null);
  const [reviewModalVisible, setReviewModalVisible] = useState(false);
  const [reviewLoading, setReviewLoading] = useState(false);

  const approvalsQuery = trpc.approvals.getPending.useQuery();
  const approveFirstLevelMutation = trpc.approvals.approveFirstLevel.useMutation();
  const rejectFirstLevelMutation = trpc.approvals.rejectFirstLevel.useMutation();
  const approveSecondLevelMutation = trpc.approvals.approveSecondLevel.useMutation();
  const rejectSecondLevelMutation = trpc.approvals.rejectSecondLevel.useMutation();

  useEffect(() => {
    if (approvalsQuery.data) {
      setApprovals(approvalsQuery.data);
      loadOperations();
    }
  }, [approvalsQuery.data]);

  const loadOperations = async () => {
    setLoading(true);
    await new Promise((resolve) => setTimeout(resolve, 500));

    const mockOperations: MockPendingOperation[] = [
      {
        id: 1,
        code: "OP-2026-001",
        operationType: "addition",
        vehicleName: "سيارة 1",
        partName: "إطار",
        quantity: 4,
        driverName: "أحمد محمد",
        createdAt: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
        firstLevelStatus: "pending",
        secondLevelStatus: "pending",
        requestedByName: "محمد علي",
      },
      {
        id: 2,
        code: "OP-2026-002",
        operationType: "consumption",
        vehicleName: "سيارة 2",
        partName: "زيت محرك",
        quantity: 2,
        driverName: "سارة أحمد",
        createdAt: new Date(Date.now() - 1000 * 60 * 60).toISOString(),
        firstLevelStatus: "approved",
        secondLevelStatus: "pending",
        requestedByName: "فاطمة محمود",
      },
    ];

    setOperations(mockOperations);
    setLoading(false);
  };

  useEffect(() => {
    let filtered = operations;

    if (filterStatus === "pending") {
      filtered = filtered.filter(
        (op) =>
          op.firstLevelStatus === "pending" || op.secondLevelStatus === "pending"
      );
    } else if (filterStatus === "approved") {
      filtered = filtered.filter(
        (op) =>
          op.firstLevelStatus === "approved" &&
          op.secondLevelStatus === "approved"
      );
    } else if (filterStatus === "rejected") {
      filtered = filtered.filter(
        (op) =>
          op.firstLevelStatus === "rejected" ||
          op.secondLevelStatus === "rejected"
      );
    }

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (op) =>
          op.code.toLowerCase().includes(query) ||
          op.vehicleName.toLowerCase().includes(query) ||
          op.partName.toLowerCase().includes(query)
      );
    }

    setFilteredOperations(filtered);
  }, [operations, searchQuery, filterStatus]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadOperations();
    setRefreshing(false);
  };

  const handleOperationPress = (operationId: number) => {
    const operation = operations.find((op) => op.id === operationId);
    if (operation) {
      const currentLevel =
        operation.firstLevelStatus === "pending" ? (1 as const) : (2 as const);

      setSelectedOperation({
        operationId: operation.id,
        operationCode: operation.code,
        operationType: operation.operationType,
        vehicleName: operation.vehicleName,
        partName: operation.partName,
        quantity: operation.quantity,
        driverName: operation.driverName,
        createdAt: operation.createdAt,
        requestedByName: operation.requestedByName,
        currentApprovalLevel: currentLevel,
      });
      setReviewModalVisible(true);
    }
  };

  const handleApprove = async (operationId: number, notes: string) => {
    setReviewLoading(true);
    await new Promise((resolve) => setTimeout(resolve, 1000));

    setOperations((prevOps) =>
      prevOps.map((op) => {
        if (op.id === operationId) {
          return {
            ...op,
            firstLevelStatus:
              op.firstLevelStatus === "pending" ? "approved" : op.firstLevelStatus,
            secondLevelStatus:
              op.secondLevelStatus === "pending" ? "approved" : op.secondLevelStatus,
          };
        }
        return op;
      })
    );

    setReviewLoading(false);
    setReviewModalVisible(false);

    Alert.alert("نجح", "تمت الموافقة على العملية بنجاح");
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  };

  const handleReject = async (operationId: number, reason: string) => {
    setReviewLoading(true);
    await new Promise((resolve) => setTimeout(resolve, 1000));

    setOperations((prevOps) =>
      prevOps.map((op) => {
        if (op.id === operationId) {
          return {
            ...op,
            firstLevelStatus:
              op.firstLevelStatus === "pending" ? "rejected" : op.firstLevelStatus,
            secondLevelStatus:
              op.secondLevelStatus === "pending" ? "rejected" : op.secondLevelStatus,
          };
        }
        return op;
      })
    );

    setReviewLoading(false);
    setReviewModalVisible(false);

    Alert.alert("تم", "تم رفض العملية");
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
  };

  const pendingCount = operations.filter(
    (op) =>
      op.firstLevelStatus === "pending" || op.secondLevelStatus === "pending"
  ).length;

  const handleApproveFirstLevel = async (approvalId: number) => {
    try {
      setLoading(true);
      await approveFirstLevelMutation.mutateAsync({ approvalId });
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      approvalsQuery.refetch();
    } catch (error) {
      Alert.alert("خطأ", "فشل الموافقة على العملية");
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    } finally {
      setLoading(false);
    }
  };

  const handleRejectFirstLevel = async (approvalId: number) => {
    Alert.prompt(
      "رفض العملية",
      "أدخل سبب الرفض",
      async (reason) => {
        if (!reason.trim()) return;
        try {
          setLoading(true);
          await rejectFirstLevelMutation.mutateAsync({ approvalId, reason });
          await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
          approvalsQuery.refetch();
        } catch (error) {
          Alert.alert("خطأ", "فشل رفض العملية");
          await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
        } finally {
          setLoading(false);
        }
      }
    );
  };

  const handleApproveSecondLevel = async (approvalId: number) => {
    try {
      setLoading(true);
      await approveSecondLevelMutation.mutateAsync({ approvalId });
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      approvalsQuery.refetch();
    } catch (error) {
      Alert.alert("خطأ", "فشل الموافقة على العملية");
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    } finally {
      setLoading(false);
    }
  };

  const handleRejectSecondLevel = async (approvalId: number) => {
    Alert.prompt(
      "رفض العملية",
      "أدخل سبب الرفض",
      async (reason) => {
        if (!reason.trim()) return;
        try {
          setLoading(true);
          await rejectSecondLevelMutation.mutateAsync({ approvalId, reason });
          await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
          approvalsQuery.refetch();
        } catch (error) {
          Alert.alert("خطأ", "فشل رفض العملية");
          await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
        } finally {
          setLoading(false);
        }
      }
    );
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return { label: "قيد الانتظار", color: colors.warning, icon: "⏳" };
      case "approved":
        return { label: "موافق", color: colors.success, icon: "✅" };
      case "rejected":
        return { label: "مرفوض", color: colors.error, icon: "❌" };
      default:
        return { label: "غير معروف", color: colors.muted, icon: "❓" };
    }
  };

  const renderApprovalItem = ({ item }: { item: Approval }) => {
    const firstLevelStatus = getStatusBadge(item.firstLevelStatus);
    const secondLevelStatus = getStatusBadge(item.secondLevelStatus);
    const needsFirstLevel = item.firstLevelStatus === "pending";
    const needsSecondLevel = item.secondLevelStatus === "pending" && item.firstLevelStatus === "approved";

    return (
      <View
        style={{
          backgroundColor: colors.surface,
          borderRadius: 12,
          padding: 12,
          marginHorizontal: 16,
          marginVertical: 6,
          borderWidth: 1,
          borderColor: colors.border,
        }}
      >
        {/* Operation Info */}
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
              fontSize: 14,
              fontWeight: "600",
              color: colors.foreground,
            }}
          >
            العملية #{item.operationId}
          </Text>
          <Text
            style={{
              fontSize: 11,
              color: colors.muted,
            }}
          >
            {new Date(item.createdAt).toLocaleDateString("ar-SA")}
          </Text>
        </View>

        {/* First Level Approval */}
        <View
          style={{
            backgroundColor: colors.background,
            borderRadius: 8,
            padding: 10,
            marginBottom: 12,
            borderLeftWidth: 3,
            borderLeftColor: firstLevelStatus.color,
          }}
        >
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
                fontSize: 12,
                fontWeight: "600",
                color: colors.foreground,
              }}
            >
              المستوى الأول
            </Text>
            <View
              style={{
                backgroundColor: firstLevelStatus.color,
                paddingHorizontal: 8,
                paddingVertical: 4,
                borderRadius: 6,
              }}
            >
              <Text
                style={{
                  fontSize: 10,
                  fontWeight: "600",
                  color: "#ffffff",
                }}
              >
                {firstLevelStatus.icon} {firstLevelStatus.label}
              </Text>
            </View>
          </View>

          {needsFirstLevel && (
            <View
              style={{
                flexDirection: "row",
                gap: 8,
              }}
            >
              <Pressable
                onPress={() => handleApproveFirstLevel(item.id)}
                disabled={loading}
                style={({ pressed }) => [
                  {
                    flex: 1,
                    backgroundColor: colors.success,
                    paddingVertical: 8,
                    borderRadius: 6,
                    alignItems: "center",
                    opacity: pressed || loading ? 0.7 : 1,
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
                  ✅ موافق
                </Text>
              </Pressable>
              <Pressable
                onPress={() => handleRejectFirstLevel(item.id)}
                disabled={loading}
                style={({ pressed }) => [
                  {
                    flex: 1,
                    backgroundColor: colors.error,
                    paddingVertical: 8,
                    borderRadius: 6,
                    alignItems: "center",
                    opacity: pressed || loading ? 0.7 : 1,
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
                  ❌ رفض
                </Text>
              </Pressable>
            </View>
          )}

          {item.firstLevelApprovalDate && (
            <Text
              style={{
                fontSize: 10,
                color: colors.muted,
                marginTop: 8,
              }}
            >
              تم الموافقة في: {new Date(item.firstLevelApprovalDate).toLocaleDateString("ar-SA")}
            </Text>
          )}

          {item.rejectionReason && item.firstLevelStatus === "rejected" && (
            <Text
              style={{
                fontSize: 10,
                color: colors.error,
                marginTop: 8,
              }}
            >
              السبب: {item.rejectionReason}
            </Text>
          )}
        </View>

        {/* Second Level Approval */}
        <View
          style={{
            backgroundColor: colors.background,
            borderRadius: 8,
            padding: 10,
            borderLeftWidth: 3,
            borderLeftColor: secondLevelStatus.color,
            opacity: item.firstLevelStatus !== "approved" ? 0.5 : 1,
          }}
        >
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
                fontSize: 12,
                fontWeight: "600",
                color: colors.foreground,
              }}
            >
              المستوى الثاني (إداري)
            </Text>
            <View
              style={{
                backgroundColor: secondLevelStatus.color,
                paddingHorizontal: 8,
                paddingVertical: 4,
                borderRadius: 6,
              }}
            >
              <Text
                style={{
                  fontSize: 10,
                  fontWeight: "600",
                  color: "#ffffff",
                }}
              >
                {secondLevelStatus.icon} {secondLevelStatus.label}
              </Text>
            </View>
          </View>

          {needsSecondLevel && (
            <View
              style={{
                flexDirection: "row",
                gap: 8,
              }}
            >
              <Pressable
                onPress={() => handleApproveSecondLevel(item.id)}
                disabled={loading}
                style={({ pressed }) => [
                  {
                    flex: 1,
                    backgroundColor: colors.success,
                    paddingVertical: 8,
                    borderRadius: 6,
                    alignItems: "center",
                    opacity: pressed || loading ? 0.7 : 1,
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
                  ✅ موافق
                </Text>
              </Pressable>
              <Pressable
                onPress={() => handleRejectSecondLevel(item.id)}
                disabled={loading}
                style={({ pressed }) => [
                  {
                    flex: 1,
                    backgroundColor: colors.error,
                    paddingVertical: 8,
                    borderRadius: 6,
                    alignItems: "center",
                    opacity: pressed || loading ? 0.7 : 1,
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
                  ❌ رفض
                </Text>
              </Pressable>
            </View>
          )}

          {item.secondLevelApprovalDate && (
            <Text
              style={{
                fontSize: 10,
                color: colors.muted,
                marginTop: 8,
              }}
            >
              تم الموافقة في: {new Date(item.secondLevelApprovalDate).toLocaleDateString("ar-SA")}
            </Text>
          )}
        </View>
      </View>
    );
  };

  return (
    <ScreenContainer className="bg-background">
      <View style={{ flex: 1 }}>
        {/* Header */}
        <View style={{ paddingHorizontal: 16, paddingTop: 16, paddingBottom: 12 }}>
          <Text
            style={{
              fontSize: 24,
              fontWeight: "700",
              color: colors.foreground,
              marginBottom: 8,
            }}
          >
            الموافقات
          </Text>
          <Text
            style={{
              fontSize: 12,
              color: colors.muted,
              marginBottom: 16,
            }}
          >
            نظام الموافقات متعدد المستويات
          </Text>

          {/* Stats */}
          <View
            style={{
              backgroundColor: colors.surface,
              borderRadius: 10,
              padding: 12,
              borderWidth: 1,
              borderColor: colors.border,
            }}
          >
            <Text
              style={{
                fontSize: 12,
                fontWeight: "600",
                color: colors.foreground,
                marginBottom: 8,
              }}
            >
              الموافقات المعلقة
            </Text>
            <Text
              style={{
                fontSize: 20,
                fontWeight: "700",
                color: colors.warning,
              }}
            >
              {approvals.length}
            </Text>
          </View>
        </View>

        {/* Approvals List */}
        {approvals.length > 0 ? (
          <FlatList
            data={approvals}
            renderItem={renderApprovalItem}
            keyExtractor={(item) => item.id.toString()}
            contentContainerStyle={{ paddingBottom: 32 }}
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
            <Text
              style={{
                fontSize: 48,
                marginBottom: 16,
              }}
            >
              ✅
            </Text>
            <Text
              style={{
                fontSize: 16,
                fontWeight: "600",
                color: colors.foreground,
                marginBottom: 8,
                textAlign: "center",
              }}
            >
              لا توجد موافقات معلقة
            </Text>
            <Text
              style={{
                fontSize: 14,
                color: colors.muted,
                textAlign: "center",
              }}
            >
              جميع الموافقات تمت معالجتها
            </Text>
          </View>
        )}
      </View>
    </ScreenContainer>
  );
}

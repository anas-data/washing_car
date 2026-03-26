import { ScrollView, Text, View, Pressable, FlatList, I18nManager } from "react-native";
import { useEffect, useState } from "react";
import { ScreenContainer } from "@/components/screen-container";
import { useColors } from "@/hooks/use-colors";
import { trpc } from "@/lib/trpc";
import { useRouter } from "expo-router";
import * as Haptics from "expo-haptics";

I18nManager.forceRTL(true);

interface Operation {
  id: number;
  code: string;
  operationType: "addition" | "consumption";
  quantity: number;
  driverName: string;
  status: "pending" | "approved" | "rejected";
  operationDate: Date;
  notes?: string | null;
}

export default function OperationsScreen() {
  const colors = useColors();
  const router = useRouter();
  const [selectedStatus, setSelectedStatus] = useState<string | null>("pending");
  const [filteredOperations, setFilteredOperations] = useState<Operation[]>([]);

  const operationsQuery = trpc.operations.list.useQuery();

  useEffect(() => {
    if (!operationsQuery.data) return;

    let filtered = operationsQuery.data;

    // Filter by status
    if (selectedStatus) {
      filtered = filtered.filter((op: any) => op.status === selectedStatus);
    }

    // Sort by date (newest first)
    filtered.sort((a: any, b: any) => new Date(b.operationDate).getTime() - new Date(a.operationDate).getTime());

    setFilteredOperations(filtered);
  }, [operationsQuery.data, selectedStatus]);

  const getStatusInfo = (status: string) => {
    switch (status) {
      case "pending":
        return { label: "قيد الانتظار", color: colors.warning, icon: "⏳" };
      case "approved":
        return { label: "موافق عليها", color: colors.success, icon: "✅" };
      case "rejected":
        return { label: "مرفوضة", color: colors.error, icon: "❌" };
      default:
        return { label: "غير معروف", color: colors.muted, icon: "❓" };
    }
  };

  const getOperationTypeInfo = (type: string) => {
    switch (type) {
      case "addition":
        return { label: "إضافة", color: colors.success, icon: "➕" };
      case "consumption":
        return { label: "استهلاك", color: colors.error, icon: "➖" };
      default:
        return { label: "غير معروف", color: colors.muted, icon: "❓" };
    }
  };

  const renderOperationItem = ({ item }: { item: Operation }) => {
    const statusInfo = getStatusInfo(item.status);
    const typeInfo = getOperationTypeInfo(item.operationType);

    return (
      <Pressable
        onPress={() => {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          router.push({
            pathname: "/operations/[id]",
            params: { id: item.id },
          } as any);
        }}
        style={({ pressed }) => [
          {
            backgroundColor: colors.surface,
            borderRadius: 12,
            padding: 12,
            marginHorizontal: 16,
            marginVertical: 6,
            borderLeftWidth: 4,
            borderLeftColor: statusInfo.color,
            opacity: pressed ? 0.7 : 1,
          },
        ]}
      >
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
                fontSize: 14,
                fontWeight: "600",
                color: colors.foreground,
              }}
            >
              {item.code}
            </Text>
            <Text
              style={{
                fontSize: 12,
                color: colors.muted,
                marginTop: 2,
              }}
            >
              {item.driverName}
            </Text>
          </View>
          <View
            style={{
              backgroundColor: statusInfo.color,
              paddingHorizontal: 8,
              paddingVertical: 4,
              borderRadius: 6,
            }}
          >
            <Text
              style={{
                fontSize: 11,
                fontWeight: "600",
                color: "#ffffff",
              }}
            >
              {statusInfo.icon} {statusInfo.label}
            </Text>
          </View>
        </View>

        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: 8,
          }}
        >
          <View
            style={{
              backgroundColor: typeInfo.color,
              paddingHorizontal: 8,
              paddingVertical: 4,
              borderRadius: 6,
            }}
          >
            <Text
              style={{
                fontSize: 11,
                fontWeight: "600",
                color: "#ffffff",
              }}
            >
              {typeInfo.icon} {typeInfo.label}
            </Text>
          </View>
          <Text
            style={{
              fontSize: 16,
              fontWeight: "700",
              color: colors.foreground,
            }}
          >
            {item.quantity} وحدة
          </Text>
        </View>

        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
          }}
        >
          <Text
            style={{
              fontSize: 11,
              color: colors.muted,
            }}
          >
            {new Date(item.operationDate).toLocaleDateString("ar-SA")}
          </Text>
          {item.notes && (
            <Text
              style={{
                fontSize: 11,
                color: colors.muted,
              }}
            >
              ملاحظات: {item.notes.substring(0, 20)}...
            </Text>
          )}
        </View>
      </Pressable>
    );
  };

  const pendingCount = operationsQuery.data?.filter((o: any) => o.status === "pending").length || 0;
  const approvedCount = operationsQuery.data?.filter((o: any) => o.status === "approved").length || 0;
  const rejectedCount = operationsQuery.data?.filter((o: any) => o.status === "rejected").length || 0;

  return (
    <ScreenContainer className="bg-background">
      <View style={{ flex: 1 }}>
        {/* Header */}
        <View style={{ paddingHorizontal: 16, paddingTop: 16, paddingBottom: 12 }}>
          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: 16,
            }}
          >
            <Text
              style={{
                fontSize: 24,
                fontWeight: "700",
                color: colors.foreground,
              }}
            >
              العمليات
            </Text>
            <Pressable
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                router.push("/operations/new");
              }}
              style={({ pressed }) => [
                {
                  backgroundColor: colors.primary,
                  paddingHorizontal: 12,
                  paddingVertical: 8,
                  borderRadius: 8,
                  opacity: pressed ? 0.7 : 1,
                },
              ]}
            >
              <Text
                style={{
                  color: "#ffffff",
                  fontSize: 14,
                  fontWeight: "600",
                }}
              >
                ➕ جديدة
              </Text>
            </Pressable>
          </View>

          {/* Status Filter */}
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={{ marginBottom: 12 }}
          >
            <Pressable
              onPress={() => setSelectedStatus(null)}
              style={({ pressed }) => [
                {
                  paddingHorizontal: 12,
                  paddingVertical: 6,
                  borderRadius: 20,
                  marginRight: 8,
                  backgroundColor:
                    selectedStatus === null ? colors.primary : colors.surface,
                  opacity: pressed ? 0.7 : 1,
                },
              ]}
            >
              <Text
                style={{
                  color: selectedStatus === null ? "#ffffff" : colors.foreground,
                  fontSize: 12,
                  fontWeight: "600",
                }}
              >
                الكل ({operationsQuery.data?.length || 0})
              </Text>
            </Pressable>

            <Pressable
              onPress={() => setSelectedStatus("pending")}
              style={({ pressed }) => [
                {
                  paddingHorizontal: 12,
                  paddingVertical: 6,
                  borderRadius: 20,
                  marginRight: 8,
                  backgroundColor:
                    selectedStatus === "pending" ? colors.warning : colors.surface,
                  opacity: pressed ? 0.7 : 1,
                },
              ]}
            >
              <Text
                style={{
                  color: selectedStatus === "pending" ? "#ffffff" : colors.foreground,
                  fontSize: 12,
                  fontWeight: "600",
                }}
              >
                ⏳ قيد الانتظار ({pendingCount})
              </Text>
            </Pressable>

            <Pressable
              onPress={() => setSelectedStatus("approved")}
              style={({ pressed }) => [
                {
                  paddingHorizontal: 12,
                  paddingVertical: 6,
                  borderRadius: 20,
                  marginRight: 8,
                  backgroundColor:
                    selectedStatus === "approved" ? colors.success : colors.surface,
                  opacity: pressed ? 0.7 : 1,
                },
              ]}
            >
              <Text
                style={{
                  color:
                    selectedStatus === "approved" ? "#ffffff" : colors.foreground,
                  fontSize: 12,
                  fontWeight: "600",
                }}
              >
                ✅ موافق ({approvedCount})
              </Text>
            </Pressable>

            <Pressable
              onPress={() => setSelectedStatus("rejected")}
              style={({ pressed }) => [
                {
                  paddingHorizontal: 12,
                  paddingVertical: 6,
                  borderRadius: 20,
                  marginRight: 8,
                  backgroundColor:
                    selectedStatus === "rejected" ? colors.error : colors.surface,
                  opacity: pressed ? 0.7 : 1,
                },
              ]}
            >
              <Text
                style={{
                  color: selectedStatus === "rejected" ? "#ffffff" : colors.foreground,
                  fontSize: 12,
                  fontWeight: "600",
                }}
              >
                ❌ مرفوض ({rejectedCount})
              </Text>
            </Pressable>
          </ScrollView>

          {/* Stats */}
          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              backgroundColor: colors.surface,
              borderRadius: 10,
              padding: 12,
              borderWidth: 1,
              borderColor: colors.border,
            }}
          >
            <View>
              <Text
                style={{
                  fontSize: 11,
                  color: colors.muted,
                }}
              >
                إجمالي
              </Text>
              <Text
                style={{
                  fontSize: 16,
                  fontWeight: "700",
                  color: colors.foreground,
                }}
              >
                {operationsQuery.data?.length || 0}
              </Text>
            </View>
            <View>
              <Text
                style={{
                  fontSize: 11,
                  color: colors.muted,
                }}
              >
                قيد الانتظار
              </Text>
              <Text
                style={{
                  fontSize: 16,
                  fontWeight: "700",
                  color: colors.warning,
                }}
              >
                {pendingCount}
              </Text>
            </View>
            <View>
              <Text
                style={{
                  fontSize: 11,
                  color: colors.muted,
                }}
              >
                موافق
              </Text>
              <Text
                style={{
                  fontSize: 16,
                  fontWeight: "700",
                  color: colors.success,
                }}
              >
                {approvedCount}
              </Text>
            </View>
            <View>
              <Text
                style={{
                  fontSize: 11,
                  color: colors.muted,
                }}
              >
                مرفوض
              </Text>
              <Text
                style={{
                  fontSize: 16,
                  fontWeight: "700",
                  color: colors.error,
                }}
              >
                {rejectedCount}
              </Text>
            </View>
          </View>
        </View>

        {/* Operations List */}
        {filteredOperations.length > 0 ? (
          <FlatList
            data={filteredOperations}
            renderItem={renderOperationItem}
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
              📋
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
              لا توجد عمليات
            </Text>
            <Text
              style={{
                fontSize: 14,
                color: colors.muted,
                textAlign: "center",
              }}
            >
              لا توجد عمليات بهذه الحالة
            </Text>
          </View>
        )}
      </View>
    </ScreenContainer>
  );
}

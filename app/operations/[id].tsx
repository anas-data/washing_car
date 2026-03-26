import {
  ScrollView,
  Text,
  View,
  Pressable,
  TextInput,
  Alert,
  I18nManager,
} from "react-native";
import { useState } from "react";
import { ScreenContainer } from "@/components/screen-container";
import { useColors } from "@/hooks/use-colors";
import { useLocalSearchParams, useRouter } from "expo-router";
import { trpc } from "@/lib/trpc";
import * as Haptics from "expo-haptics";

I18nManager.forceRTL(true);

export default function OperationDetailScreen() {
  const colors = useColors();
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const operationId = parseInt(id as string);

  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);

  // Fetch operation data
  const operationQuery = trpc.operations.getById.useQuery({ id: operationId });
  const updateStatusMutation = trpc.operations.updateStatus.useMutation();

  // Form state
  const [formData, setFormData] = useState({
    quantity: (operationQuery.data?.quantity || 0).toString(),
    driverName: operationQuery.data?.driverName || "",
    notes: operationQuery.data?.notes || "",
  });

  const operation = operationQuery.data;

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

  const handleApprove = async () => {
    Alert.alert(
      "تأكيد الموافقة",
      `هل أنت متأكد من رغبتك في الموافقة على العملية #${operation?.code}؟`,
      [
        {
          text: "إلغاء",
          onPress: () => {},
          style: "cancel",
        },
        {
          text: "موافقة",
          onPress: async () => {
            try {
              setLoading(true);
              await updateStatusMutation.mutateAsync({
                id: operationId,
                status: "approved",
              });
              await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
              Alert.alert("نجاح", "تم الموافقة على العملية بنجاح");
              operationQuery.refetch();
            } catch (error) {
              Alert.alert("خطأ", "فشل الموافقة على العملية");
              await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
            } finally {
              setLoading(false);
            }
          },
        },
      ]
    );
  };

  const handleReject = async () => {
    Alert.alert(
      "تأكيد الرفض",
      `هل أنت متأكد من رغبتك في رفض العملية #${operation?.code}؟`,
      [
        {
          text: "إلغاء",
          onPress: () => {},
          style: "cancel",
        },
        {
          text: "رفض",
          onPress: async () => {
            try {
              setLoading(true);
              await updateStatusMutation.mutateAsync({
                id: operationId,
                status: "rejected",
              });
              await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
              Alert.alert("نجاح", "تم رفض العملية بنجاح");
              operationQuery.refetch();
            } catch (error) {
              Alert.alert("خطأ", "فشل رفض العملية");
              await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
            } finally {
              setLoading(false);
            }
          },
          style: "destructive",
        },
      ]
    );
  };

  if (operationQuery.isLoading) {
    return (
      <ScreenContainer className="bg-background">
        <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
          <Text style={{ color: colors.foreground, fontSize: 16 }}>جاري التحميل...</Text>
        </View>
      </ScreenContainer>
    );
  }

  if (!operation) {
    return (
      <ScreenContainer className="bg-background">
        <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
          <Text style={{ color: colors.error, fontSize: 16 }}>لم يتم العثور على العملية</Text>
        </View>
      </ScreenContainer>
    );
  }

  const statusInfo = getStatusInfo(operation.status);
  const typeInfo = getOperationTypeInfo(operation.operationType);

  return (
    <ScreenContainer className="bg-background">
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
            paddingHorizontal: 16,
            paddingTop: 16,
            paddingBottom: 12,
          }}
        >
          <Pressable
            onPress={() => router.back()}
            style={({ pressed }) => [{ opacity: pressed ? 0.7 : 1 }]}
          >
            <Text style={{ fontSize: 24 }}>←</Text>
          </Pressable>
          <Text
            style={{
              fontSize: 20,
              fontWeight: "700",
              color: colors.foreground,
            }}
          >
            تفاصيل العملية
          </Text>
          <View style={{ width: 24 }} />
        </View>

        {/* Status Badges */}
        <View
          style={{
            marginHorizontal: 16,
            marginBottom: 16,
            flexDirection: "row",
            gap: 8,
          }}
        >
          <View
            style={{
              backgroundColor: statusInfo.color,
              paddingHorizontal: 12,
              paddingVertical: 6,
              borderRadius: 8,
            }}
          >
            <Text
              style={{
                color: "#ffffff",
                fontSize: 12,
                fontWeight: "600",
              }}
            >
              {statusInfo.icon} {statusInfo.label}
            </Text>
          </View>
          <View
            style={{
              backgroundColor: typeInfo.color,
              paddingHorizontal: 12,
              paddingVertical: 6,
              borderRadius: 8,
            }}
          >
            <Text
              style={{
                color: "#ffffff",
                fontSize: 12,
                fontWeight: "600",
              }}
            >
              {typeInfo.icon} {typeInfo.label}
            </Text>
          </View>
        </View>

        {/* Content */}
        <View style={{ paddingHorizontal: 16, paddingBottom: 32 }}>
          {!isEditing ? (
            // View Mode
            <>
              <View
                style={{
                  backgroundColor: colors.surface,
                  borderRadius: 12,
                  padding: 16,
                  marginBottom: 16,
                  borderWidth: 1,
                  borderColor: colors.border,
                }}
              >
                <InfoRow label="رقم العملية" value={operation.code} />
                <InfoRow
                  label="التاريخ"
                  value={new Date(operation.operationDate).toLocaleDateString("ar-SA")}
                />
                <InfoRow label="اسم السائق" value={operation.driverName} />
                <InfoRow label="الكمية" value={`${operation.quantity} وحدة`} />

                {operation.notes && (
                  <InfoRow label="الملاحظات" value={operation.notes} />
                )}

                <View
                  style={{
                    marginTop: 16,
                    paddingTop: 16,
                    borderTopWidth: 1,
                    borderTopColor: colors.border,
                  }}
                >
                  <Text
                    style={{
                      fontSize: 12,
                      fontWeight: "600",
                      color: colors.muted,
                      marginBottom: 8,
                    }}
                  >
                    معلومات الموافقة
                  </Text>
                  <View
                    style={{
                      backgroundColor: colors.background,
                      borderRadius: 8,
                      padding: 12,
                      borderWidth: 1,
                      borderColor: colors.border,
                    }}
                  >
                    <Text style={{ fontSize: 11, color: colors.muted, marginBottom: 4 }}>
                      من أنشأها
                    </Text>
                    <Text
                      style={{
                        fontSize: 13,
                        fontWeight: "600",
                        color: colors.foreground,
                        marginBottom: 12,
                      }}
                    >
                      المستخدم #{operation.createdById}
                    </Text>

                    {operation.approvedById && (
                      <>
                        <Text style={{ fontSize: 11, color: colors.muted, marginBottom: 4 }}>
                          من وافق عليها
                        </Text>
                        <Text
                          style={{
                            fontSize: 13,
                            fontWeight: "600",
                            color: colors.foreground,
                          }}
                        >
                          المستخدم #{operation.approvedById}
                        </Text>
                      </>
                    )}
                  </View>
                </View>
              </View>

              {/* Action Buttons */}
              {operation.status === "pending" && (
                <View style={{ gap: 12 }}>
                  <Pressable
                    onPress={handleApprove}
                    disabled={loading}
                    style={({ pressed }) => [
                      {
                        backgroundColor: colors.success,
                        paddingVertical: 12,
                        borderRadius: 8,
                        alignItems: "center",
                        opacity: pressed || loading ? 0.7 : 1,
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
                      ✅ موافقة
                    </Text>
                  </Pressable>

                  <Pressable
                    onPress={handleReject}
                    disabled={loading}
                    style={({ pressed }) => [
                      {
                        backgroundColor: colors.error,
                        paddingVertical: 12,
                        borderRadius: 8,
                        alignItems: "center",
                        opacity: pressed || loading ? 0.7 : 1,
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
                      ❌ رفض
                    </Text>
                  </Pressable>
                </View>
              )}
            </>
          ) : null}
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  const colors = useColors();
  return (
    <View
      style={{
        marginBottom: 12,
        paddingBottom: 12,
        borderBottomWidth: 1,
        borderBottomColor: colors.border,
      }}
    >
      <Text style={{ fontSize: 11, color: colors.muted, marginBottom: 4 }}>{label}</Text>
      <Text style={{ fontSize: 14, fontWeight: "600", color: colors.foreground }}>
        {value}
      </Text>
    </View>
  );
}

function FormField({
  label,
  value,
  onChangeText,
  colors,
  multiline,
  keyboardType,
}: {
  label: string;
  value: string;
  onChangeText: (text: string) => void;
  colors: any;
  multiline?: boolean;
  keyboardType?: string;
}) {
  return (
    <View style={{ marginBottom: 16 }}>
      <Text style={{ fontSize: 12, color: colors.muted, marginBottom: 6, fontWeight: "600" }}>
        {label}
      </Text>
      <TextInput
        value={value}
        onChangeText={onChangeText}
        multiline={multiline}
        keyboardType={keyboardType as any}
        style={{
          backgroundColor: colors.background,
          borderWidth: 1,
          borderColor: colors.border,
          borderRadius: 6,
          paddingHorizontal: 12,
          paddingVertical: 10,
          color: colors.foreground,
          fontSize: 14,
          minHeight: multiline ? 80 : 40,
          textAlignVertical: multiline ? "top" : "center",
        }}
        placeholderTextColor={colors.muted}
      />
    </View>
  );
}

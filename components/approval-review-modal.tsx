import {
  View,
  Text,
  Pressable,
  Modal,
  ScrollView,
  TextInput,
  Alert,
} from "react-native";
import { useState } from "react";
import { useColors } from "@/hooks/use-colors";
import * as Haptics from "expo-haptics";

export interface ApprovalReviewData {
  operationId: number;
  operationCode: string;
  operationType: "addition" | "consumption";
  vehicleName: string;
  partName: string;
  quantity: number;
  driverName: string;
  createdAt: string;
  requestedByName: string;
  currentApprovalLevel: 1 | 2;
}

interface ApprovalReviewModalProps {
  visible: boolean;
  operation: ApprovalReviewData | null;
  onClose: () => void;
  onApprove: (operationId: number, notes: string) => void;
  onReject: (operationId: number, reason: string) => void;
  loading?: boolean;
}

/**
 * Approval Review Modal Component
 *
 * Modal for reviewing and approving/rejecting operations
 */
export function ApprovalReviewModal({
  visible,
  operation,
  onClose,
  onApprove,
  onReject,
  loading = false,
}: ApprovalReviewModalProps) {
  const colors = useColors();
  const [notes, setNotes] = useState("");
  const [rejectionReason, setRejectionReason] = useState("");
  const [action, setAction] = useState<"approve" | "reject" | null>(null);

  const handleApprove = () => {
    if (!notes.trim()) {
      Alert.alert("تنبيه", "يرجى إضافة ملاحظات قبل الموافقة");
      return;
    }

    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    onApprove(operation!.operationId, notes);
    resetForm();
  };

  const handleReject = () => {
    if (!rejectionReason.trim()) {
      Alert.alert("تنبيه", "يرجى إضافة مبرر الرفض");
      return;
    }

    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    onReject(operation!.operationId, rejectionReason);
    resetForm();
  };

  const resetForm = () => {
    setNotes("");
    setRejectionReason("");
    setAction(null);
    onClose();
  };

  if (!operation) return null;

  const getOperationTypeLabel = (type: string) => {
    return type === "addition" ? "إضافة" : "استهلاك";
  };

  const getOperationTypeColor = (type: string) => {
    return type === "addition" ? colors.success : colors.warning;
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View
        style={{
          flex: 1,
          backgroundColor: "rgba(0, 0, 0, 0.5)",
          justifyContent: "flex-end",
        }}
      >
        <View
          style={{
            backgroundColor: colors.background,
            borderTopLeftRadius: 20,
            borderTopRightRadius: 20,
            maxHeight: "90%",
            paddingTop: 16,
          }}
        >
          {/* Header */}
          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              alignItems: "center",
              paddingHorizontal: 16,
              paddingBottom: 12,
              borderBottomWidth: 1,
              borderBottomColor: colors.border,
            }}
          >
            <Text
              style={{
                fontSize: 18,
                fontWeight: "700",
                color: colors.foreground,
              }}
            >
              مراجعة العملية
            </Text>
            <Pressable
              onPress={onClose}
              style={({ pressed }) => [
                {
                  width: 32,
                  height: 32,
                  borderRadius: 16,
                  backgroundColor: colors.surface,
                  alignItems: "center",
                  justifyContent: "center",
                  opacity: pressed ? 0.7 : 1,
                },
              ]}
            >
              <Text
                style={{
                  fontSize: 18,
                  color: colors.foreground,
                }}
              >
                ✕
              </Text>
            </Pressable>
          </View>

          <ScrollView
            contentContainerStyle={{ flexGrow: 1 }}
            showsVerticalScrollIndicator={false}
          >
            {/* Operation Code */}
            <View
              style={{
                paddingHorizontal: 16,
                paddingTop: 16,
                paddingBottom: 8,
              }}
            >
              <Text
                style={{
                  fontSize: 12,
                  color: colors.muted,
                  marginBottom: 4,
                }}
              >
                رقم العملية
              </Text>
              <Text
                style={{
                  fontSize: 16,
                  fontWeight: "600",
                  color: colors.foreground,
                }}
              >
                {operation.operationCode}
              </Text>
            </View>

            {/* Operation Details Card */}
            <View
              style={{
                marginHorizontal: 16,
                marginTop: 12,
                marginBottom: 16,
                backgroundColor: colors.surface,
                borderRadius: 12,
                padding: 12,
              }}
            >
              <View
                style={{
                  flexDirection: "row",
                  justifyContent: "space-between",
                  marginBottom: 10,
                }}
              >
                <Text
                  style={{
                    fontSize: 11,
                    color: colors.muted,
                  }}
                >
                  النوع
                </Text>
                <View
                  style={{
                    backgroundColor: getOperationTypeColor(
                      operation.operationType
                    ),
                    borderRadius: 6,
                    paddingHorizontal: 8,
                    paddingVertical: 4,
                  }}
                >
                  <Text
                    style={{
                      fontSize: 11,
                      fontWeight: "600",
                      color: "#ffffff",
                    }}
                  >
                    {getOperationTypeLabel(operation.operationType)}
                  </Text>
                </View>
              </View>

              <View
                style={{
                  flexDirection: "row",
                  justifyContent: "space-between",
                  marginBottom: 10,
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
                  marginBottom: 10,
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
                  marginBottom: 10,
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

              <View
                style={{
                  flexDirection: "row",
                  justifyContent: "space-between",
                  marginBottom: 10,
                }}
              >
                <Text
                  style={{
                    fontSize: 11,
                    color: colors.muted,
                  }}
                >
                  السائق
                </Text>
                <Text
                  style={{
                    fontSize: 11,
                    fontWeight: "600",
                    color: colors.foreground,
                  }}
                >
                  {operation.driverName}
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
                  المستوى الحالي
                </Text>
                <Text
                  style={{
                    fontSize: 11,
                    fontWeight: "600",
                    color: colors.primary,
                  }}
                >
                  المستوى {operation.currentApprovalLevel}
                </Text>
              </View>
            </View>

            {/* Action Selection */}
            {action === null ? (
              <View
                style={{
                  paddingHorizontal: 16,
                  paddingBottom: 16,
                }}
              >
                <Text
                  style={{
                    fontSize: 12,
                    fontWeight: "600",
                    color: colors.muted,
                    marginBottom: 12,
                  }}
                >
                  اختر الإجراء
                </Text>

                <Pressable
                  onPress={() => setAction("approve")}
                  style={({ pressed }) => [
                    {
                      backgroundColor: colors.success,
                      borderRadius: 12,
                      paddingVertical: 12,
                      alignItems: "center",
                      marginBottom: 8,
                      opacity: pressed ? 0.85 : 1,
                    },
                  ]}
                >
                  <Text
                    style={{
                      fontSize: 14,
                      fontWeight: "600",
                      color: "#ffffff",
                    }}
                  >
                    ✓ الموافقة
                  </Text>
                </Pressable>

                <Pressable
                  onPress={() => setAction("reject")}
                  style={({ pressed }) => [
                    {
                      backgroundColor: colors.error,
                      borderRadius: 12,
                      paddingVertical: 12,
                      alignItems: "center",
                      opacity: pressed ? 0.85 : 1,
                    },
                  ]}
                >
                  <Text
                    style={{
                      fontSize: 14,
                      fontWeight: "600",
                      color: "#ffffff",
                    }}
                  >
                    ✕ الرفض
                  </Text>
                </Pressable>
              </View>
            ) : action === "approve" ? (
              <View
                style={{
                  paddingHorizontal: 16,
                  paddingBottom: 16,
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
                  ملاحظات الموافقة
                </Text>

                <TextInput
                  placeholder="أضف ملاحظاتك هنا..."
                  placeholderTextColor={colors.muted}
                  value={notes}
                  onChangeText={setNotes}
                  multiline={true}
                  numberOfLines={4}
                  style={{
                    backgroundColor: colors.surface,
                    borderRadius: 8,
                    borderWidth: 1,
                    borderColor: colors.border,
                    paddingHorizontal: 12,
                    paddingVertical: 10,
                    color: colors.foreground,
                    fontSize: 13,
                    textAlignVertical: "top",
                    marginBottom: 12,
                  }}
                />

                <View
                  style={{
                    flexDirection: "row",
                    gap: 8,
                  }}
                >
                  <Pressable
                    onPress={() => setAction(null)}
                    disabled={loading}
                    style={({ pressed }) => [
                      {
                        flex: 1,
                        backgroundColor: colors.surface,
                        borderRadius: 8,
                        paddingVertical: 12,
                        alignItems: "center",
                        borderWidth: 1,
                        borderColor: colors.border,
                        opacity: pressed || loading ? 0.7 : 1,
                      },
                    ]}
                  >
                    <Text
                      style={{
                        fontSize: 14,
                        fontWeight: "600",
                        color: colors.foreground,
                      }}
                    >
                      رجوع
                    </Text>
                  </Pressable>

                  <Pressable
                    onPress={handleApprove}
                    disabled={loading}
                    style={({ pressed }) => [
                      {
                        flex: 1,
                        backgroundColor: colors.success,
                        borderRadius: 8,
                        paddingVertical: 12,
                        alignItems: "center",
                        opacity: pressed || loading ? 0.85 : 1,
                      },
                    ]}
                  >
                    <Text
                      style={{
                        fontSize: 14,
                        fontWeight: "600",
                        color: "#ffffff",
                      }}
                    >
                      {loading ? "جاري..." : "تأكيد الموافقة"}
                    </Text>
                  </Pressable>
                </View>
              </View>
            ) : (
              <View
                style={{
                  paddingHorizontal: 16,
                  paddingBottom: 16,
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
                  مبرر الرفض
                </Text>

                <TextInput
                  placeholder="أدخل سبب الرفض..."
                  placeholderTextColor={colors.muted}
                  value={rejectionReason}
                  onChangeText={setRejectionReason}
                  multiline={true}
                  numberOfLines={4}
                  style={{
                    backgroundColor: colors.surface,
                    borderRadius: 8,
                    borderWidth: 1,
                    borderColor: colors.border,
                    paddingHorizontal: 12,
                    paddingVertical: 10,
                    color: colors.foreground,
                    fontSize: 13,
                    textAlignVertical: "top",
                    marginBottom: 12,
                  }}
                />

                <View
                  style={{
                    flexDirection: "row",
                    gap: 8,
                  }}
                >
                  <Pressable
                    onPress={() => setAction(null)}
                    disabled={loading}
                    style={({ pressed }) => [
                      {
                        flex: 1,
                        backgroundColor: colors.surface,
                        borderRadius: 8,
                        paddingVertical: 12,
                        alignItems: "center",
                        borderWidth: 1,
                        borderColor: colors.border,
                        opacity: pressed || loading ? 0.7 : 1,
                      },
                    ]}
                  >
                    <Text
                      style={{
                        fontSize: 14,
                        fontWeight: "600",
                        color: colors.foreground,
                      }}
                    >
                      رجوع
                    </Text>
                  </Pressable>

                  <Pressable
                    onPress={handleReject}
                    disabled={loading}
                    style={({ pressed }) => [
                      {
                        flex: 1,
                        backgroundColor: colors.error,
                        borderRadius: 8,
                        paddingVertical: 12,
                        alignItems: "center",
                        opacity: pressed || loading ? 0.85 : 1,
                      },
                    ]}
                  >
                    <Text
                      style={{
                        fontSize: 14,
                        fontWeight: "600",
                        color: "#ffffff",
                      }}
                    >
                      {loading ? "جاري..." : "تأكيد الرفض"}
                    </Text>
                  </Pressable>
                </View>
              </View>
            )}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

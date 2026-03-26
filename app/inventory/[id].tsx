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

export default function PartDetailScreen() {
  const colors = useColors();
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const partId = parseInt(id as string);

  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);

  // Fetch part data
  const partQuery = trpc.parts.getById.useQuery({ id: partId });
  const updatePartMutation = trpc.parts.update.useMutation();
  const deletePartMutation = trpc.parts.delete.useMutation();

  // Form state
  const [formData, setFormData] = useState({
    name: partQuery.data?.name || "",
    description: partQuery.data?.description || "",
    quantityAvailable: (partQuery.data?.quantityAvailable || 0).toString(),
    quantityRequired: (partQuery.data?.quantityRequired || 0).toString(),
    alertThreshold: (partQuery.data?.alertThreshold || 0).toString(),
    cost: partQuery.data?.cost || "",
  });

  const part = partQuery.data;

  const getStockStatus = () => {
    if (!part) return { status: "unknown", color: colors.muted, label: "غير معروف" };
    if (part.quantityAvailable <= part.alertThreshold) {
      return { status: "low", color: colors.error, label: "حد تنبيه" };
    }
    if (part.quantityAvailable < part.quantityRequired) {
      return { status: "warning", color: colors.warning, label: "ناقص" };
    }
    return { status: "good", color: colors.success, label: "متوفر" };
  };

  const handleSave = async () => {
    if (!formData.name.trim()) {
      Alert.alert("خطأ", "يرجى ملء اسم القطعة");
      return;
    }

    try {
      setLoading(true);
      await updatePartMutation.mutateAsync({
        id: partId,
        data: {
          name: formData.name,
          description: formData.description,
          quantityAvailable: parseInt(formData.quantityAvailable) || 0,
          quantityRequired: parseInt(formData.quantityRequired) || 0,
          alertThreshold: parseInt(formData.alertThreshold) || 0,
          cost: formData.cost,
        },
      });
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      Alert.alert("نجاح", "تم تحديث بيانات القطعة بنجاح");
      setIsEditing(false);
      partQuery.refetch();
    } catch (error) {
      Alert.alert("خطأ", "فشل تحديث بيانات القطعة");
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = () => {
    Alert.alert(
      "تأكيد الحذف",
      `هل أنت متأكد من رغبتك في حذف القطعة "${part?.name}"؟\nهذا الإجراء لا يمكن التراجع عنه.`,
      [
        {
          text: "إلغاء",
          onPress: () => {},
          style: "cancel",
        },
        {
          text: "حذف",
          onPress: async () => {
            try {
              setLoading(true);
              await deletePartMutation.mutateAsync({ id: partId });
              await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
              Alert.alert("نجاح", "تم حذف القطعة بنجاح");
              router.back();
            } catch (error) {
              Alert.alert("خطأ", "فشل حذف القطعة");
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

  if (partQuery.isLoading) {
    return (
      <ScreenContainer className="bg-background">
        <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
          <Text style={{ color: colors.foreground, fontSize: 16 }}>جاري التحميل...</Text>
        </View>
      </ScreenContainer>
    );
  }

  if (!part) {
    return (
      <ScreenContainer className="bg-background">
        <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
          <Text style={{ color: colors.error, fontSize: 16 }}>لم يتم العثور على القطعة</Text>
        </View>
      </ScreenContainer>
    );
  }

  const stockStatus = getStockStatus();

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
            تفاصيل القطعة
          </Text>
          <View style={{ width: 24 }} />
        </View>

        {/* Status Badge */}
        <View
          style={{
            marginHorizontal: 16,
            marginBottom: 16,
          }}
        >
          <View
            style={{
              backgroundColor: stockStatus.color,
              paddingHorizontal: 12,
              paddingVertical: 6,
              borderRadius: 8,
              alignSelf: "flex-start",
            }}
          >
            <Text
              style={{
                color: "#ffffff",
                fontSize: 12,
                fontWeight: "600",
              }}
            >
              {stockStatus.label}
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
                <InfoRow label="اسم القطعة" value={part.name} />
                <InfoRow label="الكود" value={part.code} />
                <InfoRow label="الفئة" value={part.category} />
                {part.description && (
                  <InfoRow label="الوصف" value={part.description} />
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
                      fontSize: 14,
                      fontWeight: "700",
                      color: colors.foreground,
                      marginBottom: 12,
                    }}
                  >
                    معلومات المخزون
                  </Text>

                  <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
                    <View>
                      <Text style={{ fontSize: 11, color: colors.muted, marginBottom: 4 }}>
                        المتوفر
                      </Text>
                      <Text
                        style={{
                          fontSize: 18,
                          fontWeight: "700",
                          color: colors.foreground,
                        }}
                      >
                        {part.quantityAvailable}
                      </Text>
                      <Text style={{ fontSize: 10, color: colors.muted }}>
                        {part.unit}
                      </Text>
                    </View>
                    <View>
                      <Text style={{ fontSize: 11, color: colors.muted, marginBottom: 4 }}>
                        المطلوب
                      </Text>
                      <Text
                        style={{
                          fontSize: 18,
                          fontWeight: "700",
                          color: colors.foreground,
                        }}
                      >
                        {part.quantityRequired}
                      </Text>
                      <Text style={{ fontSize: 10, color: colors.muted }}>
                        {part.unit}
                      </Text>
                    </View>
                    <View>
                      <Text style={{ fontSize: 11, color: colors.muted, marginBottom: 4 }}>
                        حد التنبيه
                      </Text>
                      <Text
                        style={{
                          fontSize: 18,
                          fontWeight: "700",
                          color: colors.error,
                        }}
                      >
                        {part.alertThreshold}
                      </Text>
                      <Text style={{ fontSize: 10, color: colors.muted }}>
                        {part.unit}
                      </Text>
                    </View>
                  </View>
                </View>

                <View
                  style={{
                    marginTop: 16,
                    paddingTop: 16,
                    borderTopWidth: 1,
                    borderTopColor: colors.border,
                  }}
                >
                  <InfoRow label="التكلفة" value={`${part.cost} ريال`} />
                </View>
              </View>

              {/* Action Buttons */}
              <View style={{ gap: 12 }}>
                <Pressable
                  onPress={() => {
                    setFormData({
                      name: part.name,
                      description: part.description || "",
                      quantityAvailable: part.quantityAvailable.toString(),
                      quantityRequired: part.quantityRequired.toString(),
                      alertThreshold: part.alertThreshold.toString(),
                      cost: part.cost,
                    });
                    setIsEditing(true);
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  }}
                  style={({ pressed }) => [
                    {
                      backgroundColor: colors.primary,
                      paddingVertical: 12,
                      borderRadius: 8,
                      alignItems: "center",
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
                    ✏️ تعديل
                  </Text>
                </Pressable>

                <Pressable
                  onPress={handleDelete}
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
                    🗑️ حذف
                  </Text>
                </Pressable>
              </View>
            </>
          ) : (
            // Edit Mode
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
                <FormField
                  label="اسم القطعة"
                  value={formData.name}
                  onChangeText={(text) => setFormData({ ...formData, name: text })}
                  colors={colors}
                />
                <FormField
                  label="الوصف"
                  value={formData.description}
                  onChangeText={(text) => setFormData({ ...formData, description: text })}
                  colors={colors}
                  multiline
                />
                <FormField
                  label="الكمية المتوفرة"
                  value={formData.quantityAvailable}
                  onChangeText={(text) =>
                    setFormData({ ...formData, quantityAvailable: text })
                  }
                  colors={colors}
                  keyboardType="numeric"
                />
                <FormField
                  label="الكمية المطلوبة"
                  value={formData.quantityRequired}
                  onChangeText={(text) =>
                    setFormData({ ...formData, quantityRequired: text })
                  }
                  colors={colors}
                  keyboardType="numeric"
                />
                <FormField
                  label="حد التنبيه"
                  value={formData.alertThreshold}
                  onChangeText={(text) =>
                    setFormData({ ...formData, alertThreshold: text })
                  }
                  colors={colors}
                  keyboardType="numeric"
                />
                <FormField
                  label="التكلفة (ريال)"
                  value={formData.cost}
                  onChangeText={(text) => setFormData({ ...formData, cost: text })}
                  colors={colors}
                  keyboardType="decimal-pad"
                />
              </View>

              {/* Save/Cancel Buttons */}
              <View style={{ gap: 12 }}>
                <Pressable
                  onPress={handleSave}
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
                    ✅ حفظ
                  </Text>
                </Pressable>

                <Pressable
                  onPress={() => setIsEditing(false)}
                  disabled={loading}
                  style={({ pressed }) => [
                    {
                      backgroundColor: colors.border,
                      paddingVertical: 12,
                      borderRadius: 8,
                      alignItems: "center",
                      opacity: pressed || loading ? 0.7 : 1,
                    },
                  ]}
                >
                  <Text
                    style={{
                      color: colors.foreground,
                      fontSize: 14,
                      fontWeight: "600",
                    }}
                  >
                    ❌ إلغاء
                  </Text>
                </Pressable>
              </View>
            </>
          )}
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

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

export default function VehicleDetailScreen() {
  const colors = useColors();
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const vehicleId = parseInt(id as string);

  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);

  // Fetch vehicle data
  const vehicleQuery = trpc.vehicles.getById.useQuery({ id: vehicleId });
  const updateVehicleMutation = trpc.vehicles.update.useMutation();
  const deleteVehicleMutation = trpc.vehicles.delete.useMutation();

  // Form state
  const [formData, setFormData] = useState({
    name: vehicleQuery.data?.name || "",
    plateNumber: vehicleQuery.data?.plateNumber || "",
    driverName: vehicleQuery.data?.driverName || "",
    status: vehicleQuery.data?.status || "active",
  });

  const vehicle = vehicleQuery.data;

  const getStatusInfo = (status: string) => {
    switch (status) {
      case "active":
        return { label: "نشط", color: colors.success, icon: "✅" };
      case "inactive":
        return { label: "معطل", color: colors.error, icon: "❌" };
      case "maintenance":
        return { label: "صيانة", color: colors.warning, icon: "🔧" };
      default:
        return { label: "غير معروف", color: colors.muted, icon: "❓" };
    }
  };

  const handleSave = async () => {
    if (!formData.name.trim() || !formData.plateNumber.trim() || !formData.driverName.trim()) {
      Alert.alert("خطأ", "يرجى ملء جميع الحقول المطلوبة");
      return;
    }

    try {
      setLoading(true);
      await updateVehicleMutation.mutateAsync({
        id: vehicleId,
        data: formData,
      });
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      Alert.alert("نجاح", "تم تحديث بيانات المركبة بنجاح");
      setIsEditing(false);
      vehicleQuery.refetch();
    } catch (error) {
      Alert.alert("خطأ", "فشل تحديث بيانات المركبة");
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = () => {
    Alert.alert(
      "تأكيد الحذف",
      `هل أنت متأكد من رغبتك في حذف المركبة "${vehicle?.name}"؟\nهذا الإجراء لا يمكن التراجع عنه.`,
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
              await deleteVehicleMutation.mutateAsync({ id: vehicleId });
              await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
              Alert.alert("نجاح", "تم حذف المركبة بنجاح");
              router.back();
            } catch (error) {
              Alert.alert("خطأ", "فشل حذف المركبة");
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

  if (vehicleQuery.isLoading) {
    return (
      <ScreenContainer className="bg-background">
        <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
          <Text style={{ color: colors.foreground, fontSize: 16 }}>جاري التحميل...</Text>
        </View>
      </ScreenContainer>
    );
  }

  if (!vehicle) {
    return (
      <ScreenContainer className="bg-background">
        <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
          <Text style={{ color: colors.error, fontSize: 16 }}>لم يتم العثور على المركبة</Text>
        </View>
      </ScreenContainer>
    );
  }

  const statusInfo = getStatusInfo(vehicle.status);

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
            تفاصيل المركبة
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
              backgroundColor: statusInfo.color,
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
              {statusInfo.icon} {statusInfo.label}
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
                <InfoRow label="اسم المركبة" value={vehicle.name} />
                <InfoRow label="رقم اللوحة" value={vehicle.plateNumber} />
                <InfoRow label="الكود" value={vehicle.code} />
                <InfoRow label="اسم السائق" value={vehicle.driverName} />
                {vehicle.lastMaintenanceDate && (
                  <InfoRow
                    label="آخر صيانة"
                    value={new Date(vehicle.lastMaintenanceDate).toLocaleDateString("ar-SA")}
                  />
                )}
              </View>

              {/* Action Buttons */}
              <View style={{ gap: 12 }}>
                <Pressable
                  onPress={() => {
                    setFormData({
                      name: vehicle.name,
                      plateNumber: vehicle.plateNumber,
                      driverName: vehicle.driverName,
                      status: vehicle.status,
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
                  label="اسم المركبة"
                  value={formData.name}
                  onChangeText={(text) => setFormData({ ...formData, name: text })}
                  colors={colors}
                />
                <FormField
                  label="رقم اللوحة"
                  value={formData.plateNumber}
                  onChangeText={(text) => setFormData({ ...formData, plateNumber: text })}
                  colors={colors}
                />
                <FormField
                  label="اسم السائق"
                  value={formData.driverName}
                  onChangeText={(text) => setFormData({ ...formData, driverName: text })}
                  colors={colors}
                />

                {/* Status Selector */}
                <View style={{ marginTop: 16 }}>
                  <Text
                    style={{
                      fontSize: 12,
                      color: colors.muted,
                      marginBottom: 8,
                      fontWeight: "600",
                    }}
                  >
                    الحالة
                  </Text>
                  <View style={{ flexDirection: "row", gap: 8 }}>
                    {["active", "inactive", "maintenance"].map((status) => {
                      const info = getStatusInfo(status);
                      return (
                        <Pressable
                          key={status}
                          onPress={() => setFormData({ ...formData, status: status as any })}
                          style={({ pressed }) => [
                            {
                              flex: 1,
                              backgroundColor:
                                formData.status === status ? info.color : colors.border,
                              paddingVertical: 10,
                              borderRadius: 6,
                              alignItems: "center",
                              opacity: pressed ? 0.7 : 1,
                            },
                          ]}
                        >
                          <Text
                            style={{
                              color:
                                formData.status === status ? "#ffffff" : colors.foreground,
                              fontSize: 11,
                              fontWeight: "600",
                            }}
                          >
                            {info.icon} {info.label}
                          </Text>
                        </Pressable>
                      );
                    })}
                  </View>
                </View>
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
}: {
  label: string;
  value: string;
  onChangeText: (text: string) => void;
  colors: any;
}) {
  return (
    <View style={{ marginBottom: 16 }}>
      <Text style={{ fontSize: 12, color: colors.muted, marginBottom: 6, fontWeight: "600" }}>
        {label}
      </Text>
      <TextInput
        value={value}
        onChangeText={onChangeText}
        style={{
          backgroundColor: colors.background,
          borderWidth: 1,
          borderColor: colors.border,
          borderRadius: 6,
          paddingHorizontal: 12,
          paddingVertical: 10,
          color: colors.foreground,
          fontSize: 14,
        }}
        placeholderTextColor={colors.muted}
      />
    </View>
  );
}

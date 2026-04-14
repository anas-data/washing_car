import React, { useState, useCallback } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from "react-native";
import { ScreenContainer } from "@/components/screen-container";
import { useColors } from "@/hooks/use-colors";
import { cn } from "@/lib/utils";

interface OperationFormData {
  vehicleId: string;
  partId: string;
  operationType: "add" | "consume" | "repair" | "maintenance";
  quantity: string;
  driverName: string;
  notes: string;
  date: string;
}

const OPERATION_TYPES = [
  { id: "add", label: "إضافة مخزون", labelEn: "Add Stock" },
  { id: "consume", label: "استهلاك", labelEn: "Consume" },
  { id: "repair", label: "إصلاح", labelEn: "Repair" },
  { id: "maintenance", label: "صيانة", labelEn: "Maintenance" },
];

const MOCK_VEHICLES = [
  { id: "v1", label: "سيارة 1 - تويوتا", plate: "ABC-123" },
  { id: "v2", label: "سيارة 2 - نيسان", plate: "XYZ-789" },
  { id: "v3", label: "سيارة 3 - هونداي", plate: "DEF-456" },
];

const MOCK_PARTS = [
  { id: "p1", label: "فلتر الهواء", category: "parts" },
  { id: "p2", label: "فلتر الزيت", category: "parts" },
  { id: "p3", label: "شامبو السيارة", category: "materials" },
  { id: "p4", label: "ملمع الشمع", category: "materials" },
];

export default function NewOperationScreen() {
  const colors = useColors();
  const [formData, setFormData] = useState<OperationFormData>({
    vehicleId: "",
    partId: "",
    operationType: "consume",
    quantity: "",
    driverName: "",
    notes: "",
    date: new Date().toISOString().split("T")[0],
  });

  const [showVehicleDropdown, setShowVehicleDropdown] = useState(false);
  const [showPartDropdown, setShowPartDropdown] = useState(false);
  const [showTypeDropdown, setShowTypeDropdown] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const selectedVehicle = MOCK_VEHICLES.find((v) => v.id === formData.vehicleId);
  const selectedPart = MOCK_PARTS.find((p) => p.id === formData.partId);
  const selectedType = OPERATION_TYPES.find(
    (t) => t.id === formData.operationType
  );

  const validateForm = useCallback(() => {
    const newErrors: Record<string, string> = {};

    if (!formData.vehicleId) newErrors.vehicleId = "اختر المركبة";
    if (!formData.partId) newErrors.partId = "اختر القطعة أو المادة";
    if (!formData.quantity || isNaN(Number(formData.quantity)))
      newErrors.quantity = "أدخل كمية صحيحة";
    if (!formData.driverName) newErrors.driverName = "أدخل اسم السائق";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [formData]);

  const handleSubmit = useCallback(async () => {
    if (!validateForm()) {
      Alert.alert("خطأ", "يرجى ملء جميع الحقول المطلوبة");
      return;
    }

    setIsLoading(true);
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1500));

      Alert.alert("نجاح", "تم إنشاء العملية بنجاح", [
        {
          text: "حسناً",
          onPress: () => {
            // Reset form
            setFormData({
              vehicleId: "",
              partId: "",
              operationType: "consume",
              quantity: "",
              driverName: "",
              notes: "",
              date: new Date().toISOString().split("T")[0],
            });
          },
        },
      ]);
    } catch (error) {
      Alert.alert("خطأ", "حدث خطأ أثناء إنشاء العملية");
    } finally {
      setIsLoading(false);
    }
  }, [validateForm]);

  return (
    <ScreenContainer className="bg-background">
      <ScrollView
        contentContainerStyle={{ flexGrow: 1 }}
        showsVerticalScrollIndicator={false}
      >
        <View className="p-4 gap-6">
          {/* Header */}
          <View className="gap-2">
            <Text
              className="text-3xl font-bold"
              style={{ color: colors.foreground }}
            >
              عملية جديدة
            </Text>
            <Text
              className="text-base"
              style={{ color: colors.muted }}
            >
              أنشئ عملية جديدة للمركبة والقطع
            </Text>
          </View>

          {/* Vehicle Selection */}
          <View className="gap-2">
            <Text
              className="text-sm font-semibold"
              style={{ color: colors.foreground }}
            >
              اختر المركبة *
            </Text>
            <TouchableOpacity
              onPress={() => setShowVehicleDropdown(!showVehicleDropdown)}
              style={{ borderColor: colors.border }}
              className={cn(
                "border rounded-lg p-3 flex-row justify-between items-center",
                errors.vehicleId ? "border-error" : ""
              )}
            >
              <Text
                style={{
                  color: selectedVehicle ? colors.foreground : colors.muted,
                }}
              >
                {selectedVehicle ? selectedVehicle.label : "اختر مركبة"}
              </Text>
              <Text style={{ color: colors.muted }}>▼</Text>
            </TouchableOpacity>
            {errors.vehicleId && (
              <Text style={{ color: colors.error }} className="text-xs">
                {errors.vehicleId}
              </Text>
            )}
            {showVehicleDropdown && (
              <View
                style={{ borderColor: colors.border }}
                className="border rounded-lg overflow-hidden"
              >
                {MOCK_VEHICLES.map((vehicle) => (
                  <TouchableOpacity
                    key={vehicle.id}
                    onPress={() => {
                      setFormData({ ...formData, vehicleId: vehicle.id });
                      setShowVehicleDropdown(false);
                    }}
                    style={{
                      backgroundColor:
                        formData.vehicleId === vehicle.id
                          ? colors.primary
                          : colors.surface,
                    }}
                    className="p-3 border-b"
                  >
                    <Text
                      style={{
                        color:
                          formData.vehicleId === vehicle.id
                            ? colors.background
                            : colors.foreground,
                      }}
                    >
                      {vehicle.label}
                    </Text>
                    <Text
                      style={{
                        color:
                          formData.vehicleId === vehicle.id
                            ? colors.background
                            : colors.muted,
                      }}
                      className="text-xs"
                    >
                      {vehicle.plate}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </View>

          {/* Part Selection */}
          <View className="gap-2">
            <Text
              className="text-sm font-semibold"
              style={{ color: colors.foreground }}
            >
              اختر القطعة أو المادة *
            </Text>
            <TouchableOpacity
              onPress={() => setShowPartDropdown(!showPartDropdown)}
              style={{ borderColor: colors.border }}
              className={cn(
                "border rounded-lg p-3 flex-row justify-between items-center",
                errors.partId ? "border-error" : ""
              )}
            >
              <Text
                style={{
                  color: selectedPart ? colors.foreground : colors.muted,
                }}
              >
                {selectedPart ? selectedPart.label : "اختر قطعة"}
              </Text>
              <Text style={{ color: colors.muted }}>▼</Text>
            </TouchableOpacity>
            {errors.partId && (
              <Text style={{ color: colors.error }} className="text-xs">
                {errors.partId}
              </Text>
            )}
            {showPartDropdown && (
              <View
                style={{ borderColor: colors.border }}
                className="border rounded-lg overflow-hidden"
              >
                {MOCK_PARTS.map((part) => (
                  <TouchableOpacity
                    key={part.id}
                    onPress={() => {
                      setFormData({ ...formData, partId: part.id });
                      setShowPartDropdown(false);
                    }}
                    style={{
                      backgroundColor:
                        formData.partId === part.id
                          ? colors.primary
                          : colors.surface,
                    }}
                    className="p-3 border-b"
                  >
                    <Text
                      style={{
                        color:
                          formData.partId === part.id
                            ? colors.background
                            : colors.foreground,
                      }}
                    >
                      {part.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </View>

          {/* Operation Type Selection */}
          <View className="gap-2">
            <Text
              className="text-sm font-semibold"
              style={{ color: colors.foreground }}
            >
              نوع العملية *
            </Text>
            <TouchableOpacity
              onPress={() => setShowTypeDropdown(!showTypeDropdown)}
              style={{ borderColor: colors.border }}
              className="border rounded-lg p-3 flex-row justify-between items-center"
            >
              <Text style={{ color: colors.foreground }}>
                {selectedType ? selectedType.label : "اختر النوع"}
              </Text>
              <Text style={{ color: colors.muted }}>▼</Text>
            </TouchableOpacity>
            {showTypeDropdown && (
              <View
                style={{ borderColor: colors.border }}
                className="border rounded-lg overflow-hidden"
              >
                {OPERATION_TYPES.map((type) => (
                  <TouchableOpacity
                    key={type.id}
                    onPress={() => {
                      setFormData({
                        ...formData,
                        operationType: type.id as any,
                      });
                      setShowTypeDropdown(false);
                    }}
                    style={{
                      backgroundColor:
                        formData.operationType === type.id
                          ? colors.primary
                          : colors.surface,
                    }}
                    className="p-3 border-b"
                  >
                    <Text
                      style={{
                        color:
                          formData.operationType === type.id
                            ? colors.background
                            : colors.foreground,
                      }}
                    >
                      {type.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </View>

          {/* Quantity Input */}
          <View className="gap-2">
            <Text
              className="text-sm font-semibold"
              style={{ color: colors.foreground }}
            >
              الكمية *
            </Text>
            <View
              style={{ borderColor: colors.border }}
              className={cn(
                "border rounded-lg p-3",
                errors.quantity ? "border-error" : ""
              )}
            >
              <Text
                style={{ color: colors.foreground }}
                className="text-base"
              >
                {formData.quantity || "0"}
              </Text>
            </View>
            {errors.quantity && (
              <Text style={{ color: colors.error }} className="text-xs">
                {errors.quantity}
              </Text>
            )}
            <View className="flex-row gap-2">
              {[1, 5, 10].map((qty) => (
                <TouchableOpacity
                  key={qty}
                  onPress={() =>
                    setFormData({
                      ...formData,
                      quantity: (parseInt(formData.quantity || "0") + qty).toString(),
                    })
                  }
                  style={{ backgroundColor: colors.primary }}
                  className="flex-1 p-2 rounded-lg"
                >
                  <Text
                    style={{ color: colors.background }}
                    className="text-center font-semibold"
                  >
                    +{qty}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Driver Name Input */}
          <View className="gap-2">
            <Text
              className="text-sm font-semibold"
              style={{ color: colors.foreground }}
            >
              اسم السائق *
            </Text>
            <View
              style={{ borderColor: colors.border }}
              className={cn(
                "border rounded-lg p-3",
                errors.driverName ? "border-error" : ""
              )}
            >
              <Text
                style={{ color: colors.foreground }}
                className="text-base"
              >
                {formData.driverName || "أدخل الاسم"}
              </Text>
            </View>
            {errors.driverName && (
              <Text style={{ color: colors.error }} className="text-xs">
                {errors.driverName}
              </Text>
            )}
          </View>

          {/* Notes Input */}
          <View className="gap-2">
            <Text
              className="text-sm font-semibold"
              style={{ color: colors.foreground }}
            >
              ملاحظات
            </Text>
            <View
              style={{ borderColor: colors.border }}
              className="border rounded-lg p-3 min-h-[100px]"
            >
              <Text
                style={{ color: colors.foreground }}
                className="text-base"
              >
                {formData.notes || "أضف ملاحظات إضافية..."}
              </Text>
            </View>
          </View>

          {/* Date Display */}
          <View className="gap-2">
            <Text
              className="text-sm font-semibold"
              style={{ color: colors.foreground }}
            >
              التاريخ
            </Text>
            <View
              style={{
                backgroundColor: colors.surface,
                borderColor: colors.border,
              }}
              className="border rounded-lg p-3"
            >
              <Text
                style={{ color: colors.foreground }}
                className="text-base"
              >
                {new Date(formData.date).toLocaleDateString("ar-SA")}
              </Text>
            </View>
          </View>

          {/* Summary Card */}
          <View
            style={{ backgroundColor: colors.surface, borderColor: colors.border }}
            className="border rounded-lg p-4 gap-3"
          >
            <Text
              className="text-sm font-semibold"
              style={{ color: colors.foreground }}
            >
              ملخص العملية
            </Text>
            <View className="gap-2">
              <View className="flex-row justify-between">
                <Text style={{ color: colors.muted }}>المركبة:</Text>
                <Text style={{ color: colors.foreground }}>
                  {selectedVehicle?.label || "-"}
                </Text>
              </View>
              <View className="flex-row justify-between">
                <Text style={{ color: colors.muted }}>القطعة:</Text>
                <Text style={{ color: colors.foreground }}>
                  {selectedPart?.label || "-"}
                </Text>
              </View>
              <View className="flex-row justify-between">
                <Text style={{ color: colors.muted }}>الكمية:</Text>
                <Text style={{ color: colors.foreground }}>
                  {formData.quantity || "-"}
                </Text>
              </View>
              <View className="flex-row justify-between">
                <Text style={{ color: colors.muted }}>النوع:</Text>
                <Text style={{ color: colors.foreground }}>
                  {selectedType?.label || "-"}
                </Text>
              </View>
            </View>
          </View>

          {/* Submit Button */}
          <TouchableOpacity
            onPress={handleSubmit}
            disabled={isLoading}
            style={{ backgroundColor: colors.primary }}
            className="p-4 rounded-lg flex-row justify-center items-center gap-2"
          >
            {isLoading ? (
              <>
                <ActivityIndicator color={colors.background} />
                <Text
                  style={{ color: colors.background }}
                  className="font-semibold text-base"
                >
                  جاري الحفظ...
                </Text>
              </>
            ) : (
              <Text
                style={{ color: colors.background }}
                className="font-semibold text-base"
              >
                إنشاء العملية
              </Text>
            )}
          </TouchableOpacity>

          {/* Cancel Button */}
          <TouchableOpacity
            onPress={() => {
              setFormData({
                vehicleId: "",
                partId: "",
                operationType: "consume",
                quantity: "",
                driverName: "",
                notes: "",
                date: new Date().toISOString().split("T")[0],
              });
              setErrors({});
            }}
            style={{ borderColor: colors.primary }}
            className="border p-4 rounded-lg"
          >
            <Text
              style={{ color: colors.primary }}
              className="font-semibold text-base text-center"
            >
              إلغاء
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}

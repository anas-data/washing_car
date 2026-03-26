import {
  ScrollView,
  Text,
  View,
  Pressable,
  TextInput,
  Alert,
  I18nManager,
  Modal,
  FlatList,
} from "react-native";
import { useState, useEffect } from "react";
import { ScreenContainer } from "@/components/screen-container";
import { useColors } from "@/hooks/use-colors";
import { useRouter } from "expo-router";
import { trpc } from "@/lib/trpc";
import * as Haptics from "expo-haptics";

I18nManager.forceRTL(true);

interface Vehicle {
  id: number;
  name: string;
  code: string;
  plateNumber: string;
}

interface Part {
  id: number;
  name: string;
  code: string;
  quantityAvailable: number;
  alertThreshold: number;
}

export default function NewOperationScreen() {
  const colors = useColors();
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  // Fetch vehicles and parts
  const vehiclesQuery = trpc.vehicles.list.useQuery();
  const partsQuery = trpc.parts.list.useQuery();
  const createOperationMutation = trpc.operations.create.useMutation();

  // Form state
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null);
  const [selectedPart, setSelectedPart] = useState<Part | null>(null);
  const [operationType, setOperationType] = useState<"addition" | "consumption">("consumption");
  const [quantity, setQuantity] = useState("");
  const [driverName, setDriverName] = useState("");
  const [notes, setNotes] = useState("");

  // Modal state
  const [vehicleModalVisible, setVehicleModalVisible] = useState(false);
  const [partModalVisible, setPartModalVisible] = useState(false);
  const [vehicleSearch, setVehicleSearch] = useState("");
  const [partSearch, setPartSearch] = useState("");

  // Filtered lists
  const [filteredVehicles, setFilteredVehicles] = useState<Vehicle[]>([]);
  const [filteredParts, setFilteredParts] = useState<Part[]>([]);

  useEffect(() => {
    if (!vehiclesQuery.data) return;
    const filtered = vehiclesQuery.data.filter(
      (v: any) =>
        v.name.toLowerCase().includes(vehicleSearch.toLowerCase()) ||
        v.code.toLowerCase().includes(vehicleSearch.toLowerCase()) ||
        v.plateNumber.toLowerCase().includes(vehicleSearch.toLowerCase())
    );
    setFilteredVehicles(filtered);
  }, [vehicleSearch, vehiclesQuery.data]);

  useEffect(() => {
    if (!partsQuery.data) return;
    const filtered = partsQuery.data.filter(
      (p: any) =>
        p.name.toLowerCase().includes(partSearch.toLowerCase()) ||
        p.code.toLowerCase().includes(partSearch.toLowerCase())
    );
    setFilteredParts(filtered);
  }, [partSearch, partsQuery.data]);

  const handleSubmit = async () => {
    // Validation
    if (!selectedVehicle) {
      Alert.alert("خطأ", "يرجى اختيار المركبة");
      return;
    }
    if (!selectedPart) {
      Alert.alert("خطأ", "يرجى اختيار القطعة");
      return;
    }
    if (!quantity.trim() || isNaN(parseInt(quantity))) {
      Alert.alert("خطأ", "يرجى إدخال كمية صحيحة");
      return;
    }
    if (!driverName.trim()) {
      Alert.alert("خطأ", "يرجى إدخال اسم السائق");
      return;
    }

    const quantityNum = parseInt(quantity);
    if (quantityNum <= 0) {
      Alert.alert("خطأ", "الكمية يجب أن تكون أكبر من صفر");
      return;
    }

    try {
      setLoading(true);
      await createOperationMutation.mutateAsync({
        operationType,
        vehicleId: selectedVehicle.id,
        partId: selectedPart.id,
        quantity: quantityNum,
        driverName,
        notes: notes.trim() || undefined,
      });

      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      Alert.alert("نجاح", "تم إنشاء العملية بنجاح وإرسالها للموافقة");
      router.back();
    } catch (error: any) {
      Alert.alert("خطأ", error.message || "فشل إنشاء العملية");
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    } finally {
      setLoading(false);
    }
  };

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
            عملية جديدة
          </Text>
          <View style={{ width: 24 }} />
        </View>

        {/* Form */}
        <View style={{ paddingHorizontal: 16, paddingBottom: 32 }}>
          {/* Operation Type */}
          <View style={{ marginBottom: 20 }}>
            <Text
              style={{
                fontSize: 12,
                color: colors.muted,
                marginBottom: 8,
                fontWeight: "600",
              }}
            >
              نوع العملية
            </Text>
            <View style={{ flexDirection: "row", gap: 8 }}>
              {[
                { value: "consumption" as const, label: "استهلاك", icon: "➖" },
                { value: "addition" as const, label: "إضافة", icon: "➕" },
              ].map((type) => (
                <Pressable
                  key={type.value}
                  onPress={() => {
                    setOperationType(type.value);
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  }}
                  style={({ pressed }) => [
                    {
                      flex: 1,
                      backgroundColor:
                        operationType === type.value
                          ? type.value === "consumption"
                            ? colors.error
                            : colors.success
                          : colors.surface,
                      paddingVertical: 12,
                      borderRadius: 8,
                      alignItems: "center",
                      borderWidth: 1,
                      borderColor: colors.border,
                      opacity: pressed ? 0.7 : 1,
                    },
                  ]}
                >
                  <Text
                    style={{
                      color:
                        operationType === type.value ? "#ffffff" : colors.foreground,
                      fontSize: 13,
                      fontWeight: "600",
                    }}
                  >
                    {type.icon} {type.label}
                  </Text>
                </Pressable>
              ))}
            </View>
          </View>

          {/* Vehicle Dropdown */}
          <View style={{ marginBottom: 20 }}>
            <Text
              style={{
                fontSize: 12,
                color: colors.muted,
                marginBottom: 8,
                fontWeight: "600",
              }}
            >
              المركبة *
            </Text>
            <Pressable
              onPress={() => {
                setVehicleModalVisible(true);
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              }}
              style={({ pressed }) => [
                {
                  backgroundColor: colors.surface,
                  borderWidth: 1,
                  borderColor: selectedVehicle ? colors.primary : colors.border,
                  borderRadius: 8,
                  paddingHorizontal: 12,
                  paddingVertical: 12,
                  opacity: pressed ? 0.7 : 1,
                },
              ]}
            >
              <Text
                style={{
                  color: selectedVehicle ? colors.foreground : colors.muted,
                  fontSize: 14,
                }}
              >
                {selectedVehicle
                  ? `${selectedVehicle.name} (${selectedVehicle.plateNumber})`
                  : "اختر المركبة..."}
              </Text>
            </Pressable>
          </View>

          {/* Part Dropdown */}
          <View style={{ marginBottom: 20 }}>
            <Text
              style={{
                fontSize: 12,
                color: colors.muted,
                marginBottom: 8,
                fontWeight: "600",
              }}
            >
              القطعة *
            </Text>
            <Pressable
              onPress={() => {
                setPartModalVisible(true);
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              }}
              style={({ pressed }) => [
                {
                  backgroundColor: colors.surface,
                  borderWidth: 1,
                  borderColor: selectedPart ? colors.primary : colors.border,
                  borderRadius: 8,
                  paddingHorizontal: 12,
                  paddingVertical: 12,
                  opacity: pressed ? 0.7 : 1,
                },
              ]}
            >
              <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
                <Text
                  style={{
                    color: selectedPart ? colors.foreground : colors.muted,
                    fontSize: 14,
                    flex: 1,
                  }}
                >
                  {selectedPart ? `${selectedPart.name} (${selectedPart.code})` : "اختر القطعة..."}
                </Text>
                {selectedPart && (
                  <Text
                    style={{
                      color:
                        selectedPart.quantityAvailable <= selectedPart.alertThreshold
                          ? colors.error
                          : colors.success,
                      fontSize: 12,
                      fontWeight: "600",
                    }}
                  >
                    متوفر: {selectedPart.quantityAvailable}
                  </Text>
                )}
              </View>
            </Pressable>
          </View>

          {/* Quantity */}
          <View style={{ marginBottom: 20 }}>
            <Text
              style={{
                fontSize: 12,
                color: colors.muted,
                marginBottom: 8,
                fontWeight: "600",
              }}
            >
              الكمية *
            </Text>
            <TextInput
              value={quantity}
              onChangeText={setQuantity}
              keyboardType="numeric"
              placeholder="أدخل الكمية..."
              placeholderTextColor={colors.muted}
              style={{
                backgroundColor: colors.surface,
                borderWidth: 1,
                borderColor: colors.border,
                borderRadius: 8,
                paddingHorizontal: 12,
                paddingVertical: 12,
                color: colors.foreground,
                fontSize: 14,
              }}
            />
          </View>

          {/* Driver Name */}
          <View style={{ marginBottom: 20 }}>
            <Text
              style={{
                fontSize: 12,
                color: colors.muted,
                marginBottom: 8,
                fontWeight: "600",
              }}
            >
              اسم السائق *
            </Text>
            <TextInput
              value={driverName}
              onChangeText={setDriverName}
              placeholder="أدخل اسم السائق..."
              placeholderTextColor={colors.muted}
              style={{
                backgroundColor: colors.surface,
                borderWidth: 1,
                borderColor: colors.border,
                borderRadius: 8,
                paddingHorizontal: 12,
                paddingVertical: 12,
                color: colors.foreground,
                fontSize: 14,
              }}
            />
          </View>

          {/* Notes */}
          <View style={{ marginBottom: 20 }}>
            <Text
              style={{
                fontSize: 12,
                color: colors.muted,
                marginBottom: 8,
                fontWeight: "600",
              }}
            >
              الملاحظات
            </Text>
            <TextInput
              value={notes}
              onChangeText={setNotes}
              placeholder="أضف ملاحظات إضافية..."
              placeholderTextColor={colors.muted}
              multiline
              numberOfLines={4}
              style={{
                backgroundColor: colors.surface,
                borderWidth: 1,
                borderColor: colors.border,
                borderRadius: 8,
                paddingHorizontal: 12,
                paddingVertical: 12,
                color: colors.foreground,
                fontSize: 14,
                textAlignVertical: "top",
              }}
            />
          </View>

          {/* Submit Button */}
          <Pressable
            onPress={handleSubmit}
            disabled={loading}
            style={({ pressed }) => [
              {
                backgroundColor: colors.primary,
                paddingVertical: 14,
                borderRadius: 8,
                alignItems: "center",
                opacity: pressed || loading ? 0.7 : 1,
              },
            ]}
          >
            <Text
              style={{
                color: "#ffffff",
                fontSize: 16,
                fontWeight: "700",
              }}
            >
              {loading ? "جاري الإرسال..." : "✅ إنشاء العملية"}
            </Text>
          </Pressable>

          {/* Cancel Button */}
          <Pressable
            onPress={() => router.back()}
            disabled={loading}
            style={({ pressed }) => [
              {
                backgroundColor: colors.border,
                paddingVertical: 12,
                borderRadius: 8,
                alignItems: "center",
                marginTop: 8,
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
      </ScrollView>

      {/* Vehicle Modal */}
      <Modal
        visible={vehicleModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setVehicleModalVisible(false)}
      >
        <View
          style={{
            flex: 1,
            backgroundColor: "rgba(0,0,0,0.5)",
            justifyContent: "flex-end",
          }}
        >
          <View
            style={{
              backgroundColor: colors.background,
              borderTopLeftRadius: 20,
              borderTopRightRadius: 20,
              paddingTop: 16,
              maxHeight: "80%",
            }}
          >
            {/* Modal Header */}
            <View
              style={{
                paddingHorizontal: 16,
                paddingBottom: 12,
                borderBottomWidth: 1,
                borderBottomColor: colors.border,
              }}
            >
              <View
                style={{
                  flexDirection: "row",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: 12,
                }}
              >
                <Pressable onPress={() => setVehicleModalVisible(false)}>
                  <Text style={{ fontSize: 24 }}>←</Text>
                </Pressable>
                <Text
                  style={{
                    fontSize: 16,
                    fontWeight: "700",
                    color: colors.foreground,
                  }}
                >
                  اختر المركبة
                </Text>
                <View style={{ width: 24 }} />
              </View>

              {/* Search */}
              <View
                style={{
                  backgroundColor: colors.surface,
                  borderRadius: 8,
                  paddingHorizontal: 12,
                  flexDirection: "row",
                  alignItems: "center",
                  borderWidth: 1,
                  borderColor: colors.border,
                }}
              >
                <Text style={{ fontSize: 16, marginRight: 8 }}>🔍</Text>
                <TextInput
                  placeholder="ابحث عن مركبة..."
                  placeholderTextColor={colors.muted}
                  value={vehicleSearch}
                  onChangeText={setVehicleSearch}
                  style={{
                    flex: 1,
                    color: colors.foreground,
                    fontSize: 14,
                    paddingVertical: 10,
                  }}
                />
              </View>
            </View>

            {/* Vehicle List */}
            <FlatList
              data={filteredVehicles}
              keyExtractor={(item) => item.id.toString()}
              renderItem={({ item }) => (
                <Pressable
                  onPress={() => {
                    setSelectedVehicle(item);
                    setVehicleModalVisible(false);
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  }}
                  style={({ pressed }) => [
                    {
                      paddingHorizontal: 16,
                      paddingVertical: 12,
                      borderBottomWidth: 1,
                      borderBottomColor: colors.border,
                      backgroundColor: pressed ? colors.surface : colors.background,
                    },
                  ]}
                >
                  <Text
                    style={{
                      fontSize: 14,
                      fontWeight: "600",
                      color: colors.foreground,
                      marginBottom: 4,
                    }}
                  >
                    {item.name}
                  </Text>
                  <Text
                    style={{
                      fontSize: 12,
                      color: colors.muted,
                    }}
                  >
                    {item.code} • {item.plateNumber}
                  </Text>
                </Pressable>
              )}
              ListEmptyComponent={
                <View style={{ paddingVertical: 32, alignItems: "center" }}>
                  <Text style={{ color: colors.muted, fontSize: 14 }}>
                    لا توجد مركبات
                  </Text>
                </View>
              }
            />
          </View>
        </View>
      </Modal>

      {/* Part Modal */}
      <Modal
        visible={partModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setPartModalVisible(false)}
      >
        <View
          style={{
            flex: 1,
            backgroundColor: "rgba(0,0,0,0.5)",
            justifyContent: "flex-end",
          }}
        >
          <View
            style={{
              backgroundColor: colors.background,
              borderTopLeftRadius: 20,
              borderTopRightRadius: 20,
              paddingTop: 16,
              maxHeight: "80%",
            }}
          >
            {/* Modal Header */}
            <View
              style={{
                paddingHorizontal: 16,
                paddingBottom: 12,
                borderBottomWidth: 1,
                borderBottomColor: colors.border,
              }}
            >
              <View
                style={{
                  flexDirection: "row",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: 12,
                }}
              >
                <Pressable onPress={() => setPartModalVisible(false)}>
                  <Text style={{ fontSize: 24 }}>←</Text>
                </Pressable>
                <Text
                  style={{
                    fontSize: 16,
                    fontWeight: "700",
                    color: colors.foreground,
                  }}
                >
                  اختر القطعة
                </Text>
                <View style={{ width: 24 }} />
              </View>

              {/* Search */}
              <View
                style={{
                  backgroundColor: colors.surface,
                  borderRadius: 8,
                  paddingHorizontal: 12,
                  flexDirection: "row",
                  alignItems: "center",
                  borderWidth: 1,
                  borderColor: colors.border,
                }}
              >
                <Text style={{ fontSize: 16, marginRight: 8 }}>🔍</Text>
                <TextInput
                  placeholder="ابحث عن قطعة..."
                  placeholderTextColor={colors.muted}
                  value={partSearch}
                  onChangeText={setPartSearch}
                  style={{
                    flex: 1,
                    color: colors.foreground,
                    fontSize: 14,
                    paddingVertical: 10,
                  }}
                />
              </View>
            </View>

            {/* Part List */}
            <FlatList
              data={filteredParts}
              keyExtractor={(item) => item.id.toString()}
              renderItem={({ item }) => {
                const isLowStock = item.quantityAvailable <= item.alertThreshold;
                return (
                  <Pressable
                    onPress={() => {
                      setSelectedPart(item);
                      setPartModalVisible(false);
                      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    }}
                    style={({ pressed }) => [
                      {
                        paddingHorizontal: 16,
                        paddingVertical: 12,
                        borderBottomWidth: 1,
                        borderBottomColor: colors.border,
                        backgroundColor: pressed ? colors.surface : colors.background,
                      },
                    ]}
                  >
                    <View
                      style={{
                        flexDirection: "row",
                        justifyContent: "space-between",
                        alignItems: "center",
                      }}
                    >
                      <View style={{ flex: 1 }}>
                        <Text
                          style={{
                            fontSize: 14,
                            fontWeight: "600",
                            color: colors.foreground,
                            marginBottom: 4,
                          }}
                        >
                          {item.name}
                        </Text>
                        <Text
                          style={{
                            fontSize: 12,
                            color: colors.muted,
                          }}
                        >
                          {item.code}
                        </Text>
                      </View>
                      <View
                        style={{
                          backgroundColor: isLowStock ? colors.error : colors.success,
                          paddingHorizontal: 8,
                          paddingVertical: 4,
                          borderRadius: 4,
                        }}
                      >
                        <Text
                          style={{
                            fontSize: 11,
                            fontWeight: "600",
                            color: "#ffffff",
                          }}
                        >
                          {item.quantityAvailable}
                        </Text>
                      </View>
                    </View>
                  </Pressable>
                );
              }}
              ListEmptyComponent={
                <View style={{ paddingVertical: 32, alignItems: "center" }}>
                  <Text style={{ color: colors.muted, fontSize: 14 }}>
                    لا توجد قطع
                  </Text>
                </View>
              }
            />
          </View>
        </View>
      </Modal>
    </ScreenContainer>
  );
}

import { ScrollView, Text, View, Pressable, TextInput, FlatList, I18nManager } from "react-native";
import { useEffect, useState } from "react";
import { ScreenContainer } from "@/components/screen-container";
import { useColors } from "@/hooks/use-colors";
import { trpc } from "@/lib/trpc";
import { useRouter } from "expo-router";
import * as Haptics from "expo-haptics";

I18nManager.forceRTL(true);

interface Vehicle {
  id: number;
  code: string;
  name: string;
  plateNumber: string;
  driverName: string;
  status: "active" | "inactive" | "maintenance";
  lastMaintenanceDate?: Date | null;
}

export default function VehiclesScreen() {
  const colors = useColors();
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStatus, setSelectedStatus] = useState<string | null>(null);
  const [filteredVehicles, setFilteredVehicles] = useState<Vehicle[]>([]);

  const vehiclesQuery = trpc.vehicles.list.useQuery();

  useEffect(() => {
    if (!vehiclesQuery.data) return;

    let filtered = vehiclesQuery.data;

    // Filter by search query
    if (searchQuery.trim()) {
      filtered = filtered.filter(
        (vehicle: any) =>
          vehicle.name.includes(searchQuery) ||
          vehicle.code.includes(searchQuery) ||
          vehicle.plateNumber.includes(searchQuery) ||
          vehicle.driverName.includes(searchQuery)
      );
    }

    // Filter by status
    if (selectedStatus) {
      filtered = filtered.filter((vehicle: any) => vehicle.status === selectedStatus);
    }

    setFilteredVehicles(filtered);
  }, [vehiclesQuery.data, searchQuery, selectedStatus]);

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

  const renderVehicleItem = ({ item }: { item: Vehicle }) => {
    const statusInfo = getStatusInfo(item.status);

    return (
      <Pressable
        onPress={() => {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          router.push({
            pathname: "/vehicles/[id]",
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
              {item.name}
            </Text>
            <Text
              style={{
                fontSize: 12,
                color: colors.muted,
                marginTop: 2,
              }}
            >
              رقم اللوحة: {item.plateNumber}
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
            marginBottom: 8,
          }}
        >
          <View>
            <Text
              style={{
                fontSize: 11,
                color: colors.muted,
              }}
            >
              الكود
            </Text>
            <Text
              style={{
                fontSize: 13,
                fontWeight: "600",
                color: colors.foreground,
              }}
            >
              {item.code}
            </Text>
          </View>
          <View>
            <Text
              style={{
                fontSize: 11,
                color: colors.muted,
              }}
            >
              اسم السائق
            </Text>
            <Text
              style={{
                fontSize: 13,
                fontWeight: "600",
                color: colors.foreground,
              }}
            >
              {item.driverName}
            </Text>
          </View>
        </View>

        {item.lastMaintenanceDate && (
          <Text
            style={{
              fontSize: 11,
              color: colors.muted,
            }}
          >
            آخر صيانة: {new Date(item.lastMaintenanceDate).toLocaleDateString("ar-SA")}
          </Text>
        )}
      </Pressable>
    );
  };

  const activeCount = vehiclesQuery.data?.filter((v: any) => v.status === "active").length || 0;
  const maintenanceCount =
    vehiclesQuery.data?.filter((v: any) => v.status === "maintenance").length || 0;
  const inactiveCount =
    vehiclesQuery.data?.filter((v: any) => v.status === "inactive").length || 0;

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
              marginBottom: 16,
            }}
          >
            إدارة المركبات
          </Text>

          {/* Search Bar */}
          <View
            style={{
              backgroundColor: colors.surface,
              borderRadius: 10,
              paddingHorizontal: 12,
              paddingVertical: 8,
              borderWidth: 1,
              borderColor: colors.border,
              marginBottom: 12,
              flexDirection: "row",
              alignItems: "center",
            }}
          >
            <Text style={{ fontSize: 18, marginRight: 8 }}>🔍</Text>
            <TextInput
              placeholder="ابحث عن مركبة..."
              placeholderTextColor={colors.muted}
              value={searchQuery}
              onChangeText={setSearchQuery}
              style={{
                flex: 1,
                color: colors.foreground,
                fontSize: 14,
              }}
            />
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
                الكل ({vehiclesQuery.data?.length || 0})
              </Text>
            </Pressable>

            <Pressable
              onPress={() => setSelectedStatus("active")}
              style={({ pressed }) => [
                {
                  paddingHorizontal: 12,
                  paddingVertical: 6,
                  borderRadius: 20,
                  marginRight: 8,
                  backgroundColor:
                    selectedStatus === "active" ? colors.success : colors.surface,
                  opacity: pressed ? 0.7 : 1,
                },
              ]}
            >
              <Text
                style={{
                  color: selectedStatus === "active" ? "#ffffff" : colors.foreground,
                  fontSize: 12,
                  fontWeight: "600",
                }}
              >
                ✅ نشط ({activeCount})
              </Text>
            </Pressable>

            <Pressable
              onPress={() => setSelectedStatus("maintenance")}
              style={({ pressed }) => [
                {
                  paddingHorizontal: 12,
                  paddingVertical: 6,
                  borderRadius: 20,
                  marginRight: 8,
                  backgroundColor:
                    selectedStatus === "maintenance" ? colors.warning : colors.surface,
                  opacity: pressed ? 0.7 : 1,
                },
              ]}
            >
              <Text
                style={{
                  color:
                    selectedStatus === "maintenance" ? "#ffffff" : colors.foreground,
                  fontSize: 12,
                  fontWeight: "600",
                }}
              >
                🔧 صيانة ({maintenanceCount})
              </Text>
            </Pressable>

            <Pressable
              onPress={() => setSelectedStatus("inactive")}
              style={({ pressed }) => [
                {
                  paddingHorizontal: 12,
                  paddingVertical: 6,
                  borderRadius: 20,
                  marginRight: 8,
                  backgroundColor:
                    selectedStatus === "inactive" ? colors.error : colors.surface,
                  opacity: pressed ? 0.7 : 1,
                },
              ]}
            >
              <Text
                style={{
                  color: selectedStatus === "inactive" ? "#ffffff" : colors.foreground,
                  fontSize: 12,
                  fontWeight: "600",
                }}
              >
                ❌ معطل ({inactiveCount})
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
                {vehiclesQuery.data?.length || 0}
              </Text>
            </View>
            <View>
              <Text
                style={{
                  fontSize: 11,
                  color: colors.muted,
                }}
              >
                نشطة
              </Text>
              <Text
                style={{
                  fontSize: 16,
                  fontWeight: "700",
                  color: colors.success,
                }}
              >
                {activeCount}
              </Text>
            </View>
            <View>
              <Text
                style={{
                  fontSize: 11,
                  color: colors.muted,
                }}
              >
                صيانة
              </Text>
              <Text
                style={{
                  fontSize: 16,
                  fontWeight: "700",
                  color: colors.warning,
                }}
              >
                {maintenanceCount}
              </Text>
            </View>
            <View>
              <Text
                style={{
                  fontSize: 11,
                  color: colors.muted,
                }}
              >
                معطلة
              </Text>
              <Text
                style={{
                  fontSize: 16,
                  fontWeight: "700",
                  color: colors.error,
                }}
              >
                {inactiveCount}
              </Text>
            </View>
          </View>
        </View>

        {/* Vehicles List */}
        {filteredVehicles.length > 0 ? (
          <FlatList
            data={filteredVehicles}
            renderItem={renderVehicleItem}
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
              🚗
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
              لا توجد مركبات
            </Text>
            <Text
              style={{
                fontSize: 14,
                color: colors.muted,
                textAlign: "center",
              }}
            >
              {searchQuery || selectedStatus
                ? "لم نجد مركبات تطابق معايير البحث"
                : "لا توجد مركبات في النظام"}
            </Text>
          </View>
        )}
      </View>
    </ScreenContainer>
  );
}

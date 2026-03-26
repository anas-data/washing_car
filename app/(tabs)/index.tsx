import { ScrollView, Text, View, Pressable, I18nManager } from "react-native";
import { useEffect, useState } from "react";
import { ScreenContainer } from "@/components/screen-container";
import { useColors } from "@/hooks/use-colors";
import { useAuth } from "@/hooks/use-auth";
import { trpc } from "@/lib/trpc";
import * as Haptics from "expo-haptics";
import { useRouter } from "expo-router";

// Force RTL layout for Arabic
I18nManager.forceRTL(true);

interface DashboardStats {
  totalVehicles: number;
  activeVehicles: number;
  totalParts: number;
  lowStockParts: number;
  pendingOperations: number;
  pendingApprovals: number;
}

export default function HomeScreen() {
  const colors = useColors();
  const { user } = useAuth();
  const router = useRouter();
  const [stats, setStats] = useState<DashboardStats>({
    totalVehicles: 0,
    activeVehicles: 0,
    totalParts: 0,
    lowStockParts: 0,
    pendingOperations: 0,
    pendingApprovals: 0,
  });
  const [loading, setLoading] = useState(true);

  // Fetch dashboard data
  const vehiclesQuery = trpc.vehicles.list.useQuery();
  const partsQuery = trpc.parts.list.useQuery();
  const lowStockQuery = trpc.parts.getLowStock.useQuery();
  const operationsQuery = trpc.operations.getPending.useQuery();
  const approvalsQuery = trpc.approvals.getPending.useQuery();

  useEffect(() => {
    if (
      vehiclesQuery.data &&
      partsQuery.data &&
      lowStockQuery.data &&
      operationsQuery.data &&
      approvalsQuery.data
    ) {
      const activeVehicles = vehiclesQuery.data.filter(
        (v: any) => v.status === "active"
      ).length;

      setStats({
        totalVehicles: vehiclesQuery.data.length,
        activeVehicles,
        totalParts: partsQuery.data.length,
        lowStockParts: lowStockQuery.data.length,
        pendingOperations: operationsQuery.data.length,
        pendingApprovals: approvalsQuery.data.length,
      });
      setLoading(false);
    }
  }, [vehiclesQuery.data, partsQuery.data, lowStockQuery.data, operationsQuery.data, approvalsQuery.data]);

  const handleCardPress = async (route: string) => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.push(route as any);
  };

  const StatCard = ({
    label,
    value,
    icon,
    route,
    color,
  }: {
    label: string;
    value: number | string;
    icon: string;
    route: string;
    color: string;
  }) => (
    <Pressable
      onPress={() => handleCardPress(route)}
      style={({ pressed }) => [
        {
          flex: 1,
          backgroundColor: colors.surface,
          borderRadius: 12,
          padding: 16,
          marginHorizontal: 6,
          marginVertical: 8,
          borderLeftWidth: 4,
          borderLeftColor: color,
          opacity: pressed ? 0.7 : 1,
        },
      ]}
    >
      <Text
        style={{
          fontSize: 28,
          marginBottom: 8,
        }}
      >
        {icon}
      </Text>
      <Text
        style={{
          fontSize: 24,
          fontWeight: "700",
          color: colors.foreground,
          marginBottom: 4,
        }}
      >
        {value}
      </Text>
      <Text
        style={{
          fontSize: 12,
          color: colors.muted,
        }}
      >
        {label}
      </Text>
    </Pressable>
  );

  const ActionButton = ({
    label,
    icon,
    route,
    color,
  }: {
    label: string;
    icon: string;
    route: string;
    color: string;
  }) => (
    <Pressable
      onPress={() => handleCardPress(route)}
      style={({ pressed }) => [
        {
          flex: 1,
          backgroundColor: color,
          borderRadius: 12,
          padding: 16,
          marginHorizontal: 6,
          marginVertical: 8,
          alignItems: "center",
          justifyContent: "center",
          opacity: pressed ? 0.85 : 1,
        },
      ]}
    >
      <Text style={{ fontSize: 32, marginBottom: 8 }}>{icon}</Text>
      <Text
        style={{
          fontSize: 14,
          fontWeight: "600",
          color: "#ffffff",
          textAlign: "center",
        }}
      >
        {label}
      </Text>
    </Pressable>
  );

  return (
    <ScreenContainer className="bg-background">
      <ScrollView
        contentContainerStyle={{ flexGrow: 1 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={{ padding: 16, paddingBottom: 8 }}>
          <Text
            style={{
              fontSize: 28,
              fontWeight: "700",
              color: colors.foreground,
              marginBottom: 4,
            }}
          >
            مرحباً، {user?.name || "المستخدم"}
          </Text>
          <Text
            style={{
              fontSize: 14,
              color: colors.muted,
            }}
          >
            منفذ السلامة - إدارة مخزون مغسلة السيارات
          </Text>
        </View>

        {/* Alert Banner */}
        {stats.lowStockParts > 0 && (
          <View
            style={{
              marginHorizontal: 16,
              marginVertical: 12,
              backgroundColor: "#FEF3C7",
              borderRadius: 12,
              padding: 12,
              borderLeftWidth: 4,
              borderLeftColor: "#F59E0B",
            }}
          >
            <Text
              style={{
                fontSize: 14,
                fontWeight: "600",
                color: "#92400E",
              }}
            >
              ⚠️ {stats.lowStockParts} قطع بحد التنبيه
            </Text>
            <Text
              style={{
                fontSize: 12,
                color: "#B45309",
                marginTop: 4,
              }}
            >
              يرجى مراجعة المخزون المنخفض
            </Text>
          </View>
        )}

        {/* Pending Approvals Alert */}
        {stats.pendingApprovals > 0 && (user as any)?.role === "admin" && (
          <View
            style={{
              marginHorizontal: 16,
              marginVertical: 12,
              backgroundColor: "#DBEAFE",
              borderRadius: 12,
              padding: 12,
              borderLeftWidth: 4,
              borderLeftColor: "#0a7ea4",
            }}
          >
            <Text
              style={{
                fontSize: 14,
                fontWeight: "600",
                color: "#0C4A6E",
              }}
            >
              📋 {stats.pendingApprovals} موافقات قيد الانتظار
            </Text>
            <Text
              style={{
                fontSize: 12,
                color: "#075985",
                marginTop: 4,
              }}
            >
              هناك عمليات تنتظر موافقتك
            </Text>
          </View>
        )}

        {/* Dashboard Stats */}
        <View style={{ marginTop: 16 }}>
          <Text
            style={{
              fontSize: 16,
              fontWeight: "600",
              color: colors.foreground,
              marginHorizontal: 16,
              marginBottom: 12,
            }}
          >
            إحصائيات سريعة
          </Text>

          <View style={{ flexDirection: "row", flexWrap: "wrap" }}>
            <StatCard
              label="إجمالي المركبات"
              value={stats.totalVehicles}
              icon="🚗"
              route="/vehicles"
              color={colors.primary}
            />
            <StatCard
              label="المركبات النشطة"
              value={stats.activeVehicles}
              icon="✅"
              route="/vehicles"
              color={colors.success}
            />
          </View>

          <View style={{ flexDirection: "row", flexWrap: "wrap" }}>
            <StatCard
              label="إجمالي القطع"
              value={stats.totalParts}
              icon="🔧"
              route="/inventory"
              color={colors.primary}
            />
            <StatCard
              label="قطع بحد تنبيه"
              value={stats.lowStockParts}
              icon="⚠️"
              route="/inventory"
              color={colors.warning}
            />
          </View>

          <View style={{ flexDirection: "row", flexWrap: "wrap" }}>
            <StatCard
              label="عمليات قيد الانتظار"
              value={stats.pendingOperations}
              icon="⏳"
              route="/operations"
              color={colors.warning}
            />
            <StatCard
              label="موافقات قيد الانتظار"
              value={stats.pendingApprovals}
              icon="📋"
              route="/approvals"
              color={colors.primary}
            />
          </View>
        </View>

        {/* Quick Actions */}
        <View style={{ marginTop: 24, marginBottom: 32 }}>
          <Text
            style={{
              fontSize: 16,
              fontWeight: "600",
              color: colors.foreground,
              marginHorizontal: 16,
              marginBottom: 12,
            }}
          >
            الإجراءات السريعة
          </Text>

          <View style={{ flexDirection: "row", flexWrap: "wrap" }}>
            <ActionButton
              label="إضافة عملية"
              icon="➕"
              route="/operations/create"
              color={colors.primary}
            />
            <ActionButton
              label="إدارة المخزون"
              icon="📦"
              route="/inventory"
              color={colors.success}
            />
          </View>

          <View style={{ flexDirection: "row", flexWrap: "wrap" }}>
            <ActionButton
              label="المركبات"
              icon="🚗"
              route="/vehicles"
              color="#8B5CF6"
            />
            <ActionButton
              label="التقارير"
              icon="📊"
              route="/reports"
              color="#EC4899"
            />
          </View>

          {(user as any)?.role === "admin" && (
            <View style={{ flexDirection: "row", flexWrap: "wrap" }}>
              <ActionButton
                label="الموافقات"
                icon="✔️"
                route="/approvals"
                color="#F59E0B"
              />
              <ActionButton
                label="الإعدادات"
                icon="⚙️"
                route="/settings"
                color="#6B7280"
              />
            </View>
          )}
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}

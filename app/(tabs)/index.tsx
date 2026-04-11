import { ScrollView, Text, View, Pressable, I18nManager, RefreshControl } from "react-native";
import { useEffect, useState } from "react";
import { ScreenContainer } from "@/components/screen-container";
import { useColors } from "@/hooks/use-colors";
import { useAuth } from "@/hooks/use-auth";
import { trpc } from "@/lib/trpc";
import * as Haptics from "expo-haptics";
import { useRouter } from "expo-router";
import { useNotificationTriggers } from "@/hooks/use-notification-triggers";
import { DashboardStats, LargeStatCard } from "@/components/dashboard-stats";
import { DashboardChart } from "@/components/dashboard-chart";
import { RecentActivity } from "@/components/recent-activity";
import { AlertBanner } from "@/components/alert-banner";

// Force RTL layout for Arabic
if (typeof I18nManager !== 'undefined' && I18nManager.forceRTL) {
  I18nManager.forceRTL(true);
}

// Type definitions
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
  const [refreshing, setRefreshing] = useState(false);
  
  // Initialize notification triggers
  useNotificationTriggers();
  const [stats, setStats] = useState<DashboardStats>({
    totalVehicles: 0,
    activeVehicles: 0,
    totalParts: 0,
    lowStockParts: 0,
    pendingOperations: 0,
    pendingApprovals: 0,
  });
  const [loading, setLoading] = useState(true);

  // Fetch dashboard data using public test endpoints
  const vehiclesQuery = trpc.test.vehicles.useQuery();
  const partsQuery = trpc.test.parts.useQuery();
  const lowStockQuery = trpc.test.lowStockParts.useQuery();
  const operationsQuery = trpc.test.pendingOperations.useQuery();
  const approvalsQuery = trpc.approvals.getPending.useQuery(undefined, { enabled: !!user });
  const [approvalsData, setApprovalsData] = useState<any[]>([]);

  useEffect(() => {
    if (approvalsQuery.data) {
      setApprovalsData(approvalsQuery.data);
    }
  }, [approvalsQuery.data]);

  useEffect(() => {
    if (
      vehiclesQuery.data &&
      partsQuery.data &&
      lowStockQuery.data &&
      operationsQuery.data
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
        pendingApprovals: approvalsData.length,
      });
      setLoading(false);
    }
  }, [vehiclesQuery.data, partsQuery.data, lowStockQuery.data, operationsQuery.data, approvalsData]);

  const handleCardPress = async (route: string) => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.push(route as any);
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await Promise.all([
      vehiclesQuery.refetch(),
      partsQuery.refetch(),
      lowStockQuery.refetch(),
      operationsQuery.refetch(),
      approvalsQuery.refetch(),
    ]);
    setRefreshing(false);
  };

  // Prepare chart data
  const partsDistribution = [
    { label: "متوفر", value: Math.max(0, stats.totalParts - stats.lowStockParts) },
    { label: "حد تنبيه", value: stats.lowStockParts },
  ];

  const vehiclesStatus = [
    { label: "نشط", value: stats.activeVehicles },
    { label: "غير نشط", value: stats.totalVehicles - stats.activeVehicles },
  ];

  // Prepare activity data
  const recentActivities = [
    {
      id: "1",
      title: "عملية جديدة",
      description: "تم إنشاء عملية صيانة جديدة",
      timestamp: new Date(Date.now() - 5 * 60000),
      icon: "🔧",
      type: "operation" as const,
      status: "pending" as const,
    },
    {
      id: "2",
      title: "موافقة مطلوبة",
      description: "طلب موافقة على عملية صيانة",
      timestamp: new Date(Date.now() - 15 * 60000),
      icon: "✓",
      type: "approval" as const,
      status: "pending" as const,
    },
    {
      id: "3",
      title: "تنبيه مخزون",
      description: "القطعة #5 وصلت حد التنبيه",
      timestamp: new Date(Date.now() - 30 * 60000),
      icon: "⚠️",
      type: "alert" as const,
      status: "completed" as const,
    },
  ];

  return (
    <ScreenContainer className="bg-background">
      <ScrollView
        contentContainerStyle={{ flexGrow: 1 }}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={colors.primary}
          />
        }
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

        {/* Alert Banners */}
        <View style={{ paddingHorizontal: 16, paddingTop: 8 }}>
          {stats.lowStockParts > 0 && (
            <AlertBanner
              type="warning"
              title="تنبيه المخزون"
              message={`${stats.lowStockParts} قطع وصلت حد التنبيه. يرجى مراجعة المخزون المنخفض`}
              action={{
                label: "عرض التفاصيل",
                onPress: () => handleCardPress("/inventory"),
              }}
            />
          )}

          {stats.pendingApprovals > 0 && (user as any)?.role === "admin" && (
            <AlertBanner
              type="info"
              title="موافقات معلقة"
              message={`لديك ${stats.pendingApprovals} طلب موافقة ينتظر إجراءك`}
              action={{
                label: "عرض الموافقات",
                onPress: () => handleCardPress("/approvals"),
              }}
            />
          )}
        </View>

        {/* Main Stats Cards */}
        <View style={{ paddingHorizontal: 16, paddingTop: 16 }}>
          <DashboardStats
            columns={2}
            items={[
              {
                id: "vehicles",
                label: "المركبات النشطة",
                value: `${stats.activeVehicles}/${stats.totalVehicles}`,
                icon: "🚗",
                color: colors.primary,
                trend: { direction: "up", percentage: 5 },
                onPress: () => handleCardPress("/vehicles"),
              },
              {
                id: "parts",
                label: "إجمالي القطع",
                value: stats.totalParts,
                icon: "🔧",
                color: colors.success,
                onPress: () => handleCardPress("/inventory"),
              },
              {
                id: "operations",
                label: "عمليات معلقة",
                value: stats.pendingOperations,
                icon: "⏳",
                color: colors.warning,
                trend: { direction: "down", percentage: 10 },
                onPress: () => handleCardPress("/operations"),
              },
              {
                id: "approvals",
                label: "موافقات معلقة",
                value: stats.pendingApprovals,
                icon: "✓",
                color: colors.error,
                onPress: () => handleCardPress("/approvals"),
              },
            ]}
          />
        </View>

        {/* Large Stat Cards */}
        <View style={{ paddingHorizontal: 16, paddingTop: 16 }}>
          <LargeStatCard
            label="المخزون المنخفض"
            value={stats.lowStockParts}
            icon="📦"
            color={colors.warning}
            description={`${stats.lowStockParts} من ${stats.totalParts} قطعة وصلت حد التنبيه`}
            onPress={() => handleCardPress("/inventory")}
          />
        </View>

        {/* Charts */}
        <View style={{ paddingHorizontal: 16, paddingTop: 16 }}>
          <DashboardChart
            title="توزيع المخزون"
            data={partsDistribution}
            type="pie"
          />

          <DashboardChart
            title="حالة المركبات"
            data={vehiclesStatus}
            type="bar"
          />
        </View>

        {/* Recent Activity */}
        <View style={{ paddingHorizontal: 16, paddingTop: 16 }}>
          <RecentActivity
            items={recentActivities}
            title="آخر الأنشطة"
            maxItems={3}
            onViewAll={() => handleCardPress("/notifications")}
          />
        </View>

        {/* Quick Actions */}
        <View style={{ paddingHorizontal: 16, paddingTop: 16, paddingBottom: 32 }}>
          <Text
            style={{
              fontSize: 16,
              fontWeight: "600",
              color: colors.foreground,
              marginBottom: 12,
            }}
          >
            الإجراءات السريعة
          </Text>

          <View
            style={{
              flexDirection: "row",
              gap: 8,
              flexWrap: "wrap",
            }}
          >
            <Pressable
              onPress={() => handleCardPress("/operations/add")}
              style={({ pressed }) => [
                {
                  flex: 1,
                  minWidth: "48%",
                  backgroundColor: colors.primary,
                  borderRadius: 12,
                  padding: 12,
                  alignItems: "center",
                  opacity: pressed ? 0.85 : 1,
                },
              ]}
            >
              <Text style={{ fontSize: 24, marginBottom: 4 }}>➕</Text>
              <Text
                style={{
                  fontSize: 12,
                  fontWeight: "600",
                  color: "#ffffff",
                  textAlign: "center",
                }}
              >
                عملية جديدة
              </Text>
            </Pressable>

            <Pressable
              onPress={() => handleCardPress("/inventory")}
              style={({ pressed }) => [
                {
                  flex: 1,
                  minWidth: "48%",
                  backgroundColor: colors.success,
                  borderRadius: 12,
                  padding: 12,
                  alignItems: "center",
                  opacity: pressed ? 0.85 : 1,
                },
              ]}
            >
              <Text style={{ fontSize: 24, marginBottom: 4 }}>📊</Text>
              <Text
                style={{
                  fontSize: 12,
                  fontWeight: "600",
                  color: "#ffffff",
                  textAlign: "center",
                }}
              >
                المخزون
              </Text>
            </Pressable>

            <Pressable
              onPress={() => handleCardPress("/reports")}
              style={({ pressed }) => [
                {
                  flex: 1,
                  minWidth: "48%",
                  backgroundColor: colors.primary,
                  borderRadius: 12,
                  padding: 12,
                  alignItems: "center",
                  opacity: pressed ? 0.85 : 1,
                },
              ]}
            >
              <Text style={{ fontSize: 24, marginBottom: 4 }}>📈</Text>
              <Text
                style={{
                  fontSize: 12,
                  fontWeight: "600",
                  color: "#ffffff",
                  textAlign: "center",
                }}
              >
                التقارير
              </Text>
            </Pressable>

            <Pressable
              onPress={() => handleCardPress("/settings")}
              style={({ pressed }) => [
                {
                  flex: 1,
                  minWidth: "48%",
                  backgroundColor: colors.muted,
                  borderRadius: 12,
                  padding: 12,
                  alignItems: "center",
                  opacity: pressed ? 0.85 : 1,
                },
              ]}
            >
              <Text style={{ fontSize: 24, marginBottom: 4 }}>⚙️</Text>
              <Text
                style={{
                  fontSize: 12,
                  fontWeight: "600",
                  color: "#ffffff",
                  textAlign: "center",
                }}
              >
                الإعدادات
              </Text>
            </Pressable>
          </View>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}

import { ScrollView, Text, View, Pressable, I18nManager } from "react-native";
import { useState } from "react";
import { ScreenContainer } from "@/components/screen-container";
import { useColors } from "@/hooks/use-colors";
import { trpc } from "@/lib/trpc";
import * as Haptics from "expo-haptics";

I18nManager.forceRTL(true);

export default function ReportsScreen() {
  const colors = useColors();
  const [reportType, setReportType] = useState<"daily" | "monthly">("daily");
  const [selectedDate, setSelectedDate] = useState(new Date());

  const vehiclesQuery = trpc.vehicles.list.useQuery();
  const partsQuery = trpc.parts.list.useQuery();
  const operationsQuery = trpc.operations.list.useQuery();
  const lowStockQuery = trpc.parts.getLowStock.useQuery();

  const handleDateChange = (days: number) => {
    const newDate = new Date(selectedDate);
    newDate.setDate(newDate.getDate() + days);
    setSelectedDate(newDate);
  };

  const getMonthName = (date: Date) => {
    const months = [
      "يناير",
      "فبراير",
      "مارس",
      "أبريل",
      "مايو",
      "يونيو",
      "يوليو",
      "أغسطس",
      "سبتمبر",
      "أكتوبر",
      "نوفمبر",
      "ديسمبر",
    ];
    return months[date.getMonth()];
  };

  const StatBox = ({
    label,
    value,
    icon,
    color,
  }: {
    label: string;
    value: number | string;
    icon: string;
    color: string;
  }) => (
    <View
      style={{
        backgroundColor: colors.surface,
        borderRadius: 12,
        padding: 16,
        marginHorizontal: 8,
        marginVertical: 8,
        flex: 1,
        borderLeftWidth: 4,
        borderLeftColor: color,
      }}
    >
      <Text style={{ fontSize: 24, marginBottom: 8 }}>{icon}</Text>
      <Text
        style={{
          fontSize: 20,
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
    </View>
  );

  const ChartBar = ({
    label,
    value,
    maxValue,
    color,
  }: {
    label: string;
    value: number;
    maxValue: number;
    color: string;
  }) => {
    const percentage = maxValue > 0 ? (value / maxValue) * 100 : 0;

    return (
      <View
        style={{
          marginVertical: 8,
          paddingHorizontal: 16,
        }}
      >
        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
            marginBottom: 4,
          }}
        >
          <Text
            style={{
              fontSize: 12,
              color: colors.foreground,
              fontWeight: "600",
            }}
          >
            {label}
          </Text>
          <Text
            style={{
              fontSize: 12,
              color: colors.muted,
              fontWeight: "600",
            }}
          >
            {value}
          </Text>
        </View>
        <View
          style={{
            backgroundColor: colors.border,
            borderRadius: 4,
            height: 8,
            overflow: "hidden",
          }}
        >
          <View
            style={{
              backgroundColor: color,
              height: "100%",
              width: `${percentage}%`,
            }}
          />
        </View>
      </View>
    );
  };

  const additionCount = operationsQuery.data?.filter((o: any) => o.operationType === "addition").length || 0;
  const consumptionCount = operationsQuery.data?.filter((o: any) => o.operationType === "consumption").length || 0;
  const approvedCount = operationsQuery.data?.filter((o: any) => o.status === "approved").length || 0;
  const pendingCount = operationsQuery.data?.filter((o: any) => o.status === "pending").length || 0;
  const rejectedCount = operationsQuery.data?.filter((o: any) => o.status === "rejected").length || 0;

  const maxOperations = Math.max(additionCount, consumptionCount, approvedCount, pendingCount, rejectedCount, 1);

  return (
    <ScreenContainer className="bg-background">
      <ScrollView showsVerticalScrollIndicator={false}>
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
            التقارير والتحليلات
          </Text>

          {/* Report Type Selector */}
          <View
            style={{
              flexDirection: "row",
              gap: 8,
              marginBottom: 16,
            }}
          >
            <Pressable
              onPress={() => {
                setReportType("daily");
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              }}
              style={({ pressed }) => [
                {
                  flex: 1,
                  backgroundColor:
                    reportType === "daily" ? colors.primary : colors.surface,
                  paddingVertical: 10,
                  borderRadius: 8,
                  alignItems: "center",
                  opacity: pressed ? 0.7 : 1,
                },
              ]}
            >
              <Text
                style={{
                  color: reportType === "daily" ? "#ffffff" : colors.foreground,
                  fontSize: 12,
                  fontWeight: "600",
                }}
              >
                تقرير يومي
              </Text>
            </Pressable>
            <Pressable
              onPress={() => {
                setReportType("monthly");
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              }}
              style={({ pressed }) => [
                {
                  flex: 1,
                  backgroundColor:
                    reportType === "monthly" ? colors.primary : colors.surface,
                  paddingVertical: 10,
                  borderRadius: 8,
                  alignItems: "center",
                  opacity: pressed ? 0.7 : 1,
                },
              ]}
            >
              <Text
                style={{
                  color: reportType === "monthly" ? "#ffffff" : colors.foreground,
                  fontSize: 12,
                  fontWeight: "600",
                }}
              >
                تقرير شهري
              </Text>
            </Pressable>
          </View>

          {/* Date Navigation */}
          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              alignItems: "center",
              backgroundColor: colors.surface,
              borderRadius: 8,
              paddingHorizontal: 12,
              paddingVertical: 10,
              marginBottom: 16,
              borderWidth: 1,
              borderColor: colors.border,
            }}
          >
            <Pressable
              onPress={() => handleDateChange(-1)}
              style={({ pressed }) => [{ opacity: pressed ? 0.7 : 1 }]}
            >
              <Text style={{ fontSize: 18 }}>◀️</Text>
            </Pressable>
            <Text
              style={{
                fontSize: 14,
                fontWeight: "600",
                color: colors.foreground,
              }}
            >
              {reportType === "daily"
                ? selectedDate.toLocaleDateString("ar-SA")
                : `${getMonthName(selectedDate)} ${selectedDate.getFullYear()}`}
            </Text>
            <Pressable
              onPress={() => handleDateChange(1)}
              style={({ pressed }) => [{ opacity: pressed ? 0.7 : 1 }]}
            >
              <Text style={{ fontSize: 18 }}>▶️</Text>
            </Pressable>
          </View>
        </View>

        {/* Overview Statistics */}
        <View style={{ paddingHorizontal: 8, marginBottom: 16 }}>
          <Text
            style={{
              fontSize: 16,
              fontWeight: "600",
              color: colors.foreground,
              marginHorizontal: 8,
              marginBottom: 8,
            }}
          >
            نظرة عامة
          </Text>
          <View style={{ flexDirection: "row", flexWrap: "wrap" }}>
            <StatBox
              label="إجمالي المركبات"
              value={vehiclesQuery.data?.length || 0}
              icon="🚗"
              color={colors.primary}
            />
            <StatBox
              label="إجمالي القطع"
              value={partsQuery.data?.length || 0}
              icon="🔧"
              color={colors.success}
            />
          </View>
          <View style={{ flexDirection: "row", flexWrap: "wrap" }}>
            <StatBox
              label="قطع بحد تنبيه"
              value={lowStockQuery.data?.length || 0}
              icon="⚠️"
              color={colors.warning}
            />
            <StatBox
              label="إجمالي العمليات"
              value={operationsQuery.data?.length || 0}
              icon="📋"
              color={colors.primary}
            />
          </View>
        </View>

        {/* Operations Analysis */}
        <View
          style={{
            backgroundColor: colors.surface,
            borderRadius: 12,
            marginHorizontal: 16,
            marginBottom: 16,
            padding: 16,
            borderWidth: 1,
            borderColor: colors.border,
          }}
        >
          <Text
            style={{
              fontSize: 14,
              fontWeight: "600",
              color: colors.foreground,
              marginBottom: 12,
            }}
          >
            تحليل العمليات
          </Text>

          <ChartBar
            label="عمليات إضافة"
            value={additionCount}
            maxValue={maxOperations}
            color={colors.success}
          />
          <ChartBar
            label="عمليات استهلاك"
            value={consumptionCount}
            maxValue={maxOperations}
            color={colors.error}
          />
        </View>

        {/* Approval Status Analysis */}
        <View
          style={{
            backgroundColor: colors.surface,
            borderRadius: 12,
            marginHorizontal: 16,
            marginBottom: 16,
            padding: 16,
            borderWidth: 1,
            borderColor: colors.border,
          }}
        >
          <Text
            style={{
              fontSize: 14,
              fontWeight: "600",
              color: colors.foreground,
              marginBottom: 12,
            }}
          >
            حالة الموافقات
          </Text>

          <ChartBar
            label="موافق عليها"
            value={approvedCount}
            maxValue={maxOperations}
            color={colors.success}
          />
          <ChartBar
            label="قيد الانتظار"
            value={pendingCount}
            maxValue={maxOperations}
            color={colors.warning}
          />
          <ChartBar
            label="مرفوضة"
            value={rejectedCount}
            maxValue={maxOperations}
            color={colors.error}
          />
        </View>

        {/* Key Metrics */}
        <View
          style={{
            backgroundColor: colors.surface,
            borderRadius: 12,
            marginHorizontal: 16,
            marginBottom: 32,
            padding: 16,
            borderWidth: 1,
            borderColor: colors.border,
          }}
        >
          <Text
            style={{
              fontSize: 14,
              fontWeight: "600",
              color: colors.foreground,
              marginBottom: 12,
            }}
          >
            المؤشرات الرئيسية
          </Text>

          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              marginBottom: 12,
              paddingBottom: 12,
              borderBottomWidth: 1,
              borderBottomColor: colors.border,
            }}
          >
            <Text style={{ color: colors.muted, fontSize: 12 }}>
              معدل الموافقة
            </Text>
            <Text
              style={{
                color: colors.foreground,
                fontSize: 12,
                fontWeight: "600",
              }}
            >
              {operationsQuery.data && operationsQuery.data.length > 0
                ? Math.round(
                    (approvedCount / operationsQuery.data.length) * 100
                  )
                : 0}
              %
            </Text>
          </View>

          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              marginBottom: 12,
              paddingBottom: 12,
              borderBottomWidth: 1,
              borderBottomColor: colors.border,
            }}
          >
            <Text style={{ color: colors.muted, fontSize: 12 }}>
              نسبة الرفض
            </Text>
            <Text
              style={{
                color: colors.foreground,
                fontSize: 12,
                fontWeight: "600",
              }}
            >
              {operationsQuery.data && operationsQuery.data.length > 0
                ? Math.round(
                    (rejectedCount / operationsQuery.data.length) * 100
                  )
                : 0}
              %
            </Text>
          </View>

          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
            }}
          >
            <Text style={{ color: colors.muted, fontSize: 12 }}>
              قطع بحد تنبيه
            </Text>
            <Text
              style={{
                color: colors.foreground,
                fontSize: 12,
                fontWeight: "600",
              }}
            >
              {lowStockQuery.data?.length || 0} قطعة
            </Text>
          </View>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}

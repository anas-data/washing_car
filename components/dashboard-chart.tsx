import { View, Text, Dimensions } from "react-native";
import { useColors } from "@/hooks/use-colors";

interface ChartDataPoint {
  label: string;
  value: number;
  color?: string;
}

interface DashboardChartProps {
  title: string;
  data: ChartDataPoint[];
  type: "bar" | "pie" | "line";
  height?: number;
}

/**
 * Dashboard Chart Component
 * 
 * Displays data visualizations in different formats:
 * - Bar chart: Horizontal bars with values
 * - Pie chart: Circular distribution
 * - Line chart: Trend visualization
 * 
 * Note: For production, consider using react-native-svg or plotly
 */
export function DashboardChart({
  title,
  data,
  type,
  height = 200,
}: DashboardChartProps) {
  const colors = useColors();
  const screenWidth = Dimensions.get("window").width;
  const chartWidth = screenWidth - 32; // Account for padding

  const maxValue = Math.max(...data.map((d) => d.value), 1);

  const defaultColors = [
    colors.primary,
    colors.success,
    colors.warning,
    colors.error,
    colors.muted,
  ];

  if (type === "bar") {
    return (
      <View
        style={{
          backgroundColor: colors.surface,
          borderRadius: 12,
          padding: 16,
          marginBottom: 12,
        }}
      >
        <Text
          style={{
            fontSize: 16,
            fontWeight: "600",
            color: colors.foreground,
            marginBottom: 12,
          }}
        >
          {title}
        </Text>

        <View style={{ gap: 12 }}>
          {data.map((item, index) => (
            <View key={item.label}>
              <View
                style={{
                  flexDirection: "row",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: 4,
                }}
              >
                <Text
                  style={{
                    fontSize: 12,
                    color: colors.muted,
                    flex: 1,
                  }}
                >
                  {item.label}
                </Text>
                <Text
                  style={{
                    fontSize: 12,
                    fontWeight: "600",
                    color: colors.foreground,
                  }}
                >
                  {item.value}
                </Text>
              </View>
              <View
                style={{
                  height: 8,
                  backgroundColor: colors.border,
                  borderRadius: 4,
                  overflow: "hidden",
                }}
              >
                <View
                  style={{
                    height: "100%",
                    width: `${(item.value / maxValue) * 100}%`,
                    backgroundColor:
                      item.color || defaultColors[index % defaultColors.length],
                    borderRadius: 4,
                  }}
                />
              </View>
            </View>
          ))}
        </View>
      </View>
    );
  }

  if (type === "pie") {
    const total = data.reduce((sum, item) => sum + item.value, 0);

    return (
      <View
        style={{
          backgroundColor: colors.surface,
          borderRadius: 12,
          padding: 16,
          marginBottom: 12,
        }}
      >
        <Text
          style={{
            fontSize: 16,
            fontWeight: "600",
            color: colors.foreground,
            marginBottom: 12,
          }}
        >
          {title}
        </Text>

        {/* Simple pie chart representation using text */}
        <View style={{ marginBottom: 12 }}>
          {data.map((item, index) => {
            const percentage = ((item.value / total) * 100).toFixed(1);
            return (
              <View
                key={item.label}
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  marginBottom: 8,
                }}
              >
                <View
                  style={{
                    width: 12,
                    height: 12,
                    borderRadius: 6,
                    backgroundColor:
                      item.color || defaultColors[index % defaultColors.length],
                    marginRight: 8,
                  }}
                />
                <Text
                  style={{
                    fontSize: 12,
                    color: colors.muted,
                    flex: 1,
                  }}
                >
                  {item.label}
                </Text>
                <Text
                  style={{
                    fontSize: 12,
                    fontWeight: "600",
                    color: colors.foreground,
                  }}
                >
                  {percentage}%
                </Text>
              </View>
            );
          })}
        </View>

        {/* Legend with counts */}
        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-around",
            paddingTop: 12,
            borderTopWidth: 1,
            borderTopColor: colors.border,
          }}
        >
          {data.map((item) => (
            <View key={item.label} style={{ alignItems: "center" }}>
              <Text
                style={{
                  fontSize: 14,
                  fontWeight: "700",
                  color: colors.foreground,
                }}
              >
                {item.value}
              </Text>
              <Text
                style={{
                  fontSize: 10,
                  color: colors.muted,
                  marginTop: 2,
                }}
              >
                {item.label}
              </Text>
            </View>
          ))}
        </View>
      </View>
    );
  }

  if (type === "line") {
    return (
      <View
        style={{
          backgroundColor: colors.surface,
          borderRadius: 12,
          padding: 16,
          marginBottom: 12,
        }}
      >
        <Text
          style={{
            fontSize: 16,
            fontWeight: "600",
            color: colors.foreground,
            marginBottom: 12,
          }}
        >
          {title}
        </Text>

        {/* Simple line chart representation */}
        <View
          style={{
            height: 120,
            flexDirection: "row",
            alignItems: "flex-end",
            justifyContent: "space-around",
            marginBottom: 12,
            paddingVertical: 8,
          }}
        >
          {data.map((item, index) => (
            <View
              key={item.label}
              style={{
                alignItems: "center",
                flex: 1,
              }}
            >
              <View
                style={{
                  width: "70%",
                  height: (item.value / maxValue) * 100,
                  backgroundColor:
                    item.color || defaultColors[index % defaultColors.length],
                  borderRadius: 4,
                  marginBottom: 8,
                }}
              />
              <Text
                style={{
                  fontSize: 10,
                  color: colors.muted,
                  textAlign: "center",
                }}
              >
                {item.label}
              </Text>
            </View>
          ))}
        </View>

        {/* Values legend */}
        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-around",
            paddingTop: 12,
            borderTopWidth: 1,
            borderTopColor: colors.border,
          }}
        >
          {data.map((item) => (
            <View key={item.label} style={{ alignItems: "center" }}>
              <Text
                style={{
                  fontSize: 12,
                  fontWeight: "600",
                  color: colors.foreground,
                }}
              >
                {item.value}
              </Text>
              <Text
                style={{
                  fontSize: 9,
                  color: colors.muted,
                  marginTop: 2,
                }}
              >
                {item.label}
              </Text>
            </View>
          ))}
        </View>
      </View>
    );
  }

  return null;
}

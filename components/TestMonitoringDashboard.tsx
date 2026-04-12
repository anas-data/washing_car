/**
 * Test Monitoring Dashboard Component
 * Displays real-time test performance metrics
 */

import React, { useEffect, useState } from "react";
import { View, Text, ScrollView, RefreshControl } from "react-native";

interface TestMetrics {
  timestamp: string;
  totalTests: number;
  passedTests: number;
  failedTests: number;
  skippedTests: number;
  duration: number;
  successRate: number;
}

interface DashboardProps {
  metrics?: TestMetrics[];
  isLoading?: boolean;
  onRefresh?: () => void;
}

export function TestMonitoringDashboard({
  metrics = [],
  isLoading = false,
  onRefresh = () => {},
}: DashboardProps) {
  const [selectedMetric, setSelectedMetric] = useState<TestMetrics | null>(null);

  useEffect(() => {
    if (metrics.length > 0) {
      setSelectedMetric(metrics[metrics.length - 1]);
    }
  }, [metrics]);

  if (!selectedMetric) {
    return (
      <View className="flex-1 items-center justify-center bg-background p-4">
        <Text className="text-foreground text-lg">No test data available</Text>
      </View>
    );
  }

  const recentMetrics = metrics.slice(-7);

  return (
    <ScrollView
      className="flex-1 bg-background"
      refreshControl={<RefreshControl refreshing={isLoading} onRefresh={onRefresh} />}
    >
      {/* Header */}
      <View className="bg-surface p-4 border-b border-border">
        <Text className="text-foreground text-2xl font-bold">Test Performance Monitor</Text>
        <Text className="text-muted text-sm mt-1">
          Last updated: {new Date(selectedMetric.timestamp).toLocaleString()}
        </Text>
      </View>

      {/* Summary Cards */}
      <View className="p-4 gap-3">
        {/* Success Rate Card */}
        <View className="bg-surface rounded-lg p-4 border border-border">
          <Text className="text-muted text-sm">Success Rate</Text>
          <View className="flex-row items-baseline gap-2 mt-2">
            <Text className="text-foreground text-3xl font-bold">
              {selectedMetric.successRate.toFixed(1)}%
            </Text>
            <View
              className={`px-2 py-1 rounded ${
                selectedMetric.successRate >= 95
                  ? "bg-green-100"
                  : selectedMetric.successRate >= 80
                    ? "bg-yellow-100"
                    : "bg-red-100"
              }`}
            >
              <Text
                className={`text-xs font-semibold ${
                  selectedMetric.successRate >= 95
                    ? "text-green-700"
                    : selectedMetric.successRate >= 80
                      ? "text-yellow-700"
                      : "text-red-700"
                }`}
              >
                {selectedMetric.successRate >= 95 ? "Excellent" : selectedMetric.successRate >= 80 ? "Good" : "Poor"}
              </Text>
            </View>
          </View>
        </View>

        {/* Test Stats Grid */}
        <View className="flex-row flex-wrap gap-3">
          {/* Total Tests */}
          <View className="bg-surface rounded-lg p-4 border border-border flex-1 min-w-[48%]">
            <Text className="text-muted text-sm">Total Tests</Text>
            <Text className="text-foreground text-2xl font-bold mt-2">{selectedMetric.totalTests}</Text>
          </View>

          {/* Duration */}
          <View className="bg-surface rounded-lg p-4 border border-border flex-1 min-w-[48%]">
            <Text className="text-muted text-sm">Duration</Text>
            <Text className="text-foreground text-2xl font-bold mt-2">{selectedMetric.duration.toFixed(2)}s</Text>
          </View>

          {/* Passed */}
          <View className="bg-green-50 rounded-lg p-4 border border-green-200 flex-1 min-w-[48%]">
            <Text className="text-green-700 text-sm">Passed</Text>
            <Text className="text-green-900 text-2xl font-bold mt-2">{selectedMetric.passedTests}</Text>
          </View>

          {/* Failed */}
          <View className="bg-red-50 rounded-lg p-4 border border-red-200 flex-1 min-w-[48%]">
            <Text className="text-red-700 text-sm">Failed</Text>
            <Text className="text-red-900 text-2xl font-bold mt-2">{selectedMetric.failedTests}</Text>
          </View>
        </View>

        {/* Skipped Tests */}
        {selectedMetric.skippedTests > 0 && (
          <View className="bg-yellow-50 rounded-lg p-4 border border-yellow-200">
            <Text className="text-yellow-700 text-sm">Skipped Tests</Text>
            <Text className="text-yellow-900 text-2xl font-bold mt-2">{selectedMetric.skippedTests}</Text>
          </View>
        )}
      </View>

      {/* Charts */}
      {recentMetrics.length > 1 && (
        <View className="p-4 gap-4">
          {/* Success Rate Trend */}
          <View className="bg-surface rounded-lg p-4 border border-border">
            <Text className="text-foreground font-semibold mb-3">Success Rate Trend</Text>
            <View className="gap-2">
              {recentMetrics.map((metric, index) => (
                <View key={index} className="flex-row items-center gap-2">
                  <Text className="text-muted text-xs w-8">R{index + 1}</Text>
                  <View className="flex-1 h-6 bg-gray-200 rounded overflow-hidden">
                    <View
                      className="h-full bg-green-500"
                      style={{ width: `${metric.successRate}%` }}
                    />
                  </View>
                  <Text className="text-foreground text-xs font-semibold w-10 text-right">
                    {metric.successRate.toFixed(0)}%
                  </Text>
                </View>
              ))}
            </View>
          </View>

          {/* Duration Trend */}
          <View className="bg-surface rounded-lg p-4 border border-border">
            <Text className="text-foreground font-semibold mb-3">Duration Trend (seconds)</Text>
            <View className="gap-2">
              {recentMetrics.map((metric, index) => {
                const maxDuration = Math.max(...recentMetrics.map((m) => m.duration));
                return (
                  <View key={index} className="flex-row items-center gap-2">
                    <Text className="text-muted text-xs w-8">R{index + 1}</Text>
                    <View className="flex-1 h-6 bg-gray-200 rounded overflow-hidden">
                      <View
                        className="h-full bg-blue-500"
                        style={{ width: `${(metric.duration / maxDuration) * 100}%` }}
                      />
                    </View>
                    <Text className="text-foreground text-xs font-semibold w-10 text-right">
                      {metric.duration.toFixed(2)}s
                    </Text>
                  </View>
                );
              })}
            </View>
          </View>
        </View>
      )}

      {/* Test History */}
      {metrics.length > 0 && (
        <View className="p-4">
          <Text className="text-foreground font-semibold mb-3">Recent Test Runs</Text>
          <View className="gap-2">
            {metrics
              .slice()
              .reverse()
              .slice(0, 5)
              .map((metric, index) => (
                <View
                  key={index}
                  className="bg-surface rounded-lg p-3 border border-border flex-row justify-between items-center mb-2"
                >
                  <View className="flex-1">
                    <Text className="text-foreground text-sm font-semibold">
                      {new Date(metric.timestamp).toLocaleTimeString()}
                    </Text>
                    <Text className="text-muted text-xs">
                      {metric.passedTests}/{metric.totalTests} passed
                    </Text>
                  </View>
                  <View
                    className={`px-3 py-1 rounded ${
                      metric.successRate >= 95
                        ? "bg-green-100"
                        : metric.successRate >= 80
                          ? "bg-yellow-100"
                          : "bg-red-100"
                    }`}
                  >
                    <Text
                      className={`text-sm font-bold ${
                        metric.successRate >= 95
                          ? "text-green-700"
                          : metric.successRate >= 80
                            ? "text-yellow-700"
                            : "text-red-700"
                      }`}
                    >
                      {metric.successRate.toFixed(0)}%
                    </Text>
                  </View>
                </View>
              ))}
          </View>
        </View>
      )}
    </ScrollView>
  );
}

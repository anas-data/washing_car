/**
 * Test Monitoring Utilities
 * Provides functions for collecting and analyzing test performance data
 */

export interface TestMetrics {
  timestamp: string;
  totalTests: number;
  passedTests: number;
  failedTests: number;
  skippedTests: number;
  duration: number;
  successRate: number;
  testFiles: TestFileMetrics[];
}

export interface TestFileMetrics {
  name: string;
  tests: number;
  passed: number;
  failed: number;
  skipped: number;
  duration: number;
}

export interface PerformanceAnalysis {
  current: TestMetrics;
  previous?: TestMetrics;
  trend: "improving" | "stable" | "declining";
  regressions: string[];
  improvements: string[];
  recommendations: string[];
}

/**
 * Analyze test performance and detect trends
 */
export function analyzePerformance(
  current: TestMetrics,
  previous?: TestMetrics
): PerformanceAnalysis {
  const regressions: string[] = [];
  const improvements: string[] = [];
  const recommendations: string[] = [];

  let trend: "improving" | "stable" | "declining" = "stable";

  if (previous) {
    // Check success rate trend
    const successDiff = current.successRate - previous.successRate;
    if (successDiff > 1) {
      trend = "improving";
      improvements.push(`Success rate improved by ${successDiff.toFixed(2)}%`);
    } else if (successDiff < -1) {
      trend = "declining";
      regressions.push(`Success rate declined by ${Math.abs(successDiff).toFixed(2)}%`);
    }

    // Check duration trend
    const durationDiff = current.duration - previous.duration;
    if (durationDiff > 0.5) {
      regressions.push(`Test duration increased by ${durationDiff.toFixed(2)}s`);
      recommendations.push("Consider optimizing slow tests");
    } else if (durationDiff < -0.5) {
      improvements.push(`Test duration improved by ${Math.abs(durationDiff).toFixed(2)}s`);
    }

    // Check for new failures
    if (current.failedTests > previous.failedTests) {
      const newFailures = current.failedTests - previous.failedTests;
      regressions.push(`${newFailures} new test failure(s) detected`);
      recommendations.push("Review recent code changes for breaking changes");
    }

    // Check for fixed tests
    if (current.failedTests < previous.failedTests) {
      const fixed = previous.failedTests - current.failedTests;
      improvements.push(`${fixed} test(s) fixed`);
    }
  }

  // Generate recommendations based on current state
  if (current.successRate < 80) {
    recommendations.push("Critical: Success rate below 80%, immediate action required");
  } else if (current.successRate < 95) {
    recommendations.push("Warning: Success rate below 95%, investigate failures");
  }

  if (current.duration > 5) {
    recommendations.push("Test suite is taking longer than 5 seconds, consider optimization");
  }

  if (current.failedTests > 0) {
    recommendations.push(`Fix ${current.failedTests} failing test(s)`);
  }

  if (current.skippedTests > 0) {
    recommendations.push(`Review and enable ${current.skippedTests} skipped test(s)`);
  }

  return {
    current,
    previous,
    trend,
    regressions,
    improvements,
    recommendations,
  };
}

/**
 * Format performance analysis as readable text
 */
export function formatAnalysis(analysis: PerformanceAnalysis): string {
  let report = "📊 Test Performance Analysis\n";
  report += "=".repeat(50) + "\n\n";

  // Current Status
  report += "📈 Current Status:\n";
  report += `  Success Rate: ${analysis.current.successRate.toFixed(2)}%\n`;
  report += `  Total Tests: ${analysis.current.totalTests}\n`;
  report += `  Passed: ${analysis.current.passedTests}\n`;
  report += `  Failed: ${analysis.current.failedTests}\n`;
  report += `  Duration: ${analysis.current.duration.toFixed(2)}s\n\n`;

  // Trend
  report += `Trend: ${analysis.trend === "improving" ? "📈 Improving" : analysis.trend === "declining" ? "📉 Declining" : "➡️ Stable"}\n\n`;

  // Improvements
  if (analysis.improvements.length > 0) {
    report += "✅ Improvements:\n";
    analysis.improvements.forEach((imp) => {
      report += `  • ${imp}\n`;
    });
    report += "\n";
  }

  // Regressions
  if (analysis.regressions.length > 0) {
    report += "⚠️ Regressions:\n";
    analysis.regressions.forEach((reg) => {
      report += `  • ${reg}\n`;
    });
    report += "\n";
  }

  // Recommendations
  if (analysis.recommendations.length > 0) {
    report += "💡 Recommendations:\n";
    analysis.recommendations.forEach((rec) => {
      report += `  • ${rec}\n`;
    });
    report += "\n";
  }

  return report;
}

/**
 * Generate alert if performance degrades
 */
export function shouldAlert(analysis: PerformanceAnalysis): boolean {
  // Alert if success rate drops below 80%
  if (analysis.current.successRate < 80) return true;

  // Alert if new failures detected
  if (analysis.regressions.some((r) => r.includes("new test failure"))) return true;

  // Alert if success rate declined significantly
  if (analysis.regressions.some((r) => r.includes("Success rate declined"))) return true;

  return false;
}

/**
 * Generate alert message
 */
export function generateAlertMessage(analysis: PerformanceAnalysis): string {
  let message = "🚨 Test Performance Alert\n\n";

  if (analysis.current.successRate < 80) {
    message += `Critical: Success rate is ${analysis.current.successRate.toFixed(2)}% (below 80%)\n`;
  }

  if (analysis.regressions.length > 0) {
    message += "\nRegressions detected:\n";
    analysis.regressions.forEach((r) => {
      message += `• ${r}\n`;
    });
  }

  if (analysis.recommendations.length > 0) {
    message += "\nRecommended actions:\n";
    analysis.recommendations.slice(0, 3).forEach((r) => {
      message += `• ${r}\n`;
    });
  }

  return message;
}

/**
 * Calculate statistics from multiple test runs
 */
export function calculateStatistics(metrics: TestMetrics[]) {
  if (metrics.length === 0) {
    return {
      averageSuccessRate: 0,
      averageDuration: 0,
      maxDuration: 0,
      minDuration: 0,
      totalRuns: 0,
      failureRate: 0,
    };
  }

  const successRates = metrics.map((m) => m.successRate);
  const durations = metrics.map((m) => m.duration);
  const failureRates = metrics.map((m) => (m.failedTests / m.totalTests) * 100);

  return {
    averageSuccessRate: successRates.reduce((a, b) => a + b, 0) / successRates.length,
    averageDuration: durations.reduce((a, b) => a + b, 0) / durations.length,
    maxDuration: Math.max(...durations),
    minDuration: Math.min(...durations),
    totalRuns: metrics.length,
    failureRate: failureRates.reduce((a, b) => a + b, 0) / failureRates.length,
  };
}

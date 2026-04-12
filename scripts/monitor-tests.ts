/**
 * Test Performance Monitoring Script
 * Runs tests periodically and collects performance metrics
 */

import { execSync } from "child_process";
import * as fs from "fs";
import * as path from "path";

interface TestResult {
  timestamp: string;
  totalTests: number;
  passedTests: number;
  failedTests: number;
  skippedTests: number;
  duration: number;
  successRate: number;
  testFiles: TestFileResult[];
  errors: string[];
}

interface TestFileResult {
  name: string;
  tests: number;
  passed: number;
  failed: number;
  skipped: number;
  duration: number;
}

interface PerformanceMetrics {
  averageDuration: number;
  maxDuration: number;
  minDuration: number;
  successRateAverage: number;
  trend: "improving" | "stable" | "declining";
}

const REPORTS_DIR = path.join(process.cwd(), "test-reports");
const METRICS_FILE = path.join(REPORTS_DIR, "metrics.json");

// Ensure reports directory exists
if (!fs.existsSync(REPORTS_DIR)) {
  fs.mkdirSync(REPORTS_DIR, { recursive: true });
}

function parseTestOutput(output: string): TestResult {
  const lines = output.split("\n");
  const timestamp = new Date().toISOString();
  const result: TestResult = {
    timestamp,
    totalTests: 0,
    passedTests: 0,
    failedTests: 0,
    skippedTests: 0,
    duration: 0,
    successRate: 0,
    testFiles: [],
    errors: [],
  };

  let durationMatch = null;
  let testSummaryMatch = null;

  for (const line of lines) {
    // Parse test file results
    const fileMatch = line.match(/✓\s+(.+?)\s+\((\d+)\s+tests?\)/);
    if (fileMatch) {
      result.testFiles.push({
        name: fileMatch[1],
        tests: parseInt(fileMatch[2]),
        passed: parseInt(fileMatch[2]),
        failed: 0,
        skipped: 0,
        duration: 0,
      });
    }

    // Parse failed tests
    const failMatch = line.match(/✗\s+(.+?)\s+\((\d+)\s+failed/);
    if (failMatch) {
      result.testFiles.push({
        name: failMatch[1],
        tests: parseInt(failMatch[2]),
        passed: 0,
        failed: parseInt(failMatch[2]),
        skipped: 0,
        duration: 0,
      });
    }

    // Parse skipped tests
    const skipMatch = line.match(/↓\s+(.+?)\s+\((\d+)\s+test\s+\|\s+(\d+)\s+skipped\)/);
    if (skipMatch) {
      result.testFiles.push({
        name: skipMatch[1],
        tests: parseInt(skipMatch[2]),
        passed: parseInt(skipMatch[2]) - parseInt(skipMatch[3]),
        failed: 0,
        skipped: parseInt(skipMatch[3]),
        duration: 0,
      });
    }

    // Parse duration
    durationMatch = line.match(/Duration\s+(\d+(?:\.\d+)?)/);
    if (durationMatch) {
      result.duration = parseFloat(durationMatch[1]);
    }

    // Parse test summary
    testSummaryMatch = line.match(/Tests\s+(\d+)\s+passed\s+\|\s+(\d+)\s+skipped/);
    if (testSummaryMatch) {
      result.passedTests = parseInt(testSummaryMatch[1]);
      result.skippedTests = parseInt(testSummaryMatch[2]);
    }

    testSummaryMatch = line.match(/Tests\s+(\d+)\s+passed/);
    if (testSummaryMatch && !result.passedTests) {
      result.passedTests = parseInt(testSummaryMatch[1]);
    }

    testSummaryMatch = line.match(/Tests\s+(\d+)\s+failed/);
    if (testSummaryMatch) {
      result.failedTests = parseInt(testSummaryMatch[1]);
    }

    // Parse total tests
    testSummaryMatch = line.match(/Tests\s+\d+\s+\w+\s+\((\d+)\)/);
    if (testSummaryMatch) {
      result.totalTests = parseInt(testSummaryMatch[1]);
    }
  }

  // Calculate success rate
  if (result.totalTests > 0) {
    result.successRate = (result.passedTests / result.totalTests) * 100;
  }

  return result;
}

function runTests(): TestResult {
  try {
    console.log("🧪 Running tests...");
    const output = execSync("pnpm test 2>&1", { encoding: "utf-8" });
    const result = parseTestOutput(output);

    if (result.failedTests > 0) {
      result.errors.push(`${result.failedTests} tests failed`);
    }

    console.log(`✅ Tests completed: ${result.passedTests}/${result.totalTests} passed`);
    return result;
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error("❌ Error running tests:", errorMessage);

    return {
      timestamp: new Date().toISOString(),
      totalTests: 0,
      passedTests: 0,
      failedTests: 0,
      skippedTests: 0,
      duration: 0,
      successRate: 0,
      testFiles: [],
      errors: [errorMessage],
    };
  }
}

function calculateMetrics(results: TestResult[]): PerformanceMetrics {
  if (results.length === 0) {
    return {
      averageDuration: 0,
      maxDuration: 0,
      minDuration: 0,
      successRateAverage: 0,
      trend: "stable",
    };
  }

  const durations = results.map((r) => r.duration);
  const successRates = results.map((r) => r.successRate);

  const averageDuration = durations.reduce((a, b) => a + b, 0) / durations.length;
  const maxDuration = Math.max(...durations);
  const minDuration = Math.min(...durations);
  const successRateAverage = successRates.reduce((a, b) => a + b, 0) / successRates.length;

  // Determine trend
  let trend: "improving" | "stable" | "declining" = "stable";
  if (results.length >= 3) {
    const recent = successRates.slice(-3);
    const older = successRates.slice(-6, -3);
    if (older.length > 0) {
      const recentAvg = recent.reduce((a, b) => a + b, 0) / recent.length;
      const olderAvg = older.reduce((a, b) => a + b, 0) / older.length;
      if (recentAvg > olderAvg + 1) trend = "improving";
      else if (recentAvg < olderAvg - 1) trend = "declining";
    }
  }

  return {
    averageDuration,
    maxDuration,
    minDuration,
    successRateAverage,
    trend,
  };
}

function saveResults(result: TestResult): void {
  // Save individual result
  const resultFile = path.join(REPORTS_DIR, `result-${Date.now()}.json`);
  fs.writeFileSync(resultFile, JSON.stringify(result, null, 2));

  // Update metrics history
  let history: TestResult[] = [];
  if (fs.existsSync(METRICS_FILE)) {
    const data = fs.readFileSync(METRICS_FILE, "utf-8");
    history = JSON.parse(data);
  }

  history.push(result);

  // Keep only last 100 results
  if (history.length > 100) {
    history = history.slice(-100);
  }

  fs.writeFileSync(METRICS_FILE, JSON.stringify(history, null, 2));

  // Generate report
  const metrics = calculateMetrics(history);
  const report = {
    lastRun: result.timestamp,
    currentResult: result,
    metrics,
    history: history.slice(-10), // Last 10 results
  };

  const reportFile = path.join(REPORTS_DIR, "latest-report.json");
  fs.writeFileSync(reportFile, JSON.stringify(report, null, 2));

  console.log(`📊 Results saved to ${reportFile}`);
}

function generateMarkdownReport(): void {
  const reportFile = path.join(REPORTS_DIR, "latest-report.json");
  if (!fs.existsSync(reportFile)) return;

  const report = JSON.parse(fs.readFileSync(reportFile, "utf-8"));
  const { currentResult, metrics, history } = report;

  let markdown = `# Test Performance Report\n\n`;
  markdown += `**Last Updated:** ${new Date(currentResult.timestamp).toLocaleString()}\n\n`;

  // Current Status
  markdown += `## Current Status\n\n`;
  markdown += `| Metric | Value |\n`;
  markdown += `|--------|-------|\n`;
  markdown += `| Total Tests | ${currentResult.totalTests} |\n`;
  markdown += `| Passed | ${currentResult.passedTests} ✅ |\n`;
  markdown += `| Failed | ${currentResult.failedTests} ❌ |\n`;
  markdown += `| Skipped | ${currentResult.skippedTests} ⏭️ |\n`;
  markdown += `| Success Rate | ${currentResult.successRate.toFixed(2)}% |\n`;
  markdown += `| Duration | ${currentResult.duration.toFixed(2)}s |\n\n`;

  // Performance Metrics
  markdown += `## Performance Metrics\n\n`;
  markdown += `| Metric | Value |\n`;
  markdown += `|--------|-------|\n`;
  markdown += `| Average Duration | ${metrics.averageDuration.toFixed(2)}s |\n`;
  markdown += `| Max Duration | ${metrics.maxDuration.toFixed(2)}s |\n`;
  markdown += `| Min Duration | ${metrics.minDuration.toFixed(2)}s |\n`;
  markdown += `| Success Rate (Avg) | ${metrics.successRateAverage.toFixed(2)}% |\n`;
  markdown += `| Trend | ${metrics.trend === "improving" ? "📈 Improving" : metrics.trend === "declining" ? "📉 Declining" : "➡️ Stable"} |\n\n`;

  // Test Files
  markdown += `## Test Files\n\n`;
  markdown += `| File | Tests | Passed | Failed | Duration |\n`;
  markdown += `|------|-------|--------|--------|----------|\n`;
  currentResult.testFiles.forEach((file: TestFileResult) => {
    markdown += `| ${file.name} | ${file.tests} | ${file.passed} | ${file.failed} | ${file.duration.toFixed(2)}s |\n`;
  });
  markdown += `\n`;

  // History Chart
  markdown += `## Success Rate History (Last 10 Runs)\n\n`;
  markdown += `\`\`\`\n`;
  history.forEach((result: TestResult, index: number) => {
    const rate = result.successRate.toFixed(0);
    const bar = "█".repeat(Math.round(result.successRate / 5));
    markdown += `${index + 1}. ${rate}% ${bar}\n`;
  });
  markdown += `\`\`\`\n`;

  // Errors
  if (currentResult.errors.length > 0) {
    markdown += `## Errors\n\n`;
    currentResult.errors.forEach((error: string) => {
      markdown += `- ${error}\n`;
    });
  }

  const mdFile = path.join(REPORTS_DIR, "TEST_REPORT.md");
  fs.writeFileSync(mdFile, markdown);
  console.log(`📄 Markdown report saved to ${mdFile}`);
}

function main(): void {
  console.log("🚀 Starting Test Performance Monitor\n");

  const result = runTests();
  saveResults(result);
  generateMarkdownReport();

  console.log("\n✨ Monitoring complete!");
  console.log(`📁 Reports saved to: ${REPORTS_DIR}`);
}

main();

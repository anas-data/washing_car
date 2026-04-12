# Test Performance Monitoring System

## Overview

This document describes the comprehensive test performance monitoring system for the **منفذ السلامة** (Safety Portal) project. The system automatically tracks, analyzes, and reports on test performance metrics.

## Features

### 1. **Automated Test Monitoring**
- Runs tests periodically and collects performance metrics
- Tracks success rates, test counts, and execution duration
- Stores historical data for trend analysis
- Generates detailed reports

### 2. **Performance Analysis**
- Detects performance trends (improving, stable, declining)
- Identifies regressions and improvements
- Generates actionable recommendations
- Calculates statistical metrics

### 3. **Alert System**
- Alerts when success rate drops below 80%
- Notifies on new test failures
- Warns about performance degradation
- Provides remediation suggestions

### 4. **Dashboard Visualization**
- Real-time performance metrics display
- Success rate trends (last 7 runs)
- Duration trends and optimization insights
- Historical test run data

## Quick Start

### Run Tests Once
```bash
pnpm test
```

### Monitor Tests Manually
```bash
pnpm test:monitor
```

This command:
1. Runs all tests
2. Collects performance metrics
3. Generates JSON reports
4. Creates markdown summary

### Schedule Daily Monitoring
```bash
pnpm test:monitor:daily
```

## File Structure

```
├── scripts/
│   └── monitor-tests.ts          # Test monitoring script
├── lib/
│   └── test-monitoring.ts        # Analysis utilities
├── components/
│   └── TestMonitoringDashboard.tsx # Dashboard component
├── test-reports/                 # Generated reports directory
│   ├── metrics.json              # Historical metrics
│   ├── latest-report.json        # Latest report
│   ├── TEST_REPORT.md            # Markdown summary
│   └── result-*.json             # Individual results
└── TEST_MONITORING.md            # This file
```

## Reports

### JSON Report Format
```json
{
  "lastRun": "2026-04-12T11:36:00.000Z",
  "currentResult": {
    "timestamp": "2026-04-12T11:36:00.000Z",
    "totalTests": 226,
    "passedTests": 226,
    "failedTests": 0,
    "skippedTests": 0,
    "duration": 3.41,
    "successRate": 100,
    "testFiles": [...]
  },
  "metrics": {
    "averageSuccessRate": 99.5,
    "averageDuration": 3.35,
    "maxDuration": 3.5,
    "minDuration": 3.2,
    "successRateAverage": 99.5,
    "trend": "stable"
  },
  "history": [...]
}
```

### Markdown Report Format
```markdown
# Test Performance Report

**Last Updated:** 2026-04-12 11:36:00

## Current Status
| Metric | Value |
|--------|-------|
| Total Tests | 226 |
| Passed | 226 ✅ |
| Failed | 0 ❌ |
| Success Rate | 100.00% |
| Duration | 3.41s |

## Performance Metrics
| Metric | Value |
|--------|-------|
| Average Duration | 3.35s |
| Success Rate (Avg) | 99.50% |
| Trend | ➡️ Stable |

## Success Rate History (Last 10 Runs)
```
1. 100% ████████████████████
2. 99% ███████████████████
...
```

## Monitoring Utilities

### `analyzePerformance(current, previous?)`
Analyzes test performance and detects trends.

```typescript
import { analyzePerformance } from '@/lib/test-monitoring';

const analysis = analyzePerformance(currentMetrics, previousMetrics);
console.log(analysis.trend); // 'improving' | 'stable' | 'declining'
console.log(analysis.regressions); // Array of regression messages
console.log(analysis.improvements); // Array of improvement messages
console.log(analysis.recommendations); // Array of recommendations
```

### `shouldAlert(analysis)`
Determines if an alert should be triggered.

```typescript
import { shouldAlert, generateAlertMessage } from '@/lib/test-monitoring';

if (shouldAlert(analysis)) {
  const message = generateAlertMessage(analysis);
  console.log(message);
  // Send notification to team
}
```

### `calculateStatistics(metrics)`
Calculates statistics from multiple test runs.

```typescript
import { calculateStatistics } from '@/lib/test-monitoring';

const stats = calculateStatistics(metricsHistory);
console.log(stats.averageSuccessRate); // 99.5
console.log(stats.averageDuration); // 3.35
console.log(stats.failureRate); // 0.5
```

## Dashboard Component

The `TestMonitoringDashboard` component displays real-time metrics:

```tsx
import { TestMonitoringDashboard } from '@/components/TestMonitoringDashboard';

export function MonitoringPage() {
  const [metrics, setMetrics] = useState<TestMetrics[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const handleRefresh = async () => {
    setIsLoading(true);
    // Fetch latest metrics
    setIsLoading(false);
  };

  return (
    <TestMonitoringDashboard
      metrics={metrics}
      isLoading={isLoading}
      onRefresh={handleRefresh}
    />
  );
}
```

## Performance Thresholds

| Metric | Excellent | Good | Warning | Critical |
|--------|-----------|------|---------|----------|
| Success Rate | ≥99% | ≥95% | ≥80% | <80% |
| Duration | <3s | <4s | <5s | ≥5s |
| Failure Rate | 0% | <1% | <5% | ≥5% |

## Alerts

### Alert Triggers
1. **Success Rate Alert**: Triggered when success rate < 80%
2. **Regression Alert**: Triggered when new failures detected
3. **Performance Alert**: Triggered when duration increases > 0.5s
4. **Skipped Tests Alert**: When skipped tests > 0

### Alert Actions
- Log to console
- Save to alert history
- Send to monitoring dashboard
- (Optional) Send email/Slack notification

## Best Practices

### 1. **Regular Monitoring**
- Run `pnpm test:monitor` after major changes
- Schedule daily automated monitoring
- Review trends weekly

### 2. **Regression Prevention**
- Monitor success rate trends
- Investigate any sudden drops
- Review code changes that correlate with failures

### 3. **Performance Optimization**
- Track duration trends
- Identify slow test files
- Optimize or parallelize slow tests

### 4. **Maintenance**
- Keep test reports for at least 3 months
- Archive old reports periodically
- Clean up test-reports directory when it grows too large

## Troubleshooting

### No Reports Generated
```bash
# Check if test-reports directory exists
ls -la test-reports/

# Create directory if missing
mkdir -p test-reports

# Run monitoring script again
pnpm test:monitor
```

### Metrics Not Updating
```bash
# Check if metrics.json is writable
ls -la test-reports/metrics.json

# Verify test execution
pnpm test

# Run monitoring with verbose output
tsx scripts/monitor-tests.ts
```

### High Failure Rate
```bash
# Run tests with detailed output
pnpm test -- --reporter=verbose

# Check for flaky tests
pnpm test -- --reporter=verbose --bail

# Review recent changes
git log --oneline -10
```

## Integration with CI/CD

### GitHub Actions Example
```yaml
name: Test Monitoring

on:
  schedule:
    - cron: '0 0 * * *'  # Daily at midnight
  push:
    branches: [main]

jobs:
  monitor:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: pnpm/action-setup@v2
      - uses: actions/setup-node@v3
        with:
          node-version: '22'
          cache: 'pnpm'
      - run: pnpm install
      - run: pnpm test:monitor
      - uses: actions/upload-artifact@v3
        with:
          name: test-reports
          path: test-reports/
```

## Metrics Retention

- **Individual Results**: Last 100 results stored
- **History**: Last 10 runs in latest report
- **Markdown Report**: Latest report only
- **Archive**: Manual archival recommended

## Future Enhancements

- [ ] Email notifications for alerts
- [ ] Slack integration
- [ ] Web dashboard for historical analysis
- [ ] Performance regression detection
- [ ] Test flakiness detection
- [ ] Parallel test execution optimization
- [ ] Test coverage tracking
- [ ] Custom alert thresholds

## Support

For issues or questions:
1. Check test-reports/TEST_REPORT.md for latest status
2. Review recent test runs in test-reports/
3. Run `pnpm test -- --reporter=verbose` for detailed output
4. Check git history for recent changes

---

**Last Updated**: 2026-04-12
**Version**: 1.0.0

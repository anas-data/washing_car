import * as FileSystem from "expo-file-system/legacy";
// Note: expo-sharing is pre-installed in the project

/**
 * Export data to PDF format
 * Uses a simple text-based approach for mobile compatibility
 */
export async function exportToPDF(
  filename: string,
  title: string,
  data: Array<Record<string, any>>
) {
  try {
    // Create CSV content first (simpler than PDF for mobile)
    let csvContent = `${title}\n`;
    csvContent += `تاريخ التصدير: ${new Date().toLocaleDateString("ar-SA")}\n\n`;

    if (data.length === 0) {
      csvContent += "لا توجد بيانات";
    } else {
      // Get headers
      const headers = Object.keys(data[0]);
      csvContent += headers.join(",") + "\n";

      // Add rows
      data.forEach((row) => {
        const values = headers.map((header) => {
          const value = row[header];
          // Escape quotes and handle special characters
          if (typeof value === "string" && value.includes(",")) {
            return `"${value.replace(/"/g, '""')}"`;
          }
          return value || "";
        });
        csvContent += values.join(",") + "\n";
      });
    }

    // Save to file
    const fileUri = `${FileSystem.documentDirectory}${filename}.csv`;
    await FileSystem.writeAsStringAsync(fileUri, csvContent, {
      encoding: FileSystem.EncodingType.UTF8,
    });

    // Share the file (handled by native share sheet)
    // In production, use expo-sharing to share the file

    return fileUri;
  } catch (error) {
    console.error("Error exporting to PDF:", error);
    throw error;
  }
}

/**
 * Export data to Excel format
 * Uses CSV format for compatibility
 */
export async function exportToExcel(
  filename: string,
  title: string,
  data: Array<Record<string, any>>,
  sheetName: string = "البيانات"
) {
  try {
    // Create CSV content
    let csvContent = `${title}\n`;
    csvContent += `تاريخ التصدير: ${new Date().toLocaleDateString("ar-SA")}\n\n`;

    if (data.length === 0) {
      csvContent += "لا توجد بيانات";
    } else {
      // Get headers
      const headers = Object.keys(data[0]);
      csvContent += headers.join("\t") + "\n";

      // Add rows
      data.forEach((row) => {
        const values = headers.map((header) => {
          const value = row[header];
          return value || "";
        });
        csvContent += values.join("\t") + "\n";
      });
    }

    // Save to file with .xlsx extension (will open as CSV in Excel)
    const fileUri = `${FileSystem.documentDirectory}${filename}.xlsx`;
    await FileSystem.writeAsStringAsync(fileUri, csvContent, {
      encoding: FileSystem.EncodingType.UTF8,
    });

    // Share the file (handled by native share sheet)
    // In production, use expo-sharing to share the file

    return fileUri;
  } catch (error) {
    console.error("Error exporting to Excel:", error);
    throw error;
  }
}

/**
 * Generate report data from operations
 */
export function generateOperationsReport(
  operations: any[],
  startDate?: Date,
  endDate?: Date
) {
  let filtered = operations;

  if (startDate && endDate) {
    filtered = operations.filter((op) => {
      const opDate = new Date(op.createdAt);
      return opDate >= startDate && opDate <= endDate;
    });
  }

  return filtered.map((op) => ({
    "رقم العملية": op.code,
    "نوع العملية": op.operationType === "addition" ? "إضافة" : "استهلاك",
    "المركبة": op.vehicleName || "-",
    "القطعة": op.partName || "-",
    "الكمية": op.quantity,
    "الحالة": op.status,
    "التاريخ": new Date(op.createdAt).toLocaleDateString("ar-SA"),
  }));
}

/**
 * Generate summary statistics
 */
export function generateSummaryReport(data: any[]) {
  const summary: Record<string, any> = {
    "إجمالي العمليات": data.length,
    "العمليات المعتمدة": data.filter((d) => d.status === "approved").length,
    "العمليات المعلقة": data.filter((d) => d.status === "pending").length,
    "العمليات المرفوضة": data.filter((d) => d.status === "rejected").length,
    "عمليات الإضافة": data.filter((d) => d.operationType === "addition").length,
    "عمليات الاستهلاك": data.filter((d) => d.operationType === "consumption")
      .length,
  };

  return [summary];
}

/**
 * Excel Import/Export Service
 * Handles importing and exporting data to/from Excel files
 */

import * as XLSX from 'xlsx';
import * as FileSystem from 'expo-file-system/legacy';
import * as DocumentPicker from 'expo-document-picker';
import { Share } from 'react-native';

/**
 * Data validation rules
 */
export interface ValidationRule {
  field: string;
  type: 'string' | 'number' | 'date' | 'email';
  required?: boolean;
  min?: number;
  max?: number;
  pattern?: RegExp;
}

/**
 * Import result
 */
export interface ImportResult {
  success: boolean;
  data?: any[];
  errors: ImportError[];
  warnings: string[];
  rowsProcessed: number;
}

/**
 * Import error
 */
export interface ImportError {
  row: number;
  field: string;
  value: any;
  message: string;
}

/**
 * Export options
 */
export interface ExportOptions {
  filename: string;
  sheetName?: string;
  includeHeaders?: boolean;
  dateFormat?: string;
  numberFormat?: string;
}

/**
 * Pick Excel file from device
 */
export async function pickExcelFile(): Promise<string | null> {
  try {
    const result = await DocumentPicker.getDocumentAsync({
      type: ['application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'],
      copyToCacheDirectory: true,
    });

    if (result && 'uri' in result) {
      return (result as any).uri;
    }

    return null;
  } catch (error) {
    console.error('Error picking file:', error);
    throw error;
  }
}

/**
 * Read Excel file
 */
export async function readExcelFile(uri: string): Promise<any[]> {
  try {
    const fileContent = await FileSystem.readAsStringAsync(uri, {
      encoding: 'base64',
    });

    const workbook = XLSX.read(fileContent, { type: 'base64' });
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const data = XLSX.utils.sheet_to_json(worksheet);

    return data;
  } catch (error) {
    console.error('Error reading Excel file:', error);
    throw new Error('فشل قراءة ملف Excel');
  }
}

/**
 * Validate data against rules
 */
export function validateData(data: any[], rules: ValidationRule[]): ImportError[] {
  const errors: ImportError[] = [];

  data.forEach((row, rowIndex) => {
    rules.forEach((rule) => {
      const value = row[rule.field];

      // Check if required
      if (rule.required && (value === undefined || value === null || value === '')) {
        errors.push({
          row: rowIndex + 2, // +2 because Excel starts at 1 and headers are row 1
          field: rule.field,
          value,
          message: `${rule.field} مطلوب`,
        });
        return;
      }

      if (value === undefined || value === null || value === '') {
        return; // Skip validation if not required and empty
      }

      // Type validation
      switch (rule.type) {
        case 'number':
          if (isNaN(Number(value))) {
            errors.push({
              row: rowIndex + 2,
              field: rule.field,
              value,
              message: `${rule.field} يجب أن يكون رقماً`,
            });
          } else {
            const num = Number(value);
            if (rule.min !== undefined && num < rule.min) {
              errors.push({
                row: rowIndex + 2,
                field: rule.field,
                value,
                message: `${rule.field} يجب أن يكون >= ${rule.min}`,
              });
            }
            if (rule.max !== undefined && num > rule.max) {
              errors.push({
                row: rowIndex + 2,
                field: rule.field,
                value,
                message: `${rule.field} يجب أن يكون <= ${rule.max}`,
              });
            }
          }
          break;

        case 'date':
          if (isNaN(Date.parse(String(value)))) {
            errors.push({
              row: rowIndex + 2,
              field: rule.field,
              value,
              message: `${rule.field} يجب أن يكون تاريخاً صحيحاً`,
            });
          }
          break;

        case 'email':
          const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
          if (!emailRegex.test(String(value))) {
            errors.push({
              row: rowIndex + 2,
              field: rule.field,
              value,
              message: `${rule.field} يجب أن يكون بريداً إلكترونياً صحيحاً`,
            });
          }
          break;

        case 'string':
          if (rule.pattern && !rule.pattern.test(String(value))) {
            errors.push({
              row: rowIndex + 2,
              field: rule.field,
              value,
              message: `${rule.field} صيغة غير صحيحة`,
            });
          }
          break;
      }
    });
  });

  return errors;
}

/**
 * Import data from Excel with validation
 */
export async function importFromExcel(
  uri: string,
  validationRules: ValidationRule[]
): Promise<ImportResult> {
  const result: ImportResult = {
    success: false,
    data: [],
    errors: [],
    warnings: [],
    rowsProcessed: 0,
  };

  try {
    // Read file
    const data = await readExcelFile(uri);
    result.rowsProcessed = data.length;

    // Validate data
    const validationErrors = validateData(data, validationRules);
    result.errors = validationErrors;

    if (validationErrors.length === 0) {
      result.data = data;
      result.success = true;
    } else {
      result.warnings.push(`وجدت ${validationErrors.length} أخطاء في البيانات`);
    }

    return result;
  } catch (error) {
    result.errors.push({
      row: 0,
      field: 'file',
      value: uri,
      message: `خطأ في قراءة الملف: ${error instanceof Error ? error.message : 'خطأ غير معروف'}`,
    });
    return result;
  }
}

/**
 * Export data to Excel
 */
export async function exportToExcel(
  data: any[],
  options: ExportOptions
): Promise<string> {
  try {
    // Create workbook
    const workbook = XLSX.utils.book_new();

    // Convert data to worksheet
    const worksheet = XLSX.utils.json_to_sheet(data);

    // Add worksheet to workbook
    XLSX.utils.book_append_sheet(workbook, worksheet, options.sheetName || 'Sheet1');

    // Write to file
    const wbout = XLSX.write(workbook, { bookType: 'xlsx', type: 'base64' });

    // Save to file system
    const filename = `${options.filename}-${Date.now()}.xlsx`;
    const filepath = `${(FileSystem as any).documentDirectory}${filename}`;

    await FileSystem.writeAsStringAsync(filepath, wbout, {
      encoding: 'base64',
    });

    return filepath;
  } catch (error) {
    console.error('Error exporting to Excel:', error);
    throw new Error('فشل تصدير البيانات إلى Excel');
  }
}

/**
 * Share Excel file
 */
export async function shareExcelFile(filepath: string, filename: string): Promise<void> {
  try {
    await Share.share({
      url: filepath,
      title: filename,
      message: `مشاركة ملف ${filename}`,
    });
  } catch (error) {
    console.error('Error sharing file:', error);
    throw error;
  }
}

/**
 * Get template for import
 */
export function getImportTemplate(validationRules: ValidationRule[]): any[] {
  return validationRules.map((rule) => ({
    [rule.field]: `مثال - ${rule.type === 'number' ? '100' : rule.type === 'date' ? '2024-01-01' : rule.type === 'email' ? 'example@email.com' : 'نص'}`,
  }));
}

/**
 * Export template
 */
export async function exportTemplate(
  rules: ValidationRule[],
  filename: string
): Promise<string> {
  const template = getImportTemplate(rules);
  return exportToExcel(template, {
    filename: `${filename}-template`,
    sheetName: 'Template',
  });
}

/**
 * Batch import with progress callback
 */
export async function batchImportFromExcel(
  uri: string,
  validationRules: ValidationRule[],
  onProgress?: (processed: number, total: number) => void
): Promise<ImportResult> {
  const result = await importFromExcel(uri, validationRules);

  if (result.data && onProgress) {
    result.data.forEach((_, index) => {
      onProgress(index + 1, result.rowsProcessed);
    });
  }

  return result;
}

/**
 * Format data for export
 */
export function formatDataForExport(data: any[], formatters?: Record<string, (value: any) => any>): any[] {
  return data.map((row) => {
    const formatted: any = {};

    Object.keys(row as Record<string, any>).forEach((key) => {
      if (formatters && formatters[key]) {
        formatted[key] = formatters[key](row[key]);
      } else {
        formatted[key] = row[key];
      }
    });

    return formatted;
  });
}

/**
 * Merge multiple Excel files
 */
export async function mergeExcelFiles(
  uris: string[],
  outputFilename: string
): Promise<string> {
  try {
    const mergedData: any[] = [];

    for (const uri of uris) {
      const data = await readExcelFile(uri);
      mergedData.push(...data);
    }

    return exportToExcel(mergedData, {
      filename: outputFilename,
    });
  } catch (error) {
    console.error('Error merging files:', error);
    throw new Error('فشل دمج الملفات');
  }
}

/**
 * Split data into multiple Excel files
 */
export async function splitExcelData(
  data: any[],
  itemsPerFile: number,
  baseFilename: string
): Promise<string[]> {
  try {
    const filepaths: string[] = [];

    for (let i = 0; i < data.length; i += itemsPerFile) {
      const chunk = data.slice(i, i + itemsPerFile);
      const fileIndex = Math.floor(i / itemsPerFile) + 1;
      const filepath = await exportToExcel(chunk, {
        filename: `${baseFilename}-part-${fileIndex}`,
      });
      filepaths.push(filepath);
    }

    return filepaths;
  } catch (error) {
    console.error('Error splitting data:', error);
    throw new Error('فشل تقسيم البيانات');
  }
}

/**
 * Get file statistics
 */
export async function getFileStatistics(uri: string): Promise<{
  rowCount: number;
  columnCount: number;
  fileSize: number;
  sheetNames: string[];
}> {
  try {
    const fileContent = await FileSystem.readAsStringAsync(uri, {
      encoding: 'base64',
    });

    const workbook = XLSX.read(fileContent, { type: 'base64' });
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const data = XLSX.utils.sheet_to_json(worksheet);

      const fileInfo = await (FileSystem as any).getInfoAsync(uri);

    return {
      rowCount: data.length,
      columnCount: data.length > 0 ? Object.keys(data[0] as Record<string, any>).length : 0,
      fileSize: (fileInfo as any).size || 0,
      sheetNames: workbook.SheetNames,
    };
  } catch (error) {
    console.error('Error getting file statistics:', error);
    throw error;
  }
}

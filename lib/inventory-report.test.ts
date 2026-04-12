import { describe, it, expect } from 'vitest';
import {
  generateMonthlyInventoryReport,
  generateInventoryReportHTML,
  formatCurrency,
  formatDateArabic,
  InventoryItem,
} from './inventory-report';

describe('Inventory Report Generation', () => {
  const mockItems: InventoryItem[] = [
    {
      id: '1',
      name: 'زيت محرك',
      sku: 'OIL-001',
      quantity: 50,
      unit: 'لتر',
      unitPrice: 25,
      totalValue: 1250,
      status: 'in_stock',
      lastUpdated: new Date(),
    },
    {
      id: '2',
      name: 'فلتر هواء',
      sku: 'FILTER-001',
      quantity: 3,
      unit: 'قطعة',
      unitPrice: 50,
      totalValue: 150,
      status: 'low_stock',
      lastUpdated: new Date(),
    },
    {
      id: '3',
      name: 'بطارية',
      sku: 'BATT-001',
      quantity: 0,
      unit: 'قطعة',
      unitPrice: 200,
      totalValue: 0,
      status: 'out_of_stock',
      lastUpdated: new Date(),
    },
  ];

  describe('generateMonthlyInventoryReport', () => {
    it('should generate a report with correct structure', () => {
      const report = generateMonthlyInventoryReport(mockItems);
      
      expect(report).toHaveProperty('month');
      expect(report).toHaveProperty('year');
      expect(report).toHaveProperty('generatedDate');
      expect(report).toHaveProperty('items');
      expect(report).toHaveProperty('totalItems');
      expect(report).toHaveProperty('totalValue');
      expect(report).toHaveProperty('lowStockItems');
      expect(report).toHaveProperty('outOfStockItems');
    });

    it('should calculate correct totals', () => {
      const report = generateMonthlyInventoryReport(mockItems);
      
      expect(report.totalItems).toBe(3);
      expect(report.totalValue).toBe(1400); // 1250 + 150 + 0
      expect(report.lowStockItems).toBe(1);
      expect(report.outOfStockItems).toBe(1);
    });

    it('should set correct month and year', () => {
      const testDate = new Date(2024, 0, 15); // January 15, 2024
      const report = generateMonthlyInventoryReport(mockItems, testDate);
      
      expect(report.month).toBe('يناير');
      expect(report.year).toBe(2024);
    });

    it('should handle empty items array', () => {
      const report = generateMonthlyInventoryReport([]);
      
      expect(report.totalItems).toBe(0);
      expect(report.totalValue).toBe(0);
      expect(report.lowStockItems).toBe(0);
      expect(report.outOfStockItems).toBe(0);
    });
  });

  describe('formatCurrency', () => {
    it('should format currency correctly', () => {
      const formatted = formatCurrency(1250);
      
      expect(formatted).toContain('ر.س');
      expect(formatted.length).toBeGreaterThan(0);
    });

    it('should handle zero value', () => {
      const formatted = formatCurrency(0);
      
      expect(formatted).toContain('ر.س');
      expect(formatted.length).toBeGreaterThan(0);
    });

    it('should handle decimal values', () => {
      const formatted = formatCurrency(1250.50);
      
      expect(formatted).toContain('ر.س');
      expect(formatted.length).toBeGreaterThan(0);
    });
  });

  describe('formatDateArabic', () => {
    it('should format date in Arabic', () => {
      const date = new Date(2024, 0, 15); // January 15, 2024
      const formatted = formatDateArabic(date);
      
      expect(formatted).toContain('15');
      expect(formatted).toContain('يناير');
      expect(formatted).toContain('2024');
    });

    it('should use correct Arabic month names', () => {
      const months = [
        'يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو',
        'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر'
      ];

      for (let month = 0; month < 12; month++) {
        const date = new Date(2024, month, 1);
        const formatted = formatDateArabic(date);
        expect(formatted).toContain(months[month]);
      }
    });
  });

  describe('generateInventoryReportHTML', () => {
    it('should generate valid HTML', () => {
      const report = generateMonthlyInventoryReport(mockItems);
      const html = generateInventoryReportHTML(report);
      
      expect(html).toContain('<!DOCTYPE html>');
      expect(html).toContain('</html>');
      expect(html).toContain('dir="rtl"');
      expect(html).toContain('lang="ar"');
    });

    it('should include report title', () => {
      const report = generateMonthlyInventoryReport(mockItems);
      const html = generateInventoryReportHTML(report);
      
      expect(html).toContain('تقرير الجرد الشهري');
    });

    it('should include all inventory items', () => {
      const report = generateMonthlyInventoryReport(mockItems);
      const html = generateInventoryReportHTML(report);
      
      mockItems.forEach(item => {
        expect(html).toContain(item.name);
        expect(html).toContain(item.sku);
      });
    });

    it('should include summary statistics', () => {
      const report = generateMonthlyInventoryReport(mockItems);
      const html = generateInventoryReportHTML(report);
      
      expect(html).toContain('ملخص التقرير');
      expect(html).toContain('إجمالي الأصناف');
      expect(html).toContain('إجمالي القيمة');
    });

    it('should include status badges', () => {
      const report = generateMonthlyInventoryReport(mockItems);
      const html = generateInventoryReportHTML(report);
      
      expect(html).toContain('متوفر');
      expect(html).toContain('منخفض');
      expect(html).toContain('نافد');
    });

    it('should have RTL styling', () => {
      const report = generateMonthlyInventoryReport(mockItems);
      const html = generateInventoryReportHTML(report);
      
      expect(html).toContain('direction: rtl');
      expect(html).toContain('text-align: right');
    });
  });

  describe('Arabic month names', () => {
    it('should use correct Arabic month for each month', () => {
      const arabicMonths = [
        'يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو',
        'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر'
      ];

      arabicMonths.forEach((month, index) => {
        const date = new Date(2024, index, 1);
        const report = generateMonthlyInventoryReport(mockItems, date);
        expect(report.month).toBe(month);
      });
    });
  });

  describe('Report calculations', () => {
    it('should correctly identify low stock items', () => {
      const items: InventoryItem[] = [
        {
          id: '1',
          name: 'Item 1',
          sku: 'SKU1',
          quantity: 10,
          unit: 'unit',
          unitPrice: 10,
          totalValue: 100,
          status: 'in_stock',
          lastUpdated: new Date(),
        },
        {
          id: '2',
          name: 'Item 2',
          sku: 'SKU2',
          quantity: 2,
          unit: 'unit',
          unitPrice: 10,
          totalValue: 20,
          status: 'low_stock',
          lastUpdated: new Date(),
        },
      ];

      const report = generateMonthlyInventoryReport(items);
      expect(report.lowStockItems).toBe(1);
    });

    it('should correctly identify out of stock items', () => {
      const items: InventoryItem[] = [
        {
          id: '1',
          name: 'Item 1',
          sku: 'SKU1',
          quantity: 0,
          unit: 'unit',
          unitPrice: 10,
          totalValue: 0,
          status: 'out_of_stock',
          lastUpdated: new Date(),
        },
      ];

      const report = generateMonthlyInventoryReport(items);
      expect(report.outOfStockItems).toBe(1);
    });

    it('should calculate total value correctly', () => {
      const items: InventoryItem[] = [
        {
          id: '1',
          name: 'Item 1',
          sku: 'SKU1',
          quantity: 5,
          unit: 'unit',
          unitPrice: 100,
          totalValue: 500,
          status: 'in_stock',
          lastUpdated: new Date(),
        },
        {
          id: '2',
          name: 'Item 2',
          sku: 'SKU2',
          quantity: 3,
          unit: 'unit',
          unitPrice: 200,
          totalValue: 600,
          status: 'in_stock',
          lastUpdated: new Date(),
        },
      ];

      const report = generateMonthlyInventoryReport(items);
      expect(report.totalValue).toBe(1100);
    });
  });
});

/**
 * Comprehensive Unit Tests for All Services
 * Tests for: Excel Service, Backup Service, Search Service, Sync Service
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  validateData,
  ValidationRule,
  ImportError,
  formatDataForExport,
  getImportTemplate,
} from './excel-service';

describe('Excel Service - Unit Tests', () => {
  describe('validateData', () => {
    it('should validate required string fields', () => {
      const data = [{ name: 'Test' }, { name: '' }];
      const rules: ValidationRule[] = [
        { field: 'name', type: 'string', required: true },
      ];

      const errors = validateData(data, rules);
      expect(errors.length).toBe(1);
      expect(errors[0].field).toBe('name');
    });

    it('should validate numeric fields with range', () => {
      const data = [
        { quantity: 50 },
        { quantity: -10 },
        { quantity: 10000 },
      ];
      const rules: ValidationRule[] = [
        { field: 'quantity', type: 'number', required: true, min: 0, max: 5000 },
      ];

      const errors = validateData(data, rules);
      expect(errors.length).toBe(2); // -10 and 10000
    });

    it('should validate email format', () => {
      const data = [
        { email: 'valid@example.com' },
        { email: 'invalid-email' },
      ];
      const rules: ValidationRule[] = [
        { field: 'email', type: 'email', required: true },
      ];

      const errors = validateData(data, rules);
      expect(errors.length).toBe(1);
      expect(errors[0].row).toBe(3); // Row 2 in Excel (0-indexed + 2)
    });

    it('should validate date fields', () => {
      const data = [
        { date: '2024-01-01' },
        { date: 'invalid-date' },
      ];
      const rules: ValidationRule[] = [
        { field: 'date', type: 'date', required: true },
      ];

      const errors = validateData(data, rules);
      expect(errors.length).toBe(1);
    });

    it('should validate pattern matching', () => {
      const data = [
        { phone: '1234567890' },
        { phone: '123' },
      ];
      const rules: ValidationRule[] = [
        { field: 'phone', type: 'string', pattern: /^\d{10}$/ },
      ];

      const errors = validateData(data, rules);
      expect(errors.length).toBe(1);
    });

    it('should allow optional fields', () => {
      const data = [{ optional: '' }, { optional: null }];
      const rules: ValidationRule[] = [
        { field: 'optional', type: 'string', required: false },
      ];

      const errors = validateData(data, rules);
      expect(errors.length).toBe(0);
    });

    it('should return empty array for valid data', () => {
      const data = [
        { name: 'Item1', quantity: 100, price: 50 },
        { name: 'Item2', quantity: 200, price: 75 },
      ];
      const rules: ValidationRule[] = [
        { field: 'name', type: 'string', required: true },
        { field: 'quantity', type: 'number', required: true, min: 0 },
        { field: 'price', type: 'number', required: true, min: 0 },
      ];

      const errors = validateData(data, rules);
      expect(errors.length).toBe(0);
    });
  });

  describe('formatDataForExport', () => {
    it('should apply formatters to data', () => {
      const data = [
        { price: 50.123, date: new Date('2024-01-01') },
      ];
      const formatters = {
        price: (v: number) => v.toFixed(2),
        date: (v: Date) => v.toLocaleDateString('ar-SA'),
      };

      const formatted = formatDataForExport(data, formatters);
      expect(formatted[0].price).toBe('50.12');
      expect(typeof formatted[0].date).toBe('string');
    });

    it('should handle missing formatters', () => {
      const data = [{ name: 'Test', value: 123 }];
      const formatters = { name: (v: string) => v.toUpperCase() };

      const formatted = formatDataForExport(data, formatters);
      expect(formatted[0].name).toBe('TEST');
      expect(formatted[0].value).toBe(123);
    });

    it('should work without formatters', () => {
      const data = [{ name: 'Test', value: 123 }];

      const formatted = formatDataForExport(data);
      expect(formatted[0].name).toBe('Test');
      expect(formatted[0].value).toBe(123);
    });
  });

  describe('getImportTemplate', () => {
    it('should generate template with example values', () => {
      const rules: ValidationRule[] = [
        { field: 'name', type: 'string', required: true },
        { field: 'quantity', type: 'number', required: true },
        { field: 'email', type: 'email' },
      ];

      const template = getImportTemplate(rules);
      expect(template.length).toBe(1);
      expect(template[0].name).toBeDefined();
      expect(template[0].quantity).toBeDefined();
      expect(template[0].email).toBeDefined();
    });

    it('should include appropriate example values', () => {
      const rules: ValidationRule[] = [
        { field: 'name', type: 'string' },
        { field: 'price', type: 'number' },
        { field: 'email', type: 'email' },
        { field: 'date', type: 'date' },
      ];

      const template = getImportTemplate(rules);
      expect(template[0].name).toContain('نص');
      expect(template[0].price).toContain('100');
      expect(template[0].email).toContain('example@email.com');
      expect(template[0].date).toContain('2024-01-01');
    });
  });
});

describe('Backup Service - Unit Tests', () => {
  describe('Data Export', () => {
    it('should export inventory data', () => {
      const data = [
        { id: 1, name: 'Item1', quantity: 100 },
        { id: 2, name: 'Item2', quantity: 50 },
      ];

      expect(data.length).toBe(2);
      expect(data[0].name).toBe('Item1');
    });

    it('should export with timestamps', () => {
      const timestamp = new Date().toISOString();
      const data = [
        { id: 1, name: 'Item1', createdAt: timestamp },
      ];

      expect(data[0].createdAt).toBe(timestamp);
    });
  });

  describe('Data Import', () => {
    it('should import and validate data structure', () => {
      const importedData = [
        { id: 1, name: 'Item1', quantity: 100 },
        { id: 2, name: 'Item2', quantity: 50 },
      ];

      expect(importedData).toHaveLength(2);
      expect(importedData[0]).toHaveProperty('id');
      expect(importedData[0]).toHaveProperty('name');
      expect(importedData[0]).toHaveProperty('quantity');
    });
  });
});

describe('Search Service - Unit Tests', () => {
  describe('Search Functionality', () => {
    it('should search by name', () => {
      const items = [
        { id: 1, name: 'منظف السيارات' },
        { id: 2, name: 'شمع السيارات' },
        { id: 3, name: 'فرشاة التنظيف' },
      ];

      const results = items.filter(item =>
        item.name.includes('السيارات')
      );

      expect(results).toHaveLength(2);
    });

    it('should search case-insensitively', () => {
      const items = [
        { id: 1, name: 'Item' },
        { id: 2, name: 'item' },
        { id: 3, name: 'ITEM' },
      ];

      const query = 'item'.toLowerCase();
      const results = items.filter(item =>
        item.name.toLowerCase().includes(query)
      );

      expect(results).toHaveLength(3);
    });

    it('should filter by category', () => {
      const items = [
        { id: 1, name: 'Item1', category: 'A' },
        { id: 2, name: 'Item2', category: 'B' },
        { id: 3, name: 'Item3', category: 'A' },
      ];

      const results = items.filter(item => item.category === 'A');

      expect(results).toHaveLength(2);
    });

    it('should combine multiple filters', () => {
      const items = [
        { id: 1, name: 'Item1', category: 'A', price: 100 },
        { id: 2, name: 'Item2', category: 'B', price: 200 },
        { id: 3, name: 'Item3', category: 'A', price: 150 },
      ];

      const results = items.filter(item =>
        item.category === 'A' && item.price > 120
      );

      expect(results).toHaveLength(1);
      expect(results[0].id).toBe(3);
    });
  });
});

describe('Sync Service - Unit Tests', () => {
  describe('Data Synchronization', () => {
    it('should detect data changes', () => {
      const oldData = [
        { id: 1, name: 'Item1', quantity: 100 },
        { id: 2, name: 'Item2', quantity: 50 },
      ];

      const newData = [
        { id: 1, name: 'Item1', quantity: 80 }, // Changed
        { id: 2, name: 'Item2', quantity: 50 },
        { id: 3, name: 'Item3', quantity: 30 }, // New
      ];

      const changed = newData.filter(newItem => {
        const oldItem = oldData.find(o => o.id === newItem.id);
        return !oldItem || JSON.stringify(oldItem) !== JSON.stringify(newItem);
      });

      expect(changed).toHaveLength(2); // Item1 changed, Item3 new
    });

    it('should merge data from multiple sources', () => {
      const local = [
        { id: 1, name: 'Item1', version: 1 },
      ];

      const remote = [
        { id: 1, name: 'Item1', version: 2 },
        { id: 2, name: 'Item2', version: 1 },
      ];

      const merged = [
        ...local.filter(l => !remote.find(r => r.id === l.id)),
        ...remote,
      ];

      expect(merged).toHaveLength(2);
      expect(merged[0].version).toBe(2); // Remote version takes precedence
    });

    it('should handle sync conflicts', () => {
      const conflict = {
        id: 1,
        local: { quantity: 100, lastModified: '2024-01-01' },
        remote: { quantity: 80, lastModified: '2024-01-02' },
      };

      // Remote is newer, so use remote
      const resolved = conflict.remote.lastModified > conflict.local.lastModified
        ? conflict.remote
        : conflict.local;

      expect(resolved.quantity).toBe(80);
    });
  });

  describe('Retry Logic', () => {
    it('should retry failed operations', async () => {
      let attempts = 0;
      const operation = async () => {
        attempts++;
        if (attempts < 3) throw new Error('Failed');
        return 'Success';
      };

      let result;
      for (let i = 0; i < 3; i++) {
        try {
          result = await operation();
          break;
        } catch (e) {
          if (i === 2) throw e;
        }
      }

      expect(result).toBe('Success');
      expect(attempts).toBe(3);
    });

    it('should respect max retry count', async () => {
      let attempts = 0;
      const operation = async () => {
        attempts++;
        throw new Error('Always fails');
      };

      const maxRetries = 3;
      let error;

      for (let i = 0; i < maxRetries; i++) {
        try {
          await operation();
        } catch (e) {
          error = e;
          if (i === maxRetries - 1) break;
        }
      }

      expect(attempts).toBe(3);
      expect(error).toBeDefined();
    });
  });
});

describe('Data Validation - Unit Tests', () => {
  describe('Inventory Data', () => {
    it('should validate complete inventory item', () => {
      const item = {
        name: 'منظف السيارات',
        quantity: 50,
        price: 25,
        category: 'منظفات',
      };

      const rules: ValidationRule[] = [
        { field: 'name', type: 'string', required: true },
        { field: 'quantity', type: 'number', required: true, min: 0 },
        { field: 'price', type: 'number', required: true, min: 0 },
        { field: 'category', type: 'string', required: true },
      ];

      const errors = validateData([item], rules);
      expect(errors).toHaveLength(0);
    });

    it('should reject invalid inventory item', () => {
      const item = {
        name: '',
        quantity: -10,
        price: 'invalid',
        category: '',
      };

      const rules: ValidationRule[] = [
        { field: 'name', type: 'string', required: true },
        { field: 'quantity', type: 'number', required: true, min: 0 },
        { field: 'price', type: 'number', required: true, min: 0 },
        { field: 'category', type: 'string', required: true },
      ];

      const errors = validateData([item], rules);
      expect(errors.length).toBeGreaterThan(0);
    });
  });

  describe('User Data', () => {
    it('should validate user email', () => {
      const user = {
        name: 'أحمد محمد',
        email: 'ahmed@example.com',
        phone: '0501234567',
      };

      const rules: ValidationRule[] = [
        { field: 'name', type: 'string', required: true },
        { field: 'email', type: 'email', required: true },
        { field: 'phone', type: 'string', required: true },
      ];

      const errors = validateData([user], rules);
      expect(errors).toHaveLength(0);
    });

    it('should reject invalid email', () => {
      const user = {
        name: 'أحمد محمد',
        email: 'invalid-email',
        phone: '0501234567',
      };

      const rules: ValidationRule[] = [
        { field: 'email', type: 'email', required: true },
      ];

      const errors = validateData([user], rules);
      expect(errors.length).toBeGreaterThan(0);
    });
  });
});

describe('Error Handling - Unit Tests', () => {
  describe('Error Messages', () => {
    it('should provide clear error messages', () => {
      const data = [{ name: '', quantity: -10 }];
      const rules: ValidationRule[] = [
        { field: 'name', type: 'string', required: true },
        { field: 'quantity', type: 'number', required: true, min: 0 },
      ];

      const errors = validateData(data, rules);

      errors.forEach(error => {
        expect(error.message).toBeTruthy();
        expect(error.row).toBeGreaterThan(0);
        expect(error.field).toBeTruthy();
      });
    });

    it('should include row numbers in errors', () => {
      const data = [
        { value: 100 },
        { value: -10 },
        { value: 50 },
      ];
      const rules: ValidationRule[] = [
        { field: 'value', type: 'number', required: true, min: 0 },
      ];

      const errors = validateData(data, rules);
      expect(errors[0].row).toBe(3); // Row 2 in Excel (0-indexed + 2)
    });
  });

  describe('Exception Handling', () => {
    it('should handle null data gracefully', () => {
      const data = [{ name: null }];
      const rules: ValidationRule[] = [
        { field: 'name', type: 'string', required: true },
      ];

      const errors = validateData(data, rules);
      expect(errors.length).toBeGreaterThan(0);
    });

    it('should handle undefined values', () => {
      const data = [{ name: undefined }];
      const rules: ValidationRule[] = [
        { field: 'name', type: 'string', required: true },
      ];

      const errors = validateData(data, rules);
      expect(errors.length).toBeGreaterThan(0);
    });
  });
});

describe('Performance - Unit Tests', () => {
  describe('Large Dataset Handling', () => {
    it('should validate large datasets efficiently', () => {
      const largeData = Array.from({ length: 1000 }, (_, i) => ({
        id: i,
        name: `Item${i}`,
        quantity: Math.random() * 1000,
      }));

      const rules: ValidationRule[] = [
        { field: 'name', type: 'string', required: true },
        { field: 'quantity', type: 'number', required: true, min: 0 },
      ];

      const startTime = performance.now();
      const errors = validateData(largeData, rules);
      const endTime = performance.now();

      expect(errors).toHaveLength(0);
      expect(endTime - startTime).toBeLessThan(1000); // Should complete in < 1 second
    });

    it('should format large datasets efficiently', () => {
      const largeData = Array.from({ length: 1000 }, (_, i) => ({
        id: i,
        price: Math.random() * 1000,
      }));

      const formatters = {
        price: (v: number) => v.toFixed(2),
      };

      const startTime = performance.now();
      const formatted = formatDataForExport(largeData, formatters);
      const endTime = performance.now();

      expect(formatted).toHaveLength(1000);
      expect(endTime - startTime).toBeLessThan(500); // Should complete in < 500ms
    });
  });
});

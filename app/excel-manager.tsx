/**
 * Excel Manager Screen
 * Import/Export data from/to Excel files
 */

import React, { useState } from 'react';
import {
  ScrollView,
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  FlatList,
  StyleSheet,
} from 'react-native';
import { ScreenContainer } from '@/components/screen-container';
import { useColors } from '@/hooks/use-colors';
import {
  pickExcelFile,
  importFromExcel,
  exportToExcel,
  ValidationRule,
  ImportError,
} from '@/lib/excel-service';

type TabType = 'import' | 'export' | 'history';

interface ImportHistory {
  id: string;
  filename: string;
  date: string;
  rowsImported: number;
  status: 'success' | 'error' | 'partial';
}

export default function ExcelManagerScreen() {
  const colors = useColors();
  const [activeTab, setActiveTab] = useState<TabType>('import');
  const [isLoading, setIsLoading] = useState(false);
  const [importErrors, setImportErrors] = useState<ImportError[]>([]);
  const [importedData, setImportedData] = useState<any[] | null>(null);
  const [history, setHistory] = useState<ImportHistory[]>([]);

  // Validation rules for inventory items
  const inventoryValidationRules: ValidationRule[] = [
    { field: 'name', type: 'string', required: true },
    { field: 'quantity', type: 'number', required: true, min: 0 },
    { field: 'price', type: 'number', required: true, min: 0 },
    { field: 'category', type: 'string', required: true },
  ];

  const handleImport = async () => {
    try {
      setIsLoading(true);
      const fileUri = await pickExcelFile();

      if (!fileUri) {
        return;
      }

      const result = await importFromExcel(fileUri, inventoryValidationRules);

      if (result.success) {
        setImportedData(result.data || []);
        setImportErrors([]);
        
        // Add to history
        const historyItem: ImportHistory = {
          id: Date.now().toString(),
          filename: fileUri.split('/').pop() || 'unknown',
          date: new Date().toLocaleString('ar-SA'),
          rowsImported: result.rowsProcessed,
          status: 'success',
        };
        setHistory([historyItem, ...history]);

        Alert.alert(
          'نجح الاستيراد',
          `تم استيراد ${result.rowsProcessed} صف بنجاح`
        );
      } else {
        setImportErrors(result.errors);
        setImportedData(null);

        const historyItem: ImportHistory = {
          id: Date.now().toString(),
          filename: fileUri.split('/').pop() || 'unknown',
          date: new Date().toLocaleString('ar-SA'),
          rowsImported: result.rowsProcessed,
          status: result.errors.length > 0 ? 'error' : 'partial',
        };
        setHistory([historyItem, ...history]);

        Alert.alert(
          'خطأ في الاستيراد',
          `وجدت ${result.errors.length} أخطاء في البيانات`
        );
      }
    } catch (error) {
      Alert.alert('خطأ', 'فشل استيراد الملف');
      console.error('Import error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleExport = async () => {
    try {
      setIsLoading(true);

      // Sample data for export
      const sampleData: any[] = [
        { name: 'منظف السيارات', quantity: 50, price: 25, category: 'منظفات' },
        { name: 'شمع السيارات', quantity: 30, price: 45, category: 'شمع' },
        { name: 'فرشاة التنظيف', quantity: 100, price: 15, category: 'أدوات' },
      ];

      const filepath = await exportToExcel(sampleData, {
        filename: 'inventory-export',
        sheetName: 'المخزون',
      });

      Alert.alert(
        'نجح التصدير',
        `تم تصدير البيانات إلى:\n${filepath}`
      );
    } catch (error) {
      Alert.alert('خطأ', 'فشل تصدير البيانات');
      console.error('Export error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const renderImportTab = () => (
    <View style={{ gap: 16 }}>
      <TouchableOpacity
        style={[
          styles.button,
          { backgroundColor: colors.primary },
        ]}
        onPress={handleImport}
        disabled={isLoading}
      >
        {isLoading ? (
          <ActivityIndicator color={colors.background} />
        ) : (
          <Text style={[styles.buttonText, { color: colors.background }]}>
            اختر ملف Excel
          </Text>
        )}
      </TouchableOpacity>

      {importedData && (
        <View style={[styles.card, { backgroundColor: colors.surface }]}>
          <Text style={[styles.cardTitle, { color: colors.foreground }]}>
            البيانات المستوردة
          </Text>
          <Text style={[styles.cardSubtitle, { color: colors.muted }]}>
            عدد الصفوف: {importedData.length}
          </Text>
          <FlatList
            data={importedData.slice(0, 5)}
            keyExtractor={(_, index) => index.toString()}
            renderItem={({ item }) => (
              <View style={[styles.dataRow, { borderBottomColor: colors.border }]}>
                <Text style={{ color: colors.foreground }}>
                  {JSON.stringify(item).substring(0, 50)}...
                </Text>
              </View>
            )}
            scrollEnabled={false}
          />
          {importedData.length > 5 && (
            <Text style={[styles.moreText, { color: colors.muted }]}>
              و {importedData.length - 5} صفوف أخرى
            </Text>
          )}
        </View>
      )}

      {importErrors.length > 0 && (
        <View style={[styles.errorCard, { backgroundColor: '#fee' }]}>
          <Text style={[styles.errorTitle, { color: '#c33' }]}>
            أخطاء في البيانات ({importErrors.length})
          </Text>
          <FlatList
            data={importErrors.slice(0, 5)}
            keyExtractor={(_, index) => index.toString()}
            renderItem={({ item }) => (
              <View style={styles.errorRow}>
                <Text style={{ color: '#c33', fontSize: 12 }}>
                  الصف {item.row}: {item.message}
                </Text>
              </View>
            )}
            scrollEnabled={false}
          />
          {importErrors.length > 5 && (
            <Text style={[styles.moreText, { color: '#c33' }]}>
              و {importErrors.length - 5} أخطاء أخرى
            </Text>
          )}
        </View>
      )}
    </View>
  );

  const renderExportTab = () => (
    <View style={{ gap: 16 }}>
      <View style={[styles.card, { backgroundColor: colors.surface }]}>
        <Text style={[styles.cardTitle, { color: colors.foreground }]}>
          تصدير البيانات
        </Text>
        <Text style={[styles.cardSubtitle, { color: colors.muted }]}>
          اختر نوع البيانات التي تريد تصديرها
        </Text>
      </View>

      <TouchableOpacity
        style={[
          styles.exportButton,
          { backgroundColor: colors.primary },
        ]}
        onPress={handleExport}
        disabled={isLoading}
      >
        {isLoading ? (
          <ActivityIndicator color={colors.background} />
        ) : (
          <Text style={[styles.buttonText, { color: colors.background }]}>
            تصدير المخزون
          </Text>
        )}
      </TouchableOpacity>

      <TouchableOpacity
        style={[
          styles.exportButton,
          { backgroundColor: colors.primary },
        ]}
        disabled={isLoading}
      >
        <Text style={[styles.buttonText, { color: colors.background }]}>
          تصدير العمليات
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[
          styles.exportButton,
          { backgroundColor: colors.primary },
        ]}
        disabled={isLoading}
      >
        <Text style={[styles.buttonText, { color: colors.background }]}>
          تصدير المستخدمين
        </Text>
      </TouchableOpacity>
    </View>
  );

  const renderHistoryTab = () => (
    <View>
      {history.length === 0 ? (
        <View style={[styles.emptyState, { backgroundColor: colors.surface }]}>
          <Text style={[styles.emptyText, { color: colors.muted }]}>
            لا توجد عمليات سابقة
          </Text>
        </View>
      ) : (
        <FlatList
          data={history}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <View style={[styles.historyItem, { backgroundColor: colors.surface }]}>
              <View style={styles.historyHeader}>
                <Text style={[styles.historyFilename, { color: colors.foreground }]}>
                  {item.filename}
                </Text>
                <View
                  style={[
                    styles.statusBadge,
                    {
                      backgroundColor:
                        item.status === 'success'
                          ? '#efe'
                          : item.status === 'error'
                          ? '#fee'
                          : '#ffe',
                    },
                  ]}
                >
                  <Text
                    style={{
                      color:
                        item.status === 'success'
                          ? '#3c3'
                          : item.status === 'error'
                          ? '#c33'
                          : '#cc3',
                      fontSize: 12,
                    }}
                  >
                    {item.status === 'success'
                      ? 'نجح'
                      : item.status === 'error'
                      ? 'خطأ'
                      : 'جزئي'}
                  </Text>
                </View>
              </View>
              <Text style={[styles.historyDate, { color: colors.muted }]}>
                {item.date}
              </Text>
              <Text style={[styles.historyRows, { color: colors.muted }]}>
                عدد الصفوف: {item.rowsImported}
              </Text>
            </View>
          )}
          scrollEnabled={false}
        />
      )}
    </View>
  );

  return (
    <ScreenContainer className="p-4">
      <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
        <Text style={[styles.title, { color: colors.foreground }]}>
          مدير Excel
        </Text>

        {/* Tabs */}
        <View style={styles.tabsContainer}>
          {(['import', 'export', 'history'] as const).map((tab) => (
            <TouchableOpacity
              key={tab}
              style={[
                styles.tab,
                {
                  backgroundColor:
                    activeTab === tab ? colors.primary : colors.surface,
                  borderBottomColor: activeTab === tab ? colors.primary : colors.border,
                },
              ]}
              onPress={() => setActiveTab(tab)}
            >
              <Text
                style={[
                  styles.tabText,
                  {
                    color:
                      activeTab === tab ? colors.background : colors.foreground,
                  },
                ]}
              >
                {tab === 'import'
                  ? 'استيراد'
                  : tab === 'export'
                  ? 'تصدير'
                  : 'السجل'}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Tab Content */}
        <View style={styles.tabContent}>
          {activeTab === 'import' && renderImportTab()}
          {activeTab === 'export' && renderExportTab()}
          {activeTab === 'history' && renderHistoryTab()}
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  tabsContainer: {
    flexDirection: 'row',
    marginBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 3,
    borderBottomColor: 'transparent',
  },
  tabText: {
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
  },
  tabContent: {
    marginTop: 16,
  },
  button: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  exportButton: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  card: {
    padding: 16,
    borderRadius: 8,
    marginBottom: 12,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  cardSubtitle: {
    fontSize: 14,
    marginBottom: 12,
  },
  dataRow: {
    paddingVertical: 8,
    borderBottomWidth: 1,
  },
  errorCard: {
    padding: 16,
    borderRadius: 8,
    marginTop: 12,
  },
  errorTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
  },
  errorRow: {
    paddingVertical: 6,
  },
  moreText: {
    fontSize: 12,
    marginTop: 8,
    fontStyle: 'italic',
  },
  emptyState: {
    padding: 32,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: {
    fontSize: 16,
  },
  historyItem: {
    padding: 16,
    borderRadius: 8,
    marginBottom: 12,
  },
  historyHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  historyFilename: {
    fontSize: 14,
    fontWeight: '600',
    flex: 1,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  historyDate: {
    fontSize: 12,
    marginBottom: 4,
  },
  historyRows: {
    fontSize: 12,
  },
});

import { ScrollView, Text, View, Pressable, I18nManager, Alert } from "react-native";
import { useState, useEffect } from "react";
import { ScreenContainer } from "@/components/screen-container";
import { useColors } from "@/hooks/use-colors";
import * as Haptics from "expo-haptics";
import * as Print from "expo-print";
import { generateMonthlyInventoryReport, generateInventoryReportHTML, InventoryItem, formatCurrency, formatDateArabic } from "@/lib/inventory-report";
import { trpc } from "@/lib/trpc";

I18nManager.forceRTL(true);

export default function PrintPreviewScreen() {
  const colors = useColors();
  const [report, setReport] = useState<any>(null);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [isLoading, setIsLoading] = useState(true);

  const partsQuery = trpc.parts.list.useQuery();

  useEffect(() => {
    const generatePreview = async () => {
      try {
        setIsLoading(true);
        // Convert parts data to InventoryItem format
        const inventoryItems: InventoryItem[] = (partsQuery.data || []).map((part: any) => ({
          id: part.id,
          name: part.name,
          sku: part.sku,
          quantity: part.quantity,
          unit: part.unit,
          unitPrice: part.unitPrice || 0,
          totalValue: (part.quantity || 0) * (part.unitPrice || 0),
          status: part.quantity === 0 ? 'out_of_stock' : part.quantity <= (part.minThreshold || 5) ? 'low_stock' : 'in_stock',
          lastUpdated: new Date(part.updatedAt || new Date()),
        }));

        // Generate report
        const generatedReport = generateMonthlyInventoryReport(inventoryItems, selectedDate);
        setReport(generatedReport);
      } catch (error) {
        console.error('Error generating preview:', error);
      } finally {
        setIsLoading(false);
      }
    };

    generatePreview();
  }, [partsQuery.data, selectedDate]);

  const handlePrint = async () => {
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      if (!report) return;
      
      const htmlContent = generateInventoryReportHTML(report);
      await Print.printAsync({
        html: htmlContent,
      });
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch (error) {
      console.error('Error printing:', error);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      Alert.alert('خطأ', 'حدث خطأ أثناء الطباعة');
    }
  };

  const handleShare = async () => {
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      Alert.alert('معلومة', 'ميزة المشاركة قيد التطوير');
    } catch (error) {
      console.error('Error sharing:', error);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    }
  };

  return (
    <ScreenContainer className="bg-background">
      <View style={{ flex: 1, flexDirection: 'column' }}>
        {/* Header */}
        <View style={{ 
          paddingHorizontal: 16, 
          paddingTop: 12, 
          paddingBottom: 12,
          borderBottomWidth: 1,
          borderBottomColor: colors.border,
        }}>
          <Text style={{
            fontSize: 18,
            fontWeight: '700',
            color: colors.foreground,
            marginBottom: 12,
          }}>
            معاينة التقرير
          </Text>

          {/* Action Buttons */}
          <View style={{ flexDirection: 'row', gap: 8 }}>
            <Pressable
              onPress={handlePrint}
              style={({ pressed }) => [{
                flex: 1,
                backgroundColor: colors.primary,
                paddingHorizontal: 12,
                paddingVertical: 10,
                borderRadius: 6,
                alignItems: 'center',
                opacity: pressed ? 0.8 : 1,
              }]}
            >
              <Text style={{ color: '#fff', fontSize: 12, fontWeight: '600' }}>🖨️ طباعة</Text>
            </Pressable>
            <Pressable
              onPress={handleShare}
              style={({ pressed }) => [{
                flex: 1,
                backgroundColor: colors.surface,
                paddingHorizontal: 12,
                paddingVertical: 10,
                borderRadius: 6,
                alignItems: 'center',
                borderWidth: 1,
                borderColor: colors.border,
                opacity: pressed ? 0.8 : 1,
              }]}
            >
              <Text style={{ color: colors.foreground, fontSize: 12, fontWeight: '600' }}>📤 مشاركة</Text>
            </Pressable>
          </View>
        </View>

        {/* Preview Content */}
        {isLoading || !report ? (
          <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
            <Text style={{ color: colors.muted, fontSize: 14 }}>جاري تحميل المعاينة...</Text>
          </View>
        ) : (
          <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false}>
            <View style={{ padding: 16 }}>
              {/* Report Header */}
              <View style={{
                backgroundColor: colors.surface,
                borderRadius: 8,
                padding: 16,
                marginBottom: 16,
                borderWidth: 1,
                borderColor: colors.border,
              }}>
                <Text style={{
                  fontSize: 20,
                  fontWeight: '700',
                  color: colors.foreground,
                  textAlign: 'center',
                  marginBottom: 8,
                }}>
                  تقرير الجرد الشهري
                </Text>
                <Text style={{
                  fontSize: 12,
                  color: colors.muted,
                  textAlign: 'center',
                  marginBottom: 12,
                }}>
                  منفذ السلامة - نظام إدارة مخزون مغسلة السيارات
                </Text>
                <Text style={{
                  fontSize: 14,
                  fontWeight: '600',
                  color: colors.primary,
                  textAlign: 'center',
                }}>
                  {report.month} {report.year}
                </Text>
              </View>

              {/* Report Info */}
              <View style={{
                backgroundColor: colors.surface,
                borderRadius: 8,
                padding: 16,
                marginBottom: 16,
                borderWidth: 1,
                borderColor: colors.border,
              }}>
                <View style={{ marginBottom: 12, paddingBottom: 12, borderBottomWidth: 1, borderBottomColor: colors.border }}>
                  <Text style={{ fontSize: 12, color: colors.muted, marginBottom: 4 }}>تاريخ التقرير</Text>
                  <Text style={{ fontSize: 14, fontWeight: '600', color: colors.foreground }}>
                    {formatDateArabic(report.generatedDate)}
                  </Text>
                </View>
                <View style={{ marginBottom: 12, paddingBottom: 12, borderBottomWidth: 1, borderBottomColor: colors.border }}>
                  <Text style={{ fontSize: 12, color: colors.muted, marginBottom: 4 }}>إجمالي الأصناف</Text>
                  <Text style={{ fontSize: 14, fontWeight: '600', color: colors.foreground }}>
                    {report.totalItems} صنف
                  </Text>
                </View>
                <View style={{ marginBottom: 12, paddingBottom: 12, borderBottomWidth: 1, borderBottomColor: colors.border }}>
                  <Text style={{ fontSize: 12, color: colors.muted, marginBottom: 4 }}>إجمالي القيمة</Text>
                  <Text style={{ fontSize: 14, fontWeight: '600', color: colors.primary }}>
                    {formatCurrency(report.totalValue)}
                  </Text>
                </View>
                <View>
                  <Text style={{ fontSize: 12, color: colors.muted, marginBottom: 4 }}>أصناف منخفضة</Text>
                  <Text style={{ fontSize: 14, fontWeight: '600', color: colors.warning }}>
                    {report.lowStockItems} صنف
                  </Text>
                </View>
              </View>

              {/* Items Table Preview */}
              <View style={{
                backgroundColor: colors.surface,
                borderRadius: 8,
                padding: 16,
                marginBottom: 16,
                borderWidth: 1,
                borderColor: colors.border,
              }}>
                <Text style={{
                  fontSize: 14,
                  fontWeight: '600',
                  color: colors.foreground,
                  marginBottom: 12,
                }}>
                  تفاصيل الأصناف ({report.items.length})
                </Text>
                
                {report.items.slice(0, 5).map((item: any, index: number) => (
                  <View 
                    key={item.id}
                    style={{
                      paddingVertical: 10,
                      borderBottomWidth: index < Math.min(4, report.items.length - 1) ? 1 : 0,
                      borderBottomColor: colors.border,
                    }}
                  >
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 }}>
                      <Text style={{ fontSize: 12, fontWeight: '600', color: colors.foreground, flex: 1 }}>
                        {item.name}
                      </Text>
                      <Text style={{ fontSize: 12, color: colors.muted }}>
                        {item.quantity} {item.unit}
                      </Text>
                    </View>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                      <Text style={{ fontSize: 11, color: colors.muted }}>
                        {item.sku}
                      </Text>
                      <Text style={{ fontSize: 11, fontWeight: '600', color: colors.primary }}>
                        {formatCurrency(item.totalValue)}
                      </Text>
                    </View>
                  </View>
                ))}
                
                {report.items.length > 5 && (
                  <View style={{ paddingTop: 10, marginTop: 10, borderTopWidth: 1, borderTopColor: colors.border }}>
                    <Text style={{ fontSize: 12, color: colors.muted, textAlign: 'center' }}>
                      ... و {report.items.length - 5} أصناف أخرى
                    </Text>
                  </View>
                )}
              </View>

              {/* Summary */}
              <View style={{
                backgroundColor: colors.primary + '15',
                borderRadius: 8,
                padding: 16,
                marginBottom: 32,
                borderLeftWidth: 4,
                borderLeftColor: colors.primary,
              }}>
                <Text style={{
                  fontSize: 14,
                  fontWeight: '600',
                  color: colors.primary,
                  marginBottom: 12,
                }}>
                  ملخص التقرير
                </Text>
                <View style={{ marginBottom: 8 }}>
                  <Text style={{ fontSize: 12, color: colors.muted }}>
                    إجمالي الأصناف المتوفرة: {report.totalItems - report.lowStockItems - report.outOfStockItems}
                  </Text>
                </View>
                <View style={{ marginBottom: 8 }}>
                  <Text style={{ fontSize: 12, color: colors.muted }}>
                    أصناف بحد تنبيه: {report.lowStockItems}
                  </Text>
                </View>
                <View>
                  <Text style={{ fontSize: 12, color: colors.muted }}>
                    أصناف نافدة: {report.outOfStockItems}
                  </Text>
                </View>
              </View>
            </View>
          </ScrollView>
        )}
      </View>
    </ScreenContainer>
  );
}

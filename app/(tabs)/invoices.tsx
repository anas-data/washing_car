/**
 * Invoices Screen
 * Displays and manages invoices for operations
 */

import React, { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Modal,
  FlatList,
  Alert,
} from "react-native";
import { ScreenContainer } from "@/components/screen-container";
import { useColors } from "@/hooks/use-colors";
import { InvoiceService } from "@/server/_core/services/invoice.service";

interface Invoice {
  id: number;
  invoiceNumber: string;
  customerName: string;
  totalAmount: number;
  status: "draft" | "sent" | "paid" | "overdue" | "cancelled";
  invoiceDate: Date;
  items: Array<{
    description: string;
    quantity: number;
    unitPrice: number;
    totalPrice: number;
  }>;
}

export default function InvoicesScreen() {
  const colors = useColors();
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [searchText, setSearchText] = useState("");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    customerId: "",
    customerName: "",
    customerEmail: "",
    customerPhone: "",
    customerAddress: "",
    invoiceDate: new Date(),
    dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    items: [
      {
        description: "",
        quantity: 1,
        unit: "",
        unitPrice: 0,
        type: "service" as const,
      },
    ],
    taxRate: 15,
    discountAmount: 0,
    notes: "",
  });

  const handleCreateInvoice = () => {
    if (!formData.customerName || formData.items.length === 0) {
      Alert.alert("خطأ", "يرجى ملء جميع الحقول المطلوبة");
      return;
    }

    const newInvoice = InvoiceService.createInvoice({
      ...formData,
      companyName: "مغسلة السيارات",
      companyPhone: "+966501234567",
      companyEmail: "info@carwash.com",
      companyTaxId: "123456789",
    });

    setInvoices([newInvoice as any, ...invoices]);
    setShowCreateModal(false);
    setFormData({
      customerId: "",
      customerName: "",
      customerEmail: "",
      customerPhone: "",
      customerAddress: "",
      invoiceDate: new Date(),
      dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      items: [
        {
          description: "",
          quantity: 1,
          unit: "",
          unitPrice: 0,
          type: "service",
        },
      ],
      taxRate: 15,
      discountAmount: 0,
      notes: "",
    });

    Alert.alert("نجاح", "تم إنشاء الفاتورة بنجاح");
  };

  const handleAddItem = () => {
    setFormData({
      ...formData,
      items: [
        ...formData.items,
        {
          description: "",
          quantity: 1,
          unit: "",
          unitPrice: 0,
          type: "service",
        },
      ],
    });
  };

  const handleRemoveItem = (index: number) => {
    setFormData({
      ...formData,
      items: formData.items.filter((_, i) => i !== index),
    });
  };

  const handleUpdateItem = (index: number, field: string, value: any) => {
    const newItems = [...formData.items];
    newItems[index] = { ...newItems[index], [field]: value };
    setFormData({ ...formData, items: newItems });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "paid":
        return colors.success;
      case "sent":
        return colors.primary;
      case "draft":
        return colors.muted;
      case "overdue":
        return colors.error;
      case "cancelled":
        return colors.muted;
      default:
        return colors.foreground;
    }
  };

  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      draft: "مسودة",
      sent: "مرسلة",
      paid: "مدفوعة",
      overdue: "متأخرة",
      cancelled: "ملغاة",
    };
    return labels[status] || status;
  };

  const filteredInvoices = invoices.filter(
    (inv) =>
      inv.customerName.includes(searchText) ||
      inv.invoiceNumber.includes(searchText)
  );

  const renderInvoiceItem = ({ item }: { item: Invoice }) => (
    <TouchableOpacity
      onPress={() => {
        setSelectedInvoice(item);
        setShowDetailsModal(true);
      }}
      style={{
        backgroundColor: colors.surface,
        borderRadius: 12,
        padding: 16,
        marginBottom: 12,
        borderLeftWidth: 4,
        borderLeftColor: getStatusColor(item.status),
      }}
    >
      <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
        <View style={{ flex: 1 }}>
          <Text
            style={{
              fontSize: 16,
              fontWeight: "600",
              color: colors.foreground,
            }}
          >
            {item.invoiceNumber}
          </Text>
          <Text style={{ fontSize: 14, color: colors.muted, marginTop: 4 }}>
            {item.customerName}
          </Text>
        </View>
        <View style={{ alignItems: "flex-end" }}>
          <Text
            style={{
              fontSize: 16,
              fontWeight: "600",
              color: colors.foreground,
            }}
          >
            {InvoiceService.formatCurrency(item.totalAmount)}
          </Text>
          <Text
            style={{
              fontSize: 12,
              color: getStatusColor(item.status),
              marginTop: 4,
              fontWeight: "500",
            }}
          >
            {getStatusLabel(item.status)}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <ScreenContainer className="p-4">
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={{ marginBottom: 20 }}>
          <Text
            style={{
              fontSize: 24,
              fontWeight: "700",
              color: colors.foreground,
            }}
          >
            الفواتير
          </Text>
          <Text style={{ fontSize: 14, color: colors.muted, marginTop: 4 }}>
            إدارة فواتير العملاء
          </Text>
        </View>

        {/* Search Bar */}
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            marginBottom: 16,
            gap: 8,
          }}
        >
          <View
            style={{
              flex: 1,
              flexDirection: "row",
              alignItems: "center",
              backgroundColor: colors.surface,
              borderRadius: 8,
              paddingHorizontal: 12,
              borderWidth: 1,
              borderColor: colors.border,
            }}
          >
            <TextInput
              placeholder="ابحث عن فاتورة..."
              placeholderTextColor={colors.muted}
              value={searchText}
              onChangeText={setSearchText}
              style={{
                flex: 1,
                paddingVertical: 12,
                color: colors.foreground,
                fontSize: 14,
              }}
            />
          </View>
          <TouchableOpacity
            onPress={() => setShowCreateModal(true)}
            style={{
              backgroundColor: colors.primary,
              borderRadius: 8,
              paddingHorizontal: 12,
              paddingVertical: 12,
            }}
          >
            <Text style={{ color: "white", fontWeight: "600", fontSize: 18 }}>
              +
            </Text>
          </TouchableOpacity>
        </View>

        {/* Invoices List */}
        {filteredInvoices.length > 0 ? (
          <FlatList
            data={filteredInvoices}
            renderItem={renderInvoiceItem}
            keyExtractor={(item) => item.id.toString()}
            scrollEnabled={false}
          />
        ) : (
          <View
            style={{
              alignItems: "center",
              justifyContent: "center",
              paddingVertical: 40,
            }}
          >
            <Text
              style={{
                fontSize: 16,
                color: colors.muted,
                textAlign: "center",
              }}
            >
              لا توجد فواتير
            </Text>
          </View>
        )}
      </ScrollView>

      {/* Create Invoice Modal */}
      <Modal
        visible={showCreateModal}
        animationType="slide"
        onRequestClose={() => setShowCreateModal(false)}
      >
        <ScreenContainer className="p-4">
          <ScrollView showsVerticalScrollIndicator={false}>
            {/* Header */}
            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: 20,
              }}
            >
              <Text
                style={{
                  fontSize: 20,
                  fontWeight: "700",
                  color: colors.foreground,
                }}
              >
                فاتورة جديدة
              </Text>
              <TouchableOpacity onPress={() => setShowCreateModal(false)}>
                <Text style={{ fontSize: 24, color: colors.muted }}>×</Text>
              </TouchableOpacity>
            </View>

            {/* Customer Info */}
            <View style={{ marginBottom: 20 }}>
              <Text
                style={{
                  fontSize: 14,
                  fontWeight: "600",
                  color: colors.foreground,
                  marginBottom: 12,
                }}
              >
                معلومات العميل
              </Text>

              <TextInput
                placeholder="اسم العميل"
                placeholderTextColor={colors.muted}
                value={formData.customerName}
                onChangeText={(text) =>
                  setFormData({ ...formData, customerName: text })
                }
                style={{
                  backgroundColor: colors.surface,
                  borderRadius: 8,
                  paddingHorizontal: 12,
                  paddingVertical: 10,
                  marginBottom: 12,
                  color: colors.foreground,
                  borderWidth: 1,
                  borderColor: colors.border,
                }}
              />

              <TextInput
                placeholder="البريد الإلكتروني"
                placeholderTextColor={colors.muted}
                value={formData.customerEmail}
                onChangeText={(text) =>
                  setFormData({ ...formData, customerEmail: text })
                }
                style={{
                  backgroundColor: colors.surface,
                  borderRadius: 8,
                  paddingHorizontal: 12,
                  paddingVertical: 10,
                  marginBottom: 12,
                  color: colors.foreground,
                  borderWidth: 1,
                  borderColor: colors.border,
                }}
              />

              <TextInput
                placeholder="رقم الهاتف"
                placeholderTextColor={colors.muted}
                value={formData.customerPhone}
                onChangeText={(text) =>
                  setFormData({ ...formData, customerPhone: text })
                }
                style={{
                  backgroundColor: colors.surface,
                  borderRadius: 8,
                  paddingHorizontal: 12,
                  paddingVertical: 10,
                  color: colors.foreground,
                  borderWidth: 1,
                  borderColor: colors.border,
                }}
              />
            </View>

            {/* Items */}
            <View style={{ marginBottom: 20 }}>
              <View
                style={{
                  flexDirection: "row",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: 12,
                }}
              >
                <Text
                  style={{
                    fontSize: 14,
                    fontWeight: "600",
                    color: colors.foreground,
                  }}
                >
                  البنود
                </Text>
                <TouchableOpacity onPress={handleAddItem}>
                  <Text
                    style={{
                      color: colors.primary,
                      fontWeight: "600",
                      fontSize: 14,
                    }}
                  >
                    + إضافة بند
                  </Text>
                </TouchableOpacity>
              </View>

              {formData.items.map((item, index) => (
                <View
                  key={index}
                  style={{
                    backgroundColor: colors.surface,
                    borderRadius: 8,
                    padding: 12,
                    marginBottom: 12,
                    borderWidth: 1,
                    borderColor: colors.border,
                  }}
                >
                  <View
                    style={{
                      flexDirection: "row",
                      justifyContent: "space-between",
                      alignItems: "center",
                      marginBottom: 12,
                    }}
                  >
                    <Text
                      style={{
                        fontSize: 12,
                        color: colors.muted,
                        fontWeight: "500",
                      }}
                    >
                      البند {index + 1}
                    </Text>
                    {formData.items.length > 1 && (
                      <TouchableOpacity onPress={() => handleRemoveItem(index)}>
                        <Text style={{ color: colors.error, fontSize: 18 }}>
                          ×
                        </Text>
                      </TouchableOpacity>
                    )}
                  </View>

                  <TextInput
                    placeholder="الوصف"
                    placeholderTextColor={colors.muted}
                    value={item.description}
                    onChangeText={(text) =>
                      handleUpdateItem(index, "description", text)
                    }
                    style={{
                      backgroundColor: colors.background,
                      borderRadius: 6,
                      paddingHorizontal: 10,
                      paddingVertical: 8,
                      marginBottom: 8,
                      color: colors.foreground,
                      borderWidth: 1,
                      borderColor: colors.border,
                      fontSize: 12,
                    }}
                  />

                  <View style={{ flexDirection: "row", gap: 8 }}>
                    <TextInput
                      placeholder="الكمية"
                      placeholderTextColor={colors.muted}
                      value={item.quantity.toString()}
                      onChangeText={(text) =>
                        handleUpdateItem(
                          index,
                          "quantity",
                          parseFloat(text) || 0
                        )
                      }
                      keyboardType="decimal-pad"
                      style={{
                        flex: 1,
                        backgroundColor: colors.background,
                        borderRadius: 6,
                        paddingHorizontal: 10,
                        paddingVertical: 8,
                        color: colors.foreground,
                        borderWidth: 1,
                        borderColor: colors.border,
                        fontSize: 12,
                      }}
                    />
                    <TextInput
                      placeholder="السعر"
                      placeholderTextColor={colors.muted}
                      value={item.unitPrice.toString()}
                      onChangeText={(text) =>
                        handleUpdateItem(
                          index,
                          "unitPrice",
                          parseFloat(text) || 0
                        )
                      }
                      keyboardType="decimal-pad"
                      style={{
                        flex: 1,
                        backgroundColor: colors.background,
                        borderRadius: 6,
                        paddingHorizontal: 10,
                        paddingVertical: 8,
                        color: colors.foreground,
                        borderWidth: 1,
                        borderColor: colors.border,
                        fontSize: 12,
                      }}
                    />
                  </View>
                </View>
              ))}
            </View>

            {/* Tax and Discount */}
            <View style={{ marginBottom: 20 }}>
              <Text
                style={{
                  fontSize: 14,
                  fontWeight: "600",
                  color: colors.foreground,
                  marginBottom: 12,
                }}
              >
                الضريبة والخصم
              </Text>

              <View style={{ flexDirection: "row", gap: 12 }}>
                <View style={{ flex: 1 }}>
                  <Text
                    style={{
                      fontSize: 12,
                      color: colors.muted,
                      marginBottom: 6,
                    }}
                  >
                    نسبة الضريبة (%)
                  </Text>
                  <TextInput
                    placeholder="15"
                    placeholderTextColor={colors.muted}
                    value={formData.taxRate.toString()}
                    onChangeText={(text) =>
                      setFormData({
                        ...formData,
                        taxRate: parseFloat(text) || 0,
                      })
                    }
                    keyboardType="decimal-pad"
                    style={{
                      backgroundColor: colors.surface,
                      borderRadius: 8,
                      paddingHorizontal: 12,
                      paddingVertical: 10,
                      color: colors.foreground,
                      borderWidth: 1,
                      borderColor: colors.border,
                    }}
                  />
                </View>

                <View style={{ flex: 1 }}>
                  <Text
                    style={{
                      fontSize: 12,
                      color: colors.muted,
                      marginBottom: 6,
                    }}
                  >
                    الخصم
                  </Text>
                  <TextInput
                    placeholder="0"
                    placeholderTextColor={colors.muted}
                    value={formData.discountAmount.toString()}
                    onChangeText={(text) =>
                      setFormData({
                        ...formData,
                        discountAmount: parseFloat(text) || 0,
                      })
                    }
                    keyboardType="decimal-pad"
                    style={{
                      backgroundColor: colors.surface,
                      borderRadius: 8,
                      paddingHorizontal: 12,
                      paddingVertical: 10,
                      color: colors.foreground,
                      borderWidth: 1,
                      borderColor: colors.border,
                    }}
                  />
                </View>
              </View>
            </View>

            {/* Notes */}
            <View style={{ marginBottom: 20 }}>
              <Text
                style={{
                  fontSize: 14,
                  fontWeight: "600",
                  color: colors.foreground,
                  marginBottom: 12,
                }}
              >
                ملاحظات
              </Text>
              <TextInput
                placeholder="أضف ملاحظات..."
                placeholderTextColor={colors.muted}
                value={formData.notes}
                onChangeText={(text) =>
                  setFormData({ ...formData, notes: text })
                }
                multiline
                numberOfLines={4}
                style={{
                  backgroundColor: colors.surface,
                  borderRadius: 8,
                  paddingHorizontal: 12,
                  paddingVertical: 10,
                  color: colors.foreground,
                  borderWidth: 1,
                  borderColor: colors.border,
                  textAlignVertical: "top",
                }}
              />
            </View>

            {/* Action Buttons */}
            <View style={{ flexDirection: "row", gap: 12, marginBottom: 20 }}>
              <TouchableOpacity
                onPress={() => setShowCreateModal(false)}
                style={{
                  flex: 1,
                  backgroundColor: colors.surface,
                  borderRadius: 8,
                  paddingVertical: 12,
                  alignItems: "center",
                  borderWidth: 1,
                  borderColor: colors.border,
                }}
              >
                <Text
                  style={{
                    color: colors.foreground,
                    fontWeight: "600",
                    fontSize: 14,
                  }}
                >
                  إلغاء
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={handleCreateInvoice}
                style={{
                  flex: 1,
                  backgroundColor: colors.primary,
                  borderRadius: 8,
                  paddingVertical: 12,
                  alignItems: "center",
                }}
              >
                <Text
                  style={{
                    color: "white",
                    fontWeight: "600",
                    fontSize: 14,
                  }}
                >
                  إنشاء الفاتورة
                </Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </ScreenContainer>
      </Modal>

      {/* Invoice Details Modal */}
      <Modal
        visible={showDetailsModal && selectedInvoice !== null}
        animationType="slide"
        onRequestClose={() => setShowDetailsModal(false)}
      >
        <ScreenContainer className="p-4">
          <ScrollView showsVerticalScrollIndicator={false}>
            {selectedInvoice && (
              <>
                {/* Header */}
                <View
                  style={{
                    flexDirection: "row",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginBottom: 20,
                  }}
                >
                  <View>
                    <Text
                      style={{
                        fontSize: 20,
                        fontWeight: "700",
                        color: colors.foreground,
                      }}
                    >
                      {selectedInvoice.invoiceNumber}
                    </Text>
                    <Text
                      style={{
                        fontSize: 14,
                        color: colors.muted,
                        marginTop: 4,
                      }}
                    >
                      {selectedInvoice.customerName}
                    </Text>
                  </View>
                  <TouchableOpacity onPress={() => setShowDetailsModal(false)}>
                    <Text style={{ fontSize: 24, color: colors.muted }}>×</Text>
                  </TouchableOpacity>
                </View>

                {/* Invoice Details */}
                <View
                  style={{
                    backgroundColor: colors.surface,
                    borderRadius: 12,
                    padding: 16,
                    marginBottom: 20,
                  }}
                >
                  <View
                    style={{
                      flexDirection: "row",
                      justifyContent: "space-between",
                      marginBottom: 12,
                    }}
                  >
                    <Text style={{ color: colors.muted, fontSize: 14 }}>
                      الحالة:
                    </Text>
                    <Text
                      style={{
                        color: getStatusColor(selectedInvoice.status),
                        fontWeight: "600",
                        fontSize: 14,
                      }}
                    >
                      {getStatusLabel(selectedInvoice.status)}
                    </Text>
                  </View>

                  <View
                    style={{
                      flexDirection: "row",
                      justifyContent: "space-between",
                      marginBottom: 12,
                    }}
                  >
                    <Text style={{ color: colors.muted, fontSize: 14 }}>
                      التاريخ:
                    </Text>
                    <Text
                      style={{
                        color: colors.foreground,
                        fontWeight: "500",
                        fontSize: 14,
                      }}
                    >
                      {InvoiceService.formatDate(selectedInvoice.invoiceDate)}
                    </Text>
                  </View>

                  <View
                    style={{
                      flexDirection: "row",
                      justifyContent: "space-between",
                    }}
                  >
                    <Text style={{ color: colors.muted, fontSize: 14 }}>
                      الإجمالي:
                    </Text>
                    <Text
                      style={{
                        color: colors.foreground,
                        fontWeight: "600",
                        fontSize: 16,
                      }}
                    >
                      {InvoiceService.formatCurrency(
                        selectedInvoice.totalAmount
                      )}
                    </Text>
                  </View>
                </View>

                {/* Items */}
                <View style={{ marginBottom: 20 }}>
                  <Text
                    style={{
                      fontSize: 14,
                      fontWeight: "600",
                      color: colors.foreground,
                      marginBottom: 12,
                    }}
                  >
                    البنود
                  </Text>

                  {selectedInvoice.items.map((item, index) => (
                    <View
                      key={index}
                      style={{
                        backgroundColor: colors.surface,
                        borderRadius: 8,
                        padding: 12,
                        marginBottom: 8,
                      }}
                    >
                      <Text
                        style={{
                          color: colors.foreground,
                          fontWeight: "500",
                          fontSize: 14,
                          marginBottom: 4,
                        }}
                      >
                        {item.description}
                      </Text>
                      <View
                        style={{
                          flexDirection: "row",
                          justifyContent: "space-between",
                          marginTop: 8,
                        }}
                      >
                        <Text
                          style={{
                            color: colors.muted,
                            fontSize: 12,
                          }}
                        >
                          {item.quantity} × {InvoiceService.formatCurrency(
                            item.unitPrice
                          )}
                        </Text>
                        <Text
                          style={{
                            color: colors.foreground,
                            fontWeight: "600",
                            fontSize: 12,
                          }}
                        >
                          {InvoiceService.formatCurrency(item.totalPrice)}
                        </Text>
                      </View>
                    </View>
                  ))}
                </View>

                {/* Action Buttons */}
                <View style={{ flexDirection: "row", gap: 12 }}>
                  <TouchableOpacity
                    onPress={() => setShowDetailsModal(false)}
                    style={{
                      flex: 1,
                      backgroundColor: colors.surface,
                      borderRadius: 8,
                      paddingVertical: 12,
                      alignItems: "center",
                      borderWidth: 1,
                      borderColor: colors.border,
                    }}
                  >
                    <Text
                      style={{
                        color: colors.foreground,
                        fontWeight: "600",
                        fontSize: 14,
                      }}
                    >
                      إغلاق
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    onPress={() => {
                      Alert.alert("نجاح", "تم طباعة الفاتورة");
                    }}
                    style={{
                      flex: 1,
                      backgroundColor: colors.primary,
                      borderRadius: 8,
                      paddingVertical: 12,
                      alignItems: "center",
                    }}
                  >
                    <Text
                      style={{
                        color: "white",
                        fontWeight: "600",
                        fontSize: 14,
                      }}
                    >
                      طباعة
                    </Text>
                  </TouchableOpacity>
                </View>
              </>
            )}
          </ScrollView>
        </ScreenContainer>
      </Modal>
    </ScreenContainer>
  );
}

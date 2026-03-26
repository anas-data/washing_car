import { ScrollView, Text, View, Pressable, I18nManager, Alert } from "react-native";
import { useState } from "react";
import { ScreenContainer } from "@/components/screen-container";
import { useColors } from "@/hooks/use-colors";
import { useAuth } from "@/hooks/use-auth";
import { useRouter } from "expo-router";
import * as Haptics from "expo-haptics";
import * as SecureStore from "expo-secure-store";

I18nManager.forceRTL(true);

export default function SettingsScreen() {
  const colors = useColors();
  const { user, logout } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleLogout = async () => {
    Alert.alert("تسجيل الخروج", "هل أنت متأكد من رغبتك في تسجيل الخروج؟", [
      {
        text: "إلغاء",
        onPress: () => {},
        style: "cancel",
      },
      {
        text: "تسجيل الخروج",
        onPress: async () => {
          try {
            setLoading(true);
            await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            await logout?.();
            router.replace("/");
          } catch (error) {
            Alert.alert("خطأ", "فشل تسجيل الخروج");
            await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
          } finally {
            setLoading(false);
          }
        },
        style: "destructive",
      },
    ]);
  };

  const SettingItem = ({
    icon,
    label,
    value,
    onPress,
    destructive,
  }: {
    icon: string;
    label: string;
    value?: string;
    onPress?: () => void;
    destructive?: boolean;
  }) => (
    <Pressable
      onPress={onPress}
      disabled={!onPress}
      style={({ pressed }) => [
        {
          backgroundColor: colors.surface,
          borderRadius: 12,
          padding: 16,
          marginHorizontal: 16,
          marginVertical: 6,
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "center",
          opacity: pressed ? 0.7 : 1,
        },
      ]}
    >
      <View style={{ flexDirection: "row", alignItems: "center", flex: 1 }}>
        <Text style={{ fontSize: 20, marginRight: 12 }}>{icon}</Text>
        <View>
          <Text
            style={{
              fontSize: 14,
              fontWeight: "600",
              color: destructive ? colors.error : colors.foreground,
            }}
          >
            {label}
          </Text>
          {value && (
            <Text
              style={{
                fontSize: 12,
                color: colors.muted,
                marginTop: 4,
              }}
            >
              {value}
            </Text>
          )}
        </View>
      </View>
      {onPress && (
        <Text style={{ fontSize: 16, color: colors.muted }}>›</Text>
      )}
    </Pressable>
  );

  const SectionHeader = ({ title }: { title: string }) => (
    <Text
      style={{
        fontSize: 14,
        fontWeight: "600",
        color: colors.muted,
        marginHorizontal: 16,
        marginTop: 20,
        marginBottom: 12,
        textTransform: "uppercase",
      }}
    >
      {title}
    </Text>
  );

  return (
    <ScreenContainer className="bg-background">
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={{ paddingHorizontal: 16, paddingTop: 16, paddingBottom: 12 }}>
          <Text
            style={{
              fontSize: 24,
              fontWeight: "700",
              color: colors.foreground,
              marginBottom: 8,
            }}
          >
            الإعدادات
          </Text>
        </View>

        {/* User Profile Section */}
        <SectionHeader title="الملف الشخصي" />
        <View
          style={{
            backgroundColor: colors.surface,
            borderRadius: 12,
            marginHorizontal: 16,
            marginVertical: 6,
            padding: 16,
            borderWidth: 1,
            borderColor: colors.border,
          }}
        >
          <View style={{ marginBottom: 12 }}>
            <Text style={{ fontSize: 12, color: colors.muted, marginBottom: 4 }}>
              الاسم
            </Text>
            <Text
              style={{
                fontSize: 16,
                fontWeight: "600",
                color: colors.foreground,
              }}
            >
              {user?.name || "المستخدم"}
            </Text>
          </View>

          <View style={{ marginBottom: 12 }}>
            <Text style={{ fontSize: 12, color: colors.muted, marginBottom: 4 }}>
              البريد الإلكتروني
            </Text>
            <Text
              style={{
                fontSize: 16,
                fontWeight: "600",
                color: colors.foreground,
              }}
            >
              {user?.email || "لم يتم تحديده"}
            </Text>
          </View>

          <View>
            <Text style={{ fontSize: 12, color: colors.muted, marginBottom: 4 }}>
              الدور
            </Text>
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
              }}
            >
              <Text
                style={{
                  fontSize: 16,
                  fontWeight: "600",
                  color: colors.foreground,
                }}
              >
                {(user as any)?.role === "admin" ? "مسؤول" : "موظف"}
              </Text>
              {(user as any)?.role === "admin" && (
                <View
                  style={{
                    backgroundColor: colors.primary,
                    paddingHorizontal: 8,
                    paddingVertical: 4,
                    borderRadius: 6,
                    marginLeft: 8,
                  }}
                >
                  <Text
                    style={{
                      fontSize: 10,
                      fontWeight: "600",
                      color: "#ffffff",
                    }}
                  >
                    👑 إداري
                  </Text>
                </View>
              )}
            </View>
          </View>
        </View>

        {/* App Settings */}
        <SectionHeader title="إعدادات التطبيق" />
        <SettingItem
          icon="🌙"
          label="المظهر"
          value="فاتح / داكن"
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            Alert.alert("المظهر", "يتم اختيار المظهر تلقائياً بناءً على إعدادات النظام");
          }}
        />
        <SettingItem
          icon="🔔"
          label="الإشعارات"
          value="مفعلة"
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            Alert.alert("الإشعارات", "الإشعارات مفعلة - ستتلقى تنبيهات عند العمليات المهمة");
          }}
        />
        <SettingItem
          icon="🌍"
          label="اللغة"
          value="العربية"
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            Alert.alert("اللغة", "التطبيق يدعم اللغة العربية بشكل كامل");
          }}
        />

        {/* Admin Settings */}
        {(user as any)?.role === "admin" && (
          <>
            <SectionHeader title="إدارة النظام" />
            <SettingItem
              icon="👥"
              label="إدارة المستخدمين"
              value="عرض وتعديل المستخدمين"
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                router.push("/admin/users" as any);
              }}
            />
            <SettingItem
              icon="🔧"
              label="إدارة المركبات"
              value="إضافة وتعديل المركبات"
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                router.push("/admin/vehicles" as any);
              }}
            />
            <SettingItem
              icon="📦"
              label="إدارة القطع"
              value="إضافة وتعديل القطع"
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                router.push("/admin/parts" as any);
              }}
            />
          </>
        )}

        {/* About Section */}
        <SectionHeader title="حول التطبيق" />
        <SettingItem
          icon="ℹ️"
          label="حول منفذ السلامة"
          value="الإصدار 1.0.0"
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            Alert.alert(
              "حول التطبيق",
              "منفذ السلامة - نظام إدارة مخزون مغسلة السيارات\n\nالإصدار: 1.0.0\n\nتم تطويره بواسطة فريق التطوير المتخصص"
            );
          }}
        />
        <SettingItem
          icon="📋"
          label="شروط الاستخدام"
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            Alert.alert(
              "شروط الاستخدام",
              "يجب على المستخدمين الالتزام بسياسات الاستخدام والحفاظ على سرية بيانات النظام"
            );
          }}
        />
        <SettingItem
          icon="🔒"
          label="سياسة الخصوصية"
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            Alert.alert(
              "سياسة الخصوصية",
              "نحن نحافظ على خصوصية بيانات المستخدمين ولا نشاركها مع أطراف ثالثة"
            );
          }}
        />

        {/* Danger Zone */}
        <SectionHeader title="منطقة الخطر" />
        <SettingItem
          icon="🚪"
          label="تسجيل الخروج"
          onPress={handleLogout}
          destructive
        />

        {/* Footer */}
        <View
          style={{
            paddingHorizontal: 16,
            paddingVertical: 24,
            alignItems: "center",
          }}
        >
          <Text
            style={{
              fontSize: 12,
              color: colors.muted,
              textAlign: "center",
            }}
          >
            منفذ السلامة © 2026
          </Text>
          <Text
            style={{
              fontSize: 11,
              color: colors.muted,
              marginTop: 8,
              textAlign: "center",
            }}
          >
            جميع الحقوق محفوظة
          </Text>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}

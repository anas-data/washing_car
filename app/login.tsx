import { useEffect, useState } from "react";
import {
  ScrollView,
  Text,
  View,
  Pressable,
  I18nManager,
  ActivityIndicator,
  Alert,
  Platform,
} from "react-native";
import { ScreenContainer } from "@/components/screen-container";
import { useColors } from "@/hooks/use-colors";
import { useRouter } from "expo-router";
import { useAuth } from "@/hooks/use-auth";
import * as Haptics from "expo-haptics";
import * as WebBrowser from "expo-web-browser";
import { startOAuthLogin } from "@/constants/oauth";

// Force RTL layout for Arabic
if (typeof I18nManager !== "undefined" && I18nManager.forceRTL) {
  I18nManager.forceRTL(true);
}

export default function LoginScreen() {
  const colors = useColors();
  const router = useRouter();
  const { user, loading, isAuthenticated, refresh } = useAuth();
  const [isLoading, setIsLoading] = useState(false);

  // If user is already authenticated, redirect to home
  useEffect(() => {
    if (isAuthenticated && user) {
      router.replace("/(tabs)");
    }
  }, [isAuthenticated, user, router]);

  const handleGoogleSignIn = async () => {
    try {
      setIsLoading(true);
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

      // Start OAuth login flow
      await startOAuthLogin();

      // On web, the redirect will happen automatically
      // On native, we need to wait for the deep link callback
      if (Platform.OS !== "web") {
        // Refresh auth state after a delay to check if login was successful
        setTimeout(() => {
          refresh();
        }, 2000);
      }
    } catch (error) {
      console.error("[Login] Google sign-in error:", error);
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      Alert.alert(
        "خطأ",
        "فشل تسجيل الدخول. يرجى المحاولة مرة أخرى.",
        [{ text: "حسناً" }]
      );
    } finally {
      setIsLoading(false);
    }
  };

  if (loading) {
    return (
      <ScreenContainer className="items-center justify-center">
        <ActivityIndicator size="large" color={colors.primary} />
        <Text className="mt-4 text-base text-foreground">جاري التحقق...</Text>
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer containerClassName="bg-background">
      <ScrollView
        contentContainerStyle={{ flexGrow: 1 }}
        showsVerticalScrollIndicator={false}
      >
        <View className="flex-1 justify-center px-6 py-8">
          {/* Header Section */}
          <View className="mb-12 items-center">
            {/* App Icon */}
            <View
              className="mb-6 h-20 w-20 items-center justify-center rounded-full"
              style={{ backgroundColor: colors.primary }}
            >
              <Text className="text-4xl">🚗</Text>
            </View>

            {/* App Title */}
            <Text
              className="text-3xl font-bold text-foreground"
              style={{ textAlign: "right" }}
            >
              منفذ السلامة
            </Text>
            <Text
              className="mt-2 text-base text-muted"
              style={{ textAlign: "right" }}
            >
              إدارة مخزون مغسلة السيارات
            </Text>
          </View>

          {/* Features Section */}
          <View className="mb-12 gap-4">
            <FeatureItem
              icon="📦"
              title="إدارة المخزون"
              description="تتبع القطع والمواد بكفاءة"
              colors={colors}
            />
            <FeatureItem
              icon="🚗"
              title="إدارة المركبات"
              description="مراقبة حالة جميع المركبات"
              colors={colors}
            />
            <FeatureItem
              icon="✅"
              title="الموافقات"
              description="نظام موافقات متعدد المستويات"
              colors={colors}
            />
            <FeatureItem
              icon="📊"
              title="التقارير"
              description="تحليلات شاملة وتقارير مفصلة"
              colors={colors}
            />
          </View>

          {/* Login Section */}
          <View className="gap-4">
            {/* Google Sign-In Button */}
            <Pressable
              onPress={handleGoogleSignIn}
              disabled={isLoading}
              style={({ pressed }) => [
                {
                  backgroundColor: colors.surface,
                  borderRadius: 12,
                  padding: 16,
                  borderWidth: 2,
                  borderColor: colors.border,
                  opacity: pressed || isLoading ? 0.7 : 1,
                },
              ]}
            >
              <View className="flex-row items-center justify-center gap-3">
                {isLoading ? (
                  <ActivityIndicator
                    size="small"
                    color={colors.primary}
                    style={{ marginRight: 8 }}
                  />
                ) : (
                  <Text className="text-2xl">🔐</Text>
                )}
                <Text
                  className="text-center text-lg font-semibold"
                  style={{ color: colors.foreground }}
                >
                  {isLoading ? "جاري التسجيل..." : "تسجيل الدخول عبر Google"}
                </Text>
              </View>
            </Pressable>

            {/* Demo Button (for testing without OAuth) */}
            <Pressable
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                // Navigate to home with test endpoints
                router.replace("/(tabs)");
              }}
              style={({ pressed }) => [
                {
                  backgroundColor: colors.primary,
                  borderRadius: 12,
                  padding: 16,
                  opacity: pressed ? 0.85 : 1,
                },
              ]}
            >
              <Text
                className="text-center text-lg font-semibold"
                style={{ color: "#ffffff" }}
              >
                متابعة كزائر (عرض توضيحي)
              </Text>
            </Pressable>
          </View>

          {/* Footer */}
          <View className="mt-12 items-center">
            <Text
              className="text-xs text-muted"
              style={{ textAlign: "center" }}
            >
              بتسجيل الدخول، أنت توافق على شروط الخدمة وسياسة الخصوصية
            </Text>
          </View>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}

// Feature Item Component
function FeatureItem({
  icon,
  title,
  description,
  colors,
}: {
  icon: string;
  title: string;
  description: string;
  colors: any;
}) {
  return (
    <View
      className="flex-row items-center gap-3 rounded-lg p-4"
      style={{ backgroundColor: colors.surface }}
    >
      <Text className="text-2xl">{icon}</Text>
      <View className="flex-1">
        <Text
          className="text-base font-semibold text-foreground"
          style={{ textAlign: "right" }}
        >
          {title}
        </Text>
        <Text
          className="text-sm text-muted"
          style={{ textAlign: "right", marginTop: 2 }}
        >
          {description}
        </Text>
      </View>
    </View>
  );
}

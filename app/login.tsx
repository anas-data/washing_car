import { useState, useEffect } from "react";
import {
  ScrollView,
  Text,
  View,
  Pressable,
  I18nManager,
  ActivityIndicator,
  Alert,
  TextInput,
} from "react-native";
import { ScreenContainer } from "@/components/screen-container";
import { useColors } from "@/hooks/use-colors";
import { useRouter } from "expo-router";
import { useAuth } from "@/hooks/use-auth";
import * as Haptics from "expo-haptics";
import { localAuth } from "@/lib/local-auth";

// Force RTL layout for Arabic
if (typeof I18nManager !== "undefined" && I18nManager.forceRTL) {
  I18nManager.forceRTL(true);
}

export default function LoginScreen() {
  const colors = useColors();
  const router = useRouter();
  const { user, loading, isAuthenticated, refresh } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  // If user is already authenticated, redirect to home
  useEffect(() => {
    if (isAuthenticated && user) {
      router.replace("/(tabs)");
    }
  }, [isAuthenticated, user, router]);

  const handleLogin = async () => {
    try {
      // Validate inputs
      if (!username.trim()) {
        Alert.alert("خطأ", "يرجى إدخال اسم المستخدم أو البريد الإلكتروني");
        return;
      }

      if (!password.trim()) {
        Alert.alert("خطأ", "يرجى إدخال كلمة المرور");
        return;
      }

      setIsLoading(true);
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

      // Attempt login
      const user = await localAuth.login({
        username: username.trim(),
        password: password.trim(),
      });

      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

      // Refresh auth state
      await refresh();

      // Clear form
      setUsername("");
      setPassword("");
    } catch (error) {
      console.error("[Login] Error:", error);
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);

      const errorMessage =
        error instanceof Error ? error.message : "فشل تسجيل الدخول";
      Alert.alert("خطأ", errorMessage, [{ text: "حسناً" }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGuestAccess = async () => {
    try {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      // Navigate to home as guest (public endpoints only)
      router.replace("/(tabs)");
    } catch (error) {
      console.error("[Login] Guest access error:", error);
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
              style={{ textAlign: "center" }}
            >
              نظام إدارة مخزون مغسلة السيارات
            </Text>
          </View>

          {/* Login Form */}
          <View className="mb-8">
            {/* Username/Email Input */}
            <View className="mb-4">
              <Text
                className="mb-2 text-sm font-semibold text-foreground"
                style={{ textAlign: "right" }}
              >
                اسم المستخدم أو البريد الإلكتروني
              </Text>
              <TextInput
                placeholder="أدخل اسم المستخدم أو البريد الإلكتروني"
                placeholderTextColor={colors.muted}
                value={username}
                onChangeText={setUsername}
                editable={!isLoading}
                style={{
                  backgroundColor: colors.surface,
                  borderColor: colors.border,
                  borderWidth: 1,
                  borderRadius: 8,
                  padding: 12,
                  fontSize: 14,
                  color: colors.foreground,
                  textAlign: "right",
                }}
              />
            </View>

            {/* Password Input */}
            <View className="mb-6">
              <Text
                className="mb-2 text-sm font-semibold text-foreground"
                style={{ textAlign: "right" }}
              >
                كلمة المرور
              </Text>
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  backgroundColor: colors.surface,
                  borderColor: colors.border,
                  borderWidth: 1,
                  borderRadius: 8,
                  paddingRight: 12,
                }}
              >
                <TextInput
                  placeholder="أدخل كلمة المرور"
                  placeholderTextColor={colors.muted}
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry={!showPassword}
                  editable={!isLoading}
                  style={{
                    flex: 1,
                    padding: 12,
                    fontSize: 14,
                    color: colors.foreground,
                    textAlign: "right",
                  }}
                />
                <Pressable
                  onPress={() => setShowPassword(!showPassword)}
                  style={{ paddingLeft: 12 }}
                >
                  <Text className="text-lg">{showPassword ? "👁️" : "👁️‍🗨️"}</Text>
                </Pressable>
              </View>
            </View>

            {/* Login Button */}
            <Pressable
              onPress={handleLogin}
              disabled={isLoading}
              style={({ pressed }) => [
                {
                  backgroundColor: colors.primary,
                  borderRadius: 8,
                  padding: 14,
                  alignItems: "center",
                  opacity: pressed || isLoading ? 0.8 : 1,
                },
              ]}
            >
              {isLoading ? (
                <ActivityIndicator color={colors.background} size="small" />
              ) : (
                <Text
                  className="text-base font-semibold text-background"
                  style={{ textAlign: "center" }}
                >
                  تسجيل الدخول
                </Text>
              )}
            </Pressable>
          </View>

          {/* Demo Credentials */}
          <View
            className="mb-8 rounded-lg p-4"
            style={{ backgroundColor: colors.surface }}
          >
            <Text
              className="mb-3 text-sm font-semibold text-foreground"
              style={{ textAlign: "right" }}
            >
              بيانات تجريبية:
            </Text>
            <View className="gap-2">
              <Text
                className="text-xs text-muted"
                style={{ textAlign: "right" }}
              >
                👤 اسم المستخدم: admin
              </Text>
              <Text
                className="text-xs text-muted"
                style={{ textAlign: "right" }}
              >
                🔑 كلمة المرور: admin123
              </Text>
              <Text
                className="mt-2 text-xs text-muted"
                style={{ textAlign: "right" }}
              >
                أو استخدم: employee / emp123
              </Text>
            </View>
          </View>

          {/* Guest Access Button */}
          <Pressable
            onPress={handleGuestAccess}
            disabled={isLoading}
            style={({ pressed }) => [
              {
                borderColor: colors.primary,
                borderWidth: 1,
                borderRadius: 8,
                padding: 14,
                alignItems: "center",
                opacity: pressed || isLoading ? 0.7 : 1,
              },
            ]}
          >
            <Text
              className="text-base font-semibold"
              style={{ color: colors.primary, textAlign: "center" }}
            >
              المتابعة كزائر
            </Text>
          </Pressable>

          {/* Footer */}
          <View className="mt-12 items-center">
            <Text
              className="text-xs text-muted"
              style={{ textAlign: "center" }}
            >
              بالمتابعة، أنت توافق على سياستنا
            </Text>
          </View>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}

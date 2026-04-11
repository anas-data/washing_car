import { Tabs } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { View } from "react-native";

import { HapticTab } from "@/components/haptic-tab";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { Platform } from "react-native";
import { useColors } from "@/hooks/use-colors";
import { NotificationBadge } from "@/components/notification-badge";
import { RouteGuard } from "@/components/route-guard";

export default function TabLayout() {
  // Route guard is applied at the component level to protect all tabs
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const bottomPadding = Platform.OS === "web" ? 12 : Math.max(insets.bottom, 8);
  const tabBarHeight = 56 + bottomPadding;

  return (
    <RouteGuard requireAuth={true}>
      <Tabs
        screenOptions={{
          tabBarActiveTintColor: colors.tint,
          headerShown: false,
          tabBarButton: HapticTab,
          tabBarStyle: {
            paddingTop: 8,
            paddingBottom: bottomPadding,
            height: tabBarHeight,
            backgroundColor: colors.background,
            borderTopColor: colors.border,
            borderTopWidth: 0.5,
          },
        }}
      >
        <Tabs.Screen
          name="index"
          options={{
            title: "Home",
            tabBarIcon: ({ color }) => <IconSymbol size={28} name="house.fill" color={color} />,
          }}
        />
        <Tabs.Screen
          name="../notifications"
          options={{
            title: "Notifications",
            tabBarIcon: ({ color }) => (
              <View style={{ position: "relative" }}>
                <IconSymbol size={28} name="bell.fill" color={color} />
                <NotificationBadge />
              </View>
            ),
          }}
        />
      </Tabs>
    </RouteGuard>
  );
}

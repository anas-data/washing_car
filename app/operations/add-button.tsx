import { Pressable, Text } from "react-native";
import { useRouter } from "expo-router";
import { useColors } from "@/hooks/use-colors";
import * as Haptics from "expo-haptics";

export function AddOperationButton() {
  const colors = useColors();
  const router = useRouter();

  return (
    <Pressable
      onPress={() => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        router.push("/operations/new");
      }}
      style={({ pressed }) => [
        {
          backgroundColor: colors.primary,
          paddingHorizontal: 16,
          paddingVertical: 10,
          borderRadius: 8,
          marginLeft: 8,
          opacity: pressed ? 0.7 : 1,
        },
      ]}
    >
      <Text
        style={{
          color: "#ffffff",
          fontSize: 14,
          fontWeight: "600",
        }}
      >
        ➕ جديدة
      </Text>
    </Pressable>
  );
}

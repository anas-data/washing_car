import { ScrollView, Text, View, Pressable, TextInput, FlatList, I18nManager } from "react-native";
import { useEffect, useState } from "react";
import { ScreenContainer } from "@/components/screen-container";
import { useColors } from "@/hooks/use-colors";
import { trpc } from "@/lib/trpc";
import { useRouter } from "expo-router";
import * as Haptics from "expo-haptics";

I18nManager.forceRTL(true);

interface Part {
  id: number;
  code: string;
  name: string;
  category: string;
  quantityAvailable: number;
  quantityRequired: number;
  alertThreshold: number;
  unit: string;
  cost: string;
}

export default function InventoryScreen() {
  const colors = useColors();
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [filteredParts, setFilteredParts] = useState<Part[]>([]);

  const partsQuery = trpc.parts.list.useQuery();
  const lowStockQuery = trpc.parts.getLowStock.useQuery();

  useEffect(() => {
    if (!partsQuery.data) return;

    let filtered = partsQuery.data;

    // Filter by search query
    if (searchQuery.trim()) {
      filtered = filtered.filter(
        (part: any) =>
          part.name.includes(searchQuery) ||
          part.code.includes(searchQuery) ||
          part.description?.includes(searchQuery)
      );
    }

    // Filter by category
    if (selectedCategory) {
      filtered = filtered.filter((part: any) => part.category === selectedCategory);
    }

    setFilteredParts(filtered);
  }, [partsQuery.data, searchQuery, selectedCategory]);

  const categories = Array.from(
    new Set((partsQuery.data || []).map((p: any) => p.category))
  ) as string[];

  const getStockStatus = (part: Part) => {
    if (part.quantityAvailable <= part.alertThreshold) {
      return { status: "low", color: colors.error, label: "حد تنبيه" };
    }
    if (part.quantityAvailable < part.quantityRequired) {
      return { status: "warning", color: colors.warning, label: "ناقص" };
    }
    return { status: "good", color: colors.success, label: "متوفر" };
  };

  const renderPartItem = ({ item }: { item: Part }) => {
    const stockStatus = getStockStatus(item);

    return (
      <Pressable
        onPress={() => {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          router.push({
            pathname: "/inventory/[id]",
            params: { id: item.id },
          } as any);
        }}
        style={({ pressed }) => [
          {
            backgroundColor: colors.surface,
            borderRadius: 12,
            padding: 12,
            marginHorizontal: 16,
            marginVertical: 6,
            borderLeftWidth: 4,
            borderLeftColor: stockStatus.color,
            opacity: pressed ? 0.7 : 1,
          },
        ]}
      >
        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "flex-start",
            marginBottom: 8,
          }}
        >
          <View style={{ flex: 1 }}>
            <Text
              style={{
                fontSize: 14,
                fontWeight: "600",
                color: colors.foreground,
              }}
            >
              {item.name}
            </Text>
            <Text
              style={{
                fontSize: 12,
                color: colors.muted,
                marginTop: 2,
              }}
            >
              الكود: {item.code}
            </Text>
          </View>
          <View
            style={{
              backgroundColor: stockStatus.color,
              paddingHorizontal: 8,
              paddingVertical: 4,
              borderRadius: 6,
            }}
          >
            <Text
              style={{
                fontSize: 11,
                fontWeight: "600",
                color: "#ffffff",
              }}
            >
              {stockStatus.label}
            </Text>
          </View>
        </View>

        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
            marginBottom: 8,
          }}
        >
          <View>
            <Text
              style={{
                fontSize: 11,
                color: colors.muted,
              }}
            >
              الكمية المتوفرة
            </Text>
            <Text
              style={{
                fontSize: 16,
                fontWeight: "700",
                color: colors.foreground,
              }}
            >
              {item.quantityAvailable} {item.unit}
            </Text>
          </View>
          <View>
            <Text
              style={{
                fontSize: 11,
                color: colors.muted,
              }}
            >
              المطلوبة
            </Text>
            <Text
              style={{
                fontSize: 16,
                fontWeight: "700",
                color: colors.foreground,
              }}
            >
              {item.quantityRequired} {item.unit}
            </Text>
          </View>
          <View>
            <Text
              style={{
                fontSize: 11,
                color: colors.muted,
              }}
            >
              حد التنبيه
            </Text>
            <Text
              style={{
                fontSize: 16,
                fontWeight: "700",
                color: colors.foreground,
              }}
            >
              {item.alertThreshold} {item.unit}
            </Text>
          </View>
        </View>

        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
          }}
        >
          <Text
            style={{
              fontSize: 12,
              color: colors.muted,
            }}
          >
            {item.category}
          </Text>
          <Text
            style={{
              fontSize: 12,
              fontWeight: "600",
              color: colors.primary,
            }}
          >
            {item.cost} ريال
          </Text>
        </View>
      </Pressable>
    );
  };

  return (
    <ScreenContainer className="bg-background">
      <View style={{ flex: 1 }}>
        {/* Header */}
        <View style={{ paddingHorizontal: 16, paddingTop: 16, paddingBottom: 12 }}>
          <Text
            style={{
              fontSize: 24,
              fontWeight: "700",
              color: colors.foreground,
              marginBottom: 16,
            }}
          >
            إدارة المخزون
          </Text>

          {/* Search Bar */}
          <View
            style={{
              backgroundColor: colors.surface,
              borderRadius: 10,
              paddingHorizontal: 12,
              paddingVertical: 8,
              borderWidth: 1,
              borderColor: colors.border,
              marginBottom: 12,
              flexDirection: "row",
              alignItems: "center",
            }}
          >
            <Text style={{ fontSize: 18, marginRight: 8 }}>🔍</Text>
            <TextInput
              placeholder="ابحث عن قطعة..."
              placeholderTextColor={colors.muted}
              value={searchQuery}
              onChangeText={setSearchQuery}
              style={{
                flex: 1,
                color: colors.foreground,
                fontSize: 14,
              }}
            />
          </View>

          {/* Category Filter */}
          {categories.length > 0 && (
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              style={{ marginBottom: 12 }}
            >
              <Pressable
                onPress={() => setSelectedCategory(null)}
                style={({ pressed }) => [
                  {
                    paddingHorizontal: 12,
                    paddingVertical: 6,
                    borderRadius: 20,
                    marginRight: 8,
                    backgroundColor:
                      selectedCategory === null ? colors.primary : colors.surface,
                    opacity: pressed ? 0.7 : 1,
                  },
                ]}
              >
                <Text
                  style={{
                    color: selectedCategory === null ? "#ffffff" : colors.foreground,
                    fontSize: 12,
                    fontWeight: "600",
                  }}
                >
                  الكل
                </Text>
              </Pressable>

              {categories.map((category) => (
                <Pressable
                  key={category}
                  onPress={() => setSelectedCategory(category)}
                  style={({ pressed }) => [
                    {
                      paddingHorizontal: 12,
                      paddingVertical: 6,
                      borderRadius: 20,
                      marginRight: 8,
                      backgroundColor:
                        selectedCategory === category ? colors.primary : colors.surface,
                      opacity: pressed ? 0.7 : 1,
                    },
                  ]}
                >
                  <Text
                    style={{
                      color:
                        selectedCategory === category ? "#ffffff" : colors.foreground,
                      fontSize: 12,
                      fontWeight: "600",
                    }}
                  >
                    {category}
                  </Text>
                </Pressable>
              ))}
            </ScrollView>
          )}

          {/* Stats */}
          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              backgroundColor: colors.surface,
              borderRadius: 10,
              padding: 12,
              borderWidth: 1,
              borderColor: colors.border,
            }}
          >
            <View>
              <Text
                style={{
                  fontSize: 11,
                  color: colors.muted,
                }}
              >
                إجمالي القطع
              </Text>
              <Text
                style={{
                  fontSize: 16,
                  fontWeight: "700",
                  color: colors.foreground,
                }}
              >
                {partsQuery.data?.length || 0}
              </Text>
            </View>
            <View>
              <Text
                style={{
                  fontSize: 11,
                  color: colors.muted,
                }}
              >
                قطع بحد تنبيه
              </Text>
              <Text
                style={{
                  fontSize: 16,
                  fontWeight: "700",
                  color: colors.error,
                }}
              >
                {lowStockQuery.data?.length || 0}
              </Text>
            </View>
            <View>
              <Text
                style={{
                  fontSize: 11,
                  color: colors.muted,
                }}
              >
                النتائج
              </Text>
              <Text
                style={{
                  fontSize: 16,
                  fontWeight: "700",
                  color: colors.foreground,
                }}
              >
                {filteredParts.length}
              </Text>
            </View>
          </View>
        </View>

        {/* Parts List */}
        {filteredParts.length > 0 ? (
          <FlatList
            data={filteredParts}
            renderItem={renderPartItem}
            keyExtractor={(item) => item.id.toString()}
            contentContainerStyle={{ paddingBottom: 32 }}
            scrollEnabled={true}
          />
        ) : (
          <View
            style={{
              flex: 1,
              justifyContent: "center",
              alignItems: "center",
              paddingHorizontal: 32,
            }}
          >
            <Text
              style={{
                fontSize: 48,
                marginBottom: 16,
              }}
            >
              📦
            </Text>
            <Text
              style={{
                fontSize: 16,
                fontWeight: "600",
                color: colors.foreground,
                marginBottom: 8,
                textAlign: "center",
              }}
            >
              لا توجد قطع
            </Text>
            <Text
              style={{
                fontSize: 14,
                color: colors.muted,
                textAlign: "center",
              }}
            >
              {searchQuery || selectedCategory
                ? "لم نجد قطعاً تطابق معايير البحث"
                : "لا توجد قطع في المخزون"}
            </Text>
          </View>
        )}
      </View>
    </ScreenContainer>
  );
}

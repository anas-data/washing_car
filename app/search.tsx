import { ScrollView, Text, View, TextInput, FlatList, TouchableOpacity } from "react-native";
import { ScreenContainer } from "@/components/screen-container";
import { useColors } from "@/hooks/use-colors";
import { useState, useEffect } from "react";
import { searchService, type SearchResult } from "@/lib/search-service";
import * as Haptics from "expo-haptics";

export default function SearchScreen() {
  const colors = useColors();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedType, setSelectedType] = useState<"all" | "part" | "vehicle" | "operation" | "message" | "note">("all");
  const [suggestions, setSuggestions] = useState<string[]>([]);

  useEffect(() => {
    if (query.length > 2) {
      performSearch();
      getSuggestions();
    } else {
      setResults([]);
      setSuggestions([]);
    }
  }, [query, selectedType]);

  const performSearch = async () => {
    setLoading(true);
    try {
      const searchResults = await searchService.search({
        query,
        type: selectedType,
        limit: 50,
      });
      setResults(searchResults);
      await searchService.saveSearch(query);
    } catch (error) {
      console.error("Search error:", error);
    } finally {
      setLoading(false);
    }
  };

  const getSuggestions = async () => {
    try {
      const sug = await searchService.getSuggestions(query);
      setSuggestions(sug);
    } catch (error) {
      console.error("Suggestions error:", error);
    }
  };

  const getTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      part: "قطعة",
      vehicle: "مركبة",
      operation: "عملية",
      message: "رسالة",
      note: "ملاحظة",
    };
    return labels[type] || type;
  };

  const getTypeColor = (type: string) => {
    const colorMap: Record<string, string> = {
      part: colors.primary,
      vehicle: colors.warning,
      operation: colors.primary,
      message: colors.success,
      note: colors.error,
    };
    return colorMap[type] || colors.primary;
  };

  const typeFilters = [
    { id: "all", label: "الكل" },
    { id: "part", label: "أجزاء" },
    { id: "vehicle", label: "مركبات" },
    { id: "operation", label: "عمليات" },
    { id: "message", label: "رسائل" },
    { id: "note", label: "ملاحظات" },
  ] as const;

  return (
    <ScreenContainer className="p-4">
      <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
        <View className="gap-4">
          {/* Header */}
          <View className="gap-2">
            <Text className="text-2xl font-bold text-foreground">بحث متقدم</Text>
            <Text className="text-sm text-muted">ابحث عن أي شيء في التطبيق</Text>
          </View>

          {/* Search Input */}
          <View className="gap-2">
            <TextInput
              placeholder="ابحث هنا..."
              placeholderTextColor={colors.muted}
              value={query}
              onChangeText={setQuery}
              className="rounded-lg border border-border bg-surface p-3 text-foreground"
            />

            {/* Suggestions */}
            {suggestions.length > 0 && (
              <View className="gap-2">
                <Text className="text-xs font-semibold text-muted">اقتراحات</Text>
                <View className="flex-row flex-wrap gap-2">
                  {suggestions.map((sug) => (
                    <TouchableOpacity
                      key={sug}
                      onPress={() => setQuery(sug)}
                      className="rounded-full bg-surface px-3 py-1"
                    >
                      <Text className="text-xs text-primary">{sug}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            )}
          </View>

          {/* Type Filters */}
          <View className="gap-2">
            <Text className="text-xs font-semibold text-muted">النوع</Text>
            <View className="flex-row flex-wrap gap-2">
              {typeFilters.map((filter) => (
                <TouchableOpacity
                  key={filter.id}
                  onPress={() => {
                    setSelectedType(filter.id);
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  }}
                  className="rounded-full px-3 py-2"
                  style={{
                    backgroundColor:
                      selectedType === filter.id ? colors.primary : colors.surface,
                    borderWidth: selectedType === filter.id ? 0 : 1,
                    borderColor: colors.border,
                  }}
                >
                  <Text
                    className={selectedType === filter.id ? "text-white" : "text-foreground"}
                    style={{ fontSize: 12 }}
                  >
                    {filter.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Results */}
          <View className="gap-2">
            <Text className="text-sm font-semibold text-muted">
              {loading ? "جاري البحث..." : `${results.length} نتيجة`}
            </Text>

            {results.length === 0 && query.length > 2 && !loading && (
              <View className="rounded-lg border border-border bg-surface p-4">
                <Text className="text-center text-muted">لم يتم العثور على نتائج</Text>
              </View>
            )}

            <FlatList
              scrollEnabled={false}
              data={results}
              keyExtractor={(item) => `${item.type}-${item.id}`}
              renderItem={({ item }) => (
                <View className="mb-3 rounded-lg border border-border bg-surface p-3">
                  <View className="mb-2 flex-row items-start justify-between">
                    <View className="flex-1">
                      <Text className="font-semibold text-foreground">{item.title}</Text>
                      {item.subtitle && (
                        <Text className="text-xs text-muted">{item.subtitle}</Text>
                      )}
                    </View>
                    <View
                      className="rounded px-2 py-1"
                      style={{ backgroundColor: getTypeColor(item.type) + "20" }}
                    >
                      <Text
                        className="text-xs font-semibold"
                        style={{ color: getTypeColor(item.type) }}
                      >
                        {getTypeLabel(item.type)}
                      </Text>
                    </View>
                  </View>

                  {item.description && (
                    <Text className="text-xs text-muted" numberOfLines={2}>
                      {item.description}
                    </Text>
                  )}

                  {item.metadata && (
                    <View className="mt-2 flex-row flex-wrap gap-2">
                      {Object.entries(item.metadata).map(([key, value]) => (
                        <Text key={key} className="text-xs text-muted">
                          {key}: {String(value)}
                        </Text>
                      ))}
                    </View>
                  )}
                </View>
              )}
            />
          </View>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}

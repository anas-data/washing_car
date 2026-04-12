import { View, Text, FlatList, Pressable, TextInput, ScrollView, Modal } from "react-native";
import { useState, useEffect } from "react";
import { ScreenContainer } from "@/components/screen-container";
import { useColors } from "@/hooks/use-colors";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/hooks/use-auth";
import { formatDistanceToNow } from "date-fns";
import { ar } from "date-fns/locale";
import * as Haptics from "expo-haptics";

interface Note {
  id: number;
  title: string;
  content: string;
  category: "general" | "warning" | "important" | "todo";
  priority: "low" | "medium" | "high";
  dueDate?: Date | null;
  isCompleted: boolean;
  completedAt?: Date | null;
  relatedEntityType?: string | null;
  relatedEntityId?: number | null;
  createdById: number;
  createdAt: Date;
  updatedAt: Date;
}

const categoryLabels: Record<string, string> = {
  general: "عام",
  warning: "تحذير",
  important: "مهم",
  todo: "مهمة",
};

const priorityLabels: Record<string, string> = {
  low: "منخفض",
  medium: "متوسط",
  high: "مرتفع",
};

const categoryColors: Record<string, string> = {
  general: "bg-blue-500",
  warning: "bg-yellow-500",
  important: "bg-red-500",
  todo: "bg-purple-500",
};

export default function NotesScreen() {
  const colors = useColors();
  const { user } = useAuth();
  const [showModal, setShowModal] = useState(false);
  const [editingNote, setEditingNote] = useState<Note | null>(null);
  const [filterCategory, setFilterCategory] = useState<string | null>(null);
  const [filterPriority, setFilterPriority] = useState<string | null>(null);
  const [showCompleted, setShowCompleted] = useState(false);

  // Form state
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [category, setCategory] = useState<"general" | "warning" | "important" | "todo">("general");
  const [priority, setPriority] = useState<"low" | "medium" | "high">("medium");
  const [dueDate, setDueDate] = useState<Date | null>(null);

  // Queries
  const notesQuery = trpc.notes.list.useQuery();

  // Mutations
  const createNoteMutation = trpc.notes.create.useMutation({
    onSuccess: () => {
      resetForm();
      setShowModal(false);
      notesQuery.refetch();
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    },
  });

  const updateNoteMutation = trpc.notes.update.useMutation({
    onSuccess: () => {
      resetForm();
      setShowModal(false);
      notesQuery.refetch();
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    },
  });

  const deleteNoteMutation = trpc.notes.delete.useMutation({
    onSuccess: () => {
      notesQuery.refetch();
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    },
  });

  const resetForm = () => {
    setTitle("");
    setContent("");
    setCategory("general");
    setPriority("medium");
      setDueDate(null);
    setEditingNote(null);
  };

  const handleSave = async () => {
    if (!title.trim() || !content.trim()) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      return;
    }

    try {
      if (editingNote) {
        await updateNoteMutation.mutateAsync({
          id: editingNote.id,
          data: {
            title: title.trim(),
            content: content.trim(),
            category,
            priority,
            dueDate: dueDate || undefined,
          },
        });
      } else {
        await createNoteMutation.mutateAsync({
          title: title.trim(),
          content: content.trim(),
          category,
          priority,
          dueDate: dueDate || undefined,
        });
      }
    } catch (error) {
      console.error("خطأ في حفظ الملاحظة:", error);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    }
  };

  const handleEdit = (note: Note) => {
    setEditingNote(note);
    setTitle(note.title);
    setContent(note.content);
    setCategory(note.category);
    setPriority(note.priority);
    setDueDate(note.dueDate ? new Date(note.dueDate) : null);
    setShowModal(true);
  };

  const handleDelete = async (noteId: number) => {
    try {
      await deleteNoteMutation.mutateAsync({ id: noteId });
    } catch (error) {
      console.error("خطأ في حذف الملاحظة:", error);
    }
  };

  const filteredNotes = (notesQuery.data || []).filter((note) => {
    if (!showCompleted && note.isCompleted) return false;
    if (filterCategory && note.category !== filterCategory) return false;
    if (filterPriority && note.priority !== filterPriority) return false;
    return true;
  });

  return (
    <ScreenContainer className="flex-1 bg-background">
      <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
        {/* Header */}
        <View className="p-4 border-b border-border">
          <View className="flex-row items-center justify-between mb-4">
            <Text className="text-2xl font-bold text-foreground">الملاحظات</Text>
            {(user as any)?.role === "admin" && (
              <Pressable
                onPress={() => {
                  resetForm();
                  setShowModal(true);
                }}
                style={({ pressed }) => [
                  {
                    opacity: pressed ? 0.7 : 1,
                    backgroundColor: colors.primary,
                    paddingHorizontal: 16,
                    paddingVertical: 8,
                    borderRadius: 6,
                  },
                ]}
              >
                <Text className="text-background font-semibold">+ جديدة</Text>
              </Pressable>
            )}
          </View>

          {/* Filters */}
          <View className="flex-row gap-2 flex-wrap">
            <Pressable
              onPress={() => setShowCompleted(!showCompleted)}
              style={({ pressed }) => [
                {
                  opacity: pressed ? 0.7 : 1,
                  backgroundColor: showCompleted ? colors.primary : colors.surface,
                  borderColor: colors.border,
                  borderWidth: 1,
                  paddingHorizontal: 12,
                  paddingVertical: 6,
                  borderRadius: 16,
                },
              ]}
            >
              <Text
                className={`text-sm font-medium ${
                  showCompleted ? "text-background" : "text-foreground"
                }`}
              >
                مكتملة
              </Text>
            </Pressable>

            {["low", "medium", "high"].map((p) => (
              <Pressable
                key={p}
                onPress={() => setFilterPriority(filterPriority === p ? null : p)}
                style={({ pressed }) => [
                  {
                    opacity: pressed ? 0.7 : 1,
                    backgroundColor: filterPriority === p ? colors.primary : colors.surface,
                    borderColor: colors.border,
                    borderWidth: 1,
                    paddingHorizontal: 12,
                    paddingVertical: 6,
                    borderRadius: 16,
                  },
                ]}
              >
                <Text
                  className={`text-sm font-medium ${
                    filterPriority === p ? "text-background" : "text-foreground"
                  }`}
                >
                  {priorityLabels[p]}
                </Text>
              </Pressable>
            ))}
          </View>
        </View>

        {/* Notes List */}
        <FlatList
          scrollEnabled={false}
          data={filteredNotes}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={{ padding: 12, gap: 8 }}
          renderItem={({ item: note }) => (
            <Pressable
              onPress={() => handleEdit(note)}
              style={({ pressed }) => [
                {
                  opacity: pressed ? 0.7 : 1,
                },
              ]}
            >
              <View className="bg-surface border border-border rounded-lg p-4">
                <View className="flex-row items-start justify-between mb-2">
                  <View className="flex-1">
                    <View className="flex-row items-center gap-2 mb-1">
                      <Text
                        className={`text-xs font-bold text-white px-2 py-1 rounded ${
                          categoryColors[note.category]
                        }`}
                      >
                        {categoryLabels[note.category]}
                      </Text>
                      <Text className="text-xs font-semibold text-muted">
                        {priorityLabels[note.priority]}
                      </Text>
                    </View>
                    <Text
                      className={`text-base font-semibold ${
                        note.isCompleted ? "text-muted line-through" : "text-foreground"
                      }`}
                    >
                      {note.title}
                    </Text>
                  </View>
                  {(user as any)?.role === "admin" && (
                    <Pressable
                      onPress={() => handleDelete(note.id)}
                      style={({ pressed }) => [{ opacity: pressed ? 0.6 : 1 }]}
                    >
                      <Text className="text-error font-bold text-lg">×</Text>
                    </Pressable>
                  )}
                </View>

                <Text className="text-sm text-muted mb-2 line-clamp-2">{note.content}</Text>

                {note.dueDate && (
                  <Text className="text-xs text-muted">
                    الموعد:{" "}
                    {formatDistanceToNow(new Date(note.dueDate), {
                      locale: ar,
                      addSuffix: true,
                    })}
                  </Text>
                )}
              </View>
            </Pressable>
          )}
          ListEmptyComponent={
            <View className="flex-1 items-center justify-center py-12">
              <Text className="text-muted text-center">لا توجد ملاحظات</Text>
            </View>
          }
        />
      </ScrollView>

      {/* Create/Edit Modal */}
      <Modal
        visible={showModal}
        animationType="slide"
        transparent
        onRequestClose={() => {
          setShowModal(false);
          resetForm();
        }}
      >
        <ScreenContainer className="flex-1 bg-background">
          <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
            {/* Modal Header */}
            <View className="flex-row items-center justify-between p-4 border-b border-border">
              <Pressable
                onPress={() => {
                  setShowModal(false);
                  resetForm();
                }}
                style={({ pressed }) => [{ opacity: pressed ? 0.6 : 1 }]}
              >
                <Text className="text-lg font-semibold text-primary">إغلاق</Text>
              </Pressable>
              <Text className="text-lg font-bold text-foreground">
                {editingNote ? "تعديل الملاحظة" : "ملاحظة جديدة"}
              </Text>
            </View>

            {/* Form */}
            <View className="p-4 gap-4">
              {/* Title */}
              <View>
                <Text className="text-sm font-semibold text-foreground mb-2">العنوان</Text>
                <TextInput
                  value={title}
                  onChangeText={setTitle}
                  placeholder="أدخل عنوان الملاحظة"
                  placeholderTextColor={colors.muted}
                  className="bg-surface text-foreground p-3 rounded-lg border border-border"
                  maxLength={255}
                />
              </View>

              {/* Content */}
              <View>
                <Text className="text-sm font-semibold text-foreground mb-2">المحتوى</Text>
                <TextInput
                  value={content}
                  onChangeText={setContent}
                  placeholder="أدخل محتوى الملاحظة"
                  placeholderTextColor={colors.muted}
                  className="bg-surface text-foreground p-3 rounded-lg border border-border"
                  multiline
                  numberOfLines={5}
                  maxLength={1000}
                />
              </View>

              {/* Category */}
              <View>
                <Text className="text-sm font-semibold text-foreground mb-2">الفئة</Text>
                <View className="flex-row gap-2 flex-wrap">
                  {(["general", "warning", "important", "todo"] as const).map((cat) => (
                    <Pressable
                      key={cat}
                      onPress={() => setCategory(cat)}
                      style={({ pressed }) => [
                        {
                          opacity: pressed ? 0.7 : 1,
                          backgroundColor:
                            category === cat ? colors.primary : colors.surface,
                          borderColor: colors.border,
                          borderWidth: 1,
                          paddingHorizontal: 12,
                          paddingVertical: 8,
                          borderRadius: 6,
                        },
                      ]}
                    >
                      <Text
                        className={`text-sm font-medium ${
                          category === cat ? "text-background" : "text-foreground"
                        }`}
                      >
                        {categoryLabels[cat]}
                      </Text>
                    </Pressable>
                  ))}
                </View>
              </View>

              {/* Priority */}
              <View>
                <Text className="text-sm font-semibold text-foreground mb-2">الأولوية</Text>
                <View className="flex-row gap-2">
                  {(["low", "medium", "high"] as const).map((p) => (
                    <Pressable
                      key={p}
                      onPress={() => setPriority(p)}
                      style={({ pressed }) => [
                        {
                          opacity: pressed ? 0.7 : 1,
                          backgroundColor:
                            priority === p ? colors.primary : colors.surface,
                          borderColor: colors.border,
                          borderWidth: 1,
                          paddingHorizontal: 12,
                          paddingVertical: 8,
                          borderRadius: 6,
                          flex: 1,
                        },
                      ]}
                    >
                      <Text
                        className={`text-sm font-medium text-center ${
                          priority === p ? "text-background" : "text-foreground"
                        }`}
                      >
                        {priorityLabels[p]}
                      </Text>
                    </Pressable>
                  ))}
                </View>
              </View>

              {/* Save Button */}
              <Pressable
                onPress={handleSave}
                disabled={createNoteMutation.isPending || updateNoteMutation.isPending}
                style={({ pressed }) => [
                  {
                    opacity:
                      createNoteMutation.isPending || updateNoteMutation.isPending
                        ? 0.5
                        : pressed
                          ? 0.8
                          : 1,
                    backgroundColor: colors.primary,
                    paddingVertical: 12,
                    borderRadius: 8,
                    marginTop: 8,
                  },
                ]}
              >
                <Text className="text-background font-bold text-center">
                  {editingNote ? "تحديث" : "حفظ"}
                </Text>
              </Pressable>
            </View>
          </ScrollView>
        </ScreenContainer>
      </Modal>
    </ScreenContainer>
  );
}

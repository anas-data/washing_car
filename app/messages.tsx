import { View, Text, FlatList, Pressable, TextInput, ScrollView } from "react-native";
import { useState, useEffect } from "react";
import { ScreenContainer } from "@/components/screen-container";
import { useColors } from "@/hooks/use-colors";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/hooks/use-auth";
import { formatDistanceToNow } from "date-fns";
import { ar } from "date-fns/locale";
import * as Haptics from "expo-haptics";

interface ConversationWithUser {
  id: number;
  participantOneId: number;
  participantTwoId: number;
  subject?: string;
  lastMessageDate?: Date;
  isActive: boolean;
  otherUser?: {
    id: number;
    name?: string;
    email?: string;
  };
}

export default function MessagesScreen() {
  const colors = useColors();
  const { user } = useAuth();
  const [selectedConversation, setSelectedConversation] = useState<number | null>(null);
  const [messageText, setMessageText] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  // Queries
  const conversationsQuery = trpc.messages.getConversations.useQuery();
  const messagesQuery = trpc.messages.getConversationMessages.useQuery(
    { conversationId: selectedConversation || 0 },
    { enabled: !!selectedConversation }
  );
  const unreadCountQuery = trpc.messages.getUnreadCount.useQuery();

  // Mutations
  const sendMessageMutation = trpc.messages.sendMessage.useMutation({
    onSuccess: () => {
      setMessageText("");
      messagesQuery.refetch();
      conversationsQuery.refetch();
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    },
  });

  const markAsReadMutation = trpc.messages.markAsRead.useMutation();

  const handleSendMessage = async () => {
    if (!messageText.trim() || !selectedConversation) return;

    try {
      await sendMessageMutation.mutateAsync({
        conversationId: selectedConversation,
        content: messageText.trim(),
      });
    } catch (error) {
      console.error("خطأ في إرسال الرسالة:", error);
    }
  };

  const handleMarkAsRead = async (messageId: number) => {
    try {
      await markAsReadMutation.mutateAsync({ messageId });
    } catch (error) {
      console.error("خطأ في وضع علامة مقروءة:", error);
    }
  };

  const filteredConversations = conversationsQuery.data?.filter((conv) =>
    conv.subject?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    conv.participantOneId === user?.id
      ? `المستخدم ${conv.participantTwoId}`
      : `المستخدم ${conv.participantOneId}`.includes(searchQuery)
  ) || [];

  if (selectedConversation) {
    return (
      <ScreenContainer className="bg-background flex-1">
        <View className="flex-1 flex-col">
          {/* Header */}
          <View className="flex-row items-center justify-between p-4 border-b border-border">
            <Pressable
              onPress={() => {
                setSelectedConversation(null);
                setMessageText("");
              }}
              style={({ pressed }) => [{ opacity: pressed ? 0.6 : 1 }]}
            >
              <Text className="text-lg font-semibold text-primary">← رجوع</Text>
            </Pressable>
            <Text className="text-lg font-bold text-foreground">
              {conversationsQuery.data?.find((c) => c.id === selectedConversation)?.subject || "محادثة"}
            </Text>
          </View>

          {/* Messages List */}
          <FlatList
            data={messagesQuery.data || []}
            keyExtractor={(item) => item.id.toString()}
            contentContainerStyle={{ padding: 12, gap: 8 }}
            renderItem={({ item: message }) => {
              const isOwn = message.senderId === user?.id;
              return (
                <Pressable
                  onPress={() => !message.isRead && handleMarkAsRead(message.id)}
                  style={({ pressed }) => [
                    {
                      alignSelf: isOwn ? "flex-end" : "flex-start",
                      maxWidth: "80%",
                      opacity: pressed ? 0.8 : 1,
                    },
                  ]}
                >
                  <View
                    className={`rounded-lg p-3 ${
                      isOwn ? "bg-primary" : "bg-surface border border-border"
                    }`}
                  >
                    <Text
                      className={`text-sm ${isOwn ? "text-background" : "text-foreground"}`}
                    >
                      {message.content}
                    </Text>
                    <Text
                      className={`text-xs mt-1 ${
                        isOwn ? "text-background opacity-70" : "text-muted"
                      }`}
                    >
                      {message.createdAt
                        ? formatDistanceToNow(new Date(message.createdAt), {
                            locale: ar,
                            addSuffix: true,
                          })
                        : ""}
                    </Text>
                  </View>
                </Pressable>
              );
            }}
            ListEmptyComponent={
              <View className="flex-1 items-center justify-center py-8">
                <Text className="text-muted">لا توجد رسائل</Text>
              </View>
            }
          />

          {/* Message Input */}
          <View className="flex-row items-center gap-2 p-4 border-t border-border bg-surface">
            <TextInput
              value={messageText}
              onChangeText={setMessageText}
              placeholder="اكتب رسالتك..."
              placeholderTextColor={colors.muted}
              className="flex-1 bg-background text-foreground p-3 rounded-lg border border-border"
              multiline
              maxLength={500}
            />
            <Pressable
              onPress={handleSendMessage}
              disabled={!messageText.trim() || sendMessageMutation.isPending}
              style={({ pressed }) => [
                {
                  opacity: !messageText.trim() || sendMessageMutation.isPending ? 0.5 : pressed ? 0.8 : 1,
                  padding: 12,
                  backgroundColor: colors.primary,
                  borderRadius: 8,
                },
              ]}
            >
              <Text className="text-background font-semibold">إرسال</Text>
            </Pressable>
          </View>
        </View>
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer className="flex-1 bg-background">
      <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
        {/* Header */}
        <View className="p-4 border-b border-border">
          <View className="flex-row items-center justify-between mb-4">
            <Text className="text-2xl font-bold text-foreground">المحادثات</Text>
            {unreadCountQuery.data ? (
              <View className="bg-error rounded-full px-3 py-1">
                <Text className="text-background text-xs font-bold">
                  {unreadCountQuery.data} جديد
                </Text>
              </View>
            ) : null}
          </View>

          {/* Search */}
          <TextInput
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholder="ابحث عن محادثة..."
            placeholderTextColor={colors.muted}
            className="bg-surface text-foreground p-3 rounded-lg border border-border"
          />
        </View>

        {/* Conversations List */}
        <FlatList
          scrollEnabled={false}
          data={filteredConversations}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={{ padding: 12, gap: 8 }}
          renderItem={({ item: conversation }) => (
            <Pressable
              onPress={() => setSelectedConversation(conversation.id)}
              style={({ pressed }) => [
                {
                  opacity: pressed ? 0.7 : 1,
                },
              ]}
            >
              <View className="bg-surface border border-border rounded-lg p-4">
                <View className="flex-row items-center justify-between mb-2">
                  <Text className="text-base font-semibold text-foreground flex-1">
                    {conversation.subject || "محادثة جديدة"}
                  </Text>
                  {conversation.lastMessageDate && (
                    <Text className="text-xs text-muted">
                      {formatDistanceToNow(new Date(conversation.lastMessageDate), {
                        locale: ar,
                      })}
                    </Text>
                  )}
                </View>
                <Text className="text-sm text-muted">
                  {conversation.isActive ? "نشطة" : "غير نشطة"}
                </Text>
              </View>
            </Pressable>
          )}
          ListEmptyComponent={
            <View className="flex-1 items-center justify-center py-12">
              <Text className="text-muted text-center">لا توجد محادثات</Text>
            </View>
          }
        />
      </ScrollView>
    </ScreenContainer>
  );
}

import {
  View,
  Text,
  FlatList,
  TextInput,
  Pressable,
  ScrollView,
} from "react-native";
import { useState } from "react";
import { useColors } from "@/hooks/use-colors";
import * as Haptics from "expo-haptics";

export interface ApprovalComment {
  id: number;
  authorName: string;
  authorRole: string;
  content: string;
  createdAt: string;
  isSystemMessage?: boolean;
}

interface ApprovalCommentsProps {
  comments: ApprovalComment[];
  onAddComment?: (content: string) => void;
  loading?: boolean;
  allowComments?: boolean;
}

/**
 * Approval Comments Section Component
 *
 * Displays and allows adding comments to approvals
 */
export function ApprovalComments({
  comments,
  onAddComment,
  loading = false,
  allowComments = true,
}: ApprovalCommentsProps) {
  const colors = useColors();
  const [newComment, setNewComment] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmitComment = async () => {
    if (!newComment.trim()) return;

    setSubmitting(true);
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    if (onAddComment) {
      onAddComment(newComment);
    }

    setNewComment("");
    setSubmitting(false);
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return "الآن";
    if (diffMins < 60) return `قبل ${diffMins} دقيقة`;
    if (diffHours < 24) return `قبل ${diffHours} ساعة`;
    if (diffDays < 7) return `قبل ${diffDays} يوم`;
    return date.toLocaleDateString("ar-SA");
  };

  const renderComment = ({ item }: { item: ApprovalComment }) => {
    if (item.isSystemMessage) {
      return (
        <View
          style={{
            paddingHorizontal: 16,
            paddingVertical: 8,
            backgroundColor: colors.surface,
            marginHorizontal: 16,
            marginVertical: 6,
            borderRadius: 8,
            borderLeftWidth: 3,
            borderLeftColor: colors.primary,
          }}
        >
          <Text
            style={{
              fontSize: 12,
              color: colors.foreground,
              fontStyle: "italic",
              lineHeight: 16,
            }}
          >
            {item.content}
          </Text>
          <Text
            style={{
              fontSize: 10,
              color: colors.muted,
              marginTop: 4,
            }}
          >
            {formatTime(item.createdAt)}
          </Text>
        </View>
      );
    }

    return (
      <View
        style={{
          marginHorizontal: 16,
          marginVertical: 8,
          paddingHorizontal: 12,
          paddingVertical: 10,
          backgroundColor: colors.surface,
          borderRadius: 8,
          borderWidth: 1,
          borderColor: colors.border,
        }}
      >
        {/* Author Info */}
        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: 6,
          }}
        >
          <View>
            <Text
              style={{
                fontSize: 12,
                fontWeight: "600",
                color: colors.foreground,
              }}
            >
              {item.authorName}
            </Text>
            <Text
              style={{
                fontSize: 10,
                color: colors.muted,
              }}
            >
              {item.authorRole}
            </Text>
          </View>
          <Text
            style={{
              fontSize: 10,
              color: colors.muted,
            }}
          >
            {formatTime(item.createdAt)}
          </Text>
        </View>

        {/* Comment Content */}
        <Text
          style={{
            fontSize: 12,
            color: colors.foreground,
            lineHeight: 16,
          }}
        >
          {item.content}
        </Text>
      </View>
    );
  };

  return (
    <View style={{ paddingVertical: 12 }}>
      <Text
        style={{
          fontSize: 14,
          fontWeight: "600",
          color: colors.foreground,
          marginHorizontal: 16,
          marginBottom: 12,
        }}
      >
        التعليقات والملاحظات
      </Text>

      {/* Comments List */}
      {comments.length === 0 ? (
        <View
          style={{
            paddingHorizontal: 16,
            paddingVertical: 20,
            alignItems: "center",
          }}
        >
          <Text
            style={{
              fontSize: 12,
              color: colors.muted,
            }}
          >
            لا توجد تعليقات حتى الآن
          </Text>
        </View>
      ) : (
        <FlatList
          data={comments}
          renderItem={renderComment}
          keyExtractor={(item) => item.id.toString()}
          scrollEnabled={false}
        />
      )}

      {/* Add Comment Section */}
      {allowComments && (
        <View
          style={{
            paddingHorizontal: 16,
            paddingTop: 12,
            borderTopWidth: 1,
            borderTopColor: colors.border,
            marginTop: 12,
          }}
        >
          <View
            style={{
              flexDirection: "row",
              gap: 8,
              alignItems: "flex-end",
            }}
          >
            <TextInput
              placeholder="أضف تعليقاً..."
              placeholderTextColor={colors.muted}
              value={newComment}
              onChangeText={setNewComment}
              multiline={true}
              numberOfLines={2}
              style={{
                flex: 1,
                backgroundColor: colors.surface,
                borderRadius: 8,
                borderWidth: 1,
                borderColor: colors.border,
                paddingHorizontal: 12,
                paddingVertical: 10,
                color: colors.foreground,
                fontSize: 12,
              }}
            />
            <Pressable
              onPress={handleSubmitComment}
              disabled={!newComment.trim() || submitting || loading}
              style={({ pressed }) => [
                {
                  backgroundColor: newComment.trim()
                    ? colors.primary
                    : colors.border,
                  borderRadius: 8,
                  paddingHorizontal: 12,
                  paddingVertical: 10,
                  opacity: pressed || !newComment.trim() ? 0.7 : 1,
                },
              ]}
            >
              <Text
                style={{
                  fontSize: 16,
                  color: "#ffffff",
                }}
              >
                ➤
              </Text>
            </Pressable>
          </View>
        </View>
      )}
    </View>
  );
}

/**
 * Approval Comments Card Component
 *
 * Compact card view for displaying recent comments
 */
export function ApprovalCommentsCard({
  comments,
  maxItems = 3,
}: {
  comments: ApprovalComment[];
  maxItems?: number;
}) {
  const colors = useColors();

  const recentComments = comments.slice(0, maxItems);

  return (
    <View
      style={{
        backgroundColor: colors.surface,
        borderRadius: 12,
        padding: 12,
        marginHorizontal: 16,
        marginVertical: 12,
      }}
    >
      <Text
        style={{
          fontSize: 13,
          fontWeight: "600",
          color: colors.foreground,
          marginBottom: 8,
        }}
      >
        آخر التعليقات ({comments.length})
      </Text>

      {recentComments.length === 0 ? (
        <Text
          style={{
            fontSize: 12,
            color: colors.muted,
            textAlign: "center",
            paddingVertical: 8,
          }}
        >
          لا توجد تعليقات
        </Text>
      ) : (
        <View>
          {recentComments.map((comment, index) => (
            <View
              key={comment.id}
              style={{
                paddingBottom: index < recentComments.length - 1 ? 8 : 0,
                borderBottomWidth:
                  index < recentComments.length - 1 ? 1 : 0,
                borderBottomColor: colors.border,
              }}
            >
              <View
                style={{
                  flexDirection: "row",
                  justifyContent: "space-between",
                  alignItems: "flex-start",
                  marginBottom: 4,
                }}
              >
                <Text
                  style={{
                    fontSize: 11,
                    fontWeight: "600",
                    color: colors.foreground,
                  }}
                >
                  {comment.authorName}
                </Text>
                <Text
                  style={{
                    fontSize: 10,
                    color: colors.muted,
                  }}
                >
                  {new Date(comment.createdAt).toLocaleDateString("ar-SA")}
                </Text>
              </View>
              <Text
                style={{
                  fontSize: 11,
                  color: colors.muted,
                  lineHeight: 14,
                }}
                numberOfLines={2}
              >
                {comment.content}
              </Text>
            </View>
          ))}
        </View>
      )}
    </View>
  );
}

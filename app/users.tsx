import { ScrollView, Text, View, Pressable, TextInput, FlatList } from "react-native";
import { useState, useEffect } from "react";
import { ScreenContainer } from "@/components/screen-container";
import { useColors } from "@/hooks/use-colors";
// import { useRouter } from "expo-router";
import * as Haptics from "expo-haptics";

interface User {
  id: number;
  name: string;
  email: string;
  role: string;
  status: "active" | "inactive";
  lastSignedIn: string;
  createdAt: string;
}

/**
 * Users Management Screen
 * 
 * Displays a list of users with search, filtering, and management options
 */
export default function UsersScreen() {
  const colors = useColors();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedRole, setSelectedRole] = useState<string | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  // Mock data - replace with actual API call
  useEffect(() => {
    const mockUsers: User[] = [
      {
        id: 1,
        name: "أحمد محمد",
        email: "ahmed@example.com",
        role: "admin",
        status: "active",
        lastSignedIn: new Date(Date.now() - 1000 * 60 * 5).toISOString(),
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 30).toISOString(),
      },
      {
        id: 2,
        name: "فاطمة علي",
        email: "fatima@example.com",
        role: "employee",
        status: "active",
        lastSignedIn: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 20).toISOString(),
      },
      {
        id: 3,
        name: "محمود حسن",
        email: "mahmoud@example.com",
        role: "reviewer",
        status: "active",
        lastSignedIn: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 15).toISOString(),
      },
      {
        id: 4,
        name: "سارة إبراهيم",
        email: "sarah@example.com",
        role: "employee",
        status: "inactive",
        lastSignedIn: new Date(Date.now() - 1000 * 60 * 60 * 24 * 5).toISOString(),
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 10).toISOString(),
      },
    ];

    setUsers(mockUsers);
    setFilteredUsers(mockUsers);
    setLoading(false);
  }, []);

  // Filter users based on search and role
  useEffect(() => {
    let filtered = users;

    if (searchQuery.trim()) {
      filtered = filtered.filter(
        (user) =>
          user.name.includes(searchQuery) ||
          user.email.includes(searchQuery)
      );
    }

    if (selectedRole) {
      filtered = filtered.filter((user) => user.role === selectedRole);
    }

    setFilteredUsers(filtered);
  }, [searchQuery, selectedRole, users]);

  const handleUserPress = (userId: number) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    console.log("View user:", userId);
  };

  const handleAddUser = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    console.log("Add new user");
  };

  const getRoleLabel = (role: string) => {
    const roleMap: Record<string, string> = {
      admin: "مدير",
      employee: "موظف",
      reviewer: "مراجع",
      user: "مستخدم",
    };
    return roleMap[role] || role;
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case "admin":
        return colors.error;
      case "reviewer":
        return colors.warning;
      case "employee":
        return colors.primary;
      default:
        return colors.muted;
    }
  };

  const formatDate = (dateString: string) => {
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

  const renderUserItem = ({ item }: { item: User }) => (
    <Pressable
      onPress={() => handleUserPress(item.id)}
      style={({ pressed }) => [
        {
          backgroundColor: colors.surface,
          borderRadius: 12,
          padding: 12,
          marginBottom: 8,
          borderLeftWidth: 4,
          borderLeftColor: getRoleColor(item.role),
          opacity: pressed ? 0.8 : 1,
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
              marginBottom: 2,
            }}
          >
            {item.name}
          </Text>
          <Text
            style={{
              fontSize: 12,
              color: colors.muted,
            }}
          >
            {item.email}
          </Text>
        </View>

        {/* Status Badge */}
        <View
          style={{
            paddingHorizontal: 8,
            paddingVertical: 4,
            borderRadius: 6,
            backgroundColor: item.status === "active" ? colors.success : colors.muted,
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
            {item.status === "active" ? "نشط" : "غير نشط"}
          </Text>
        </View>
      </View>

      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        {/* Role Badge */}
        <View
          style={{
            paddingHorizontal: 8,
            paddingVertical: 4,
            borderRadius: 6,
            backgroundColor: getRoleColor(item.role),
          }}
        >
          <Text
            style={{
              fontSize: 10,
              fontWeight: "600",
              color: "#ffffff",
            }}
          >
            {getRoleLabel(item.role)}
          </Text>
        </View>

        {/* Last Sign In */}
        <Text
          style={{
            fontSize: 10,
            color: colors.muted,
          }}
        >
          آخر دخول: {formatDate(item.lastSignedIn)}
        </Text>

        {/* Chevron */}
        <Text
          style={{
            fontSize: 16,
            color: colors.muted,
            marginLeft: 8,
          }}
        >
          ←
        </Text>
      </View>
    </Pressable>
  );

  return (
    <ScreenContainer className="bg-background">
      <ScrollView
        contentContainerStyle={{ flexGrow: 1 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={{ padding: 16, paddingBottom: 8 }}>
          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: 16,
            }}
          >
            <Text
              style={{
                fontSize: 24,
                fontWeight: "700",
                color: colors.foreground,
              }}
            >
              إدارة المستخدمين
            </Text>
            <Pressable
              onPress={handleAddUser}
              style={({ pressed }) => [
                {
                  backgroundColor: colors.primary,
                  borderRadius: 8,
                  padding: 8,
                  opacity: pressed ? 0.85 : 1,
                },
              ]}
            >
              <Text style={{ fontSize: 20 }}>➕</Text>
            </Pressable>
          </View>

          {/* Search Bar */}
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              backgroundColor: colors.surface,
              borderRadius: 10,
              paddingHorizontal: 12,
              borderWidth: 1,
              borderColor: colors.border,
              marginBottom: 12,
            }}
          >
            <Text style={{ fontSize: 16, marginRight: 8 }}>🔍</Text>
            <TextInput
              placeholder="ابحث عن المستخدم..."
              placeholderTextColor={colors.muted}
              value={searchQuery}
              onChangeText={setSearchQuery}
              style={{
                flex: 1,
                paddingVertical: 10,
                fontSize: 14,
                color: colors.foreground,
              }}
            />
          </View>

          {/* Role Filter */}
          <View style={{ gap: 8 }}>
            <Text
              style={{
                fontSize: 12,
                fontWeight: "600",
                color: colors.muted,
              }}
            >
              تصفية حسب الدور
            </Text>
            <View
              style={{
                flexDirection: "row",
                gap: 8,
                flexWrap: "wrap",
              }}
            >
              {[
                { code: null, label: "الكل" },
                { code: "admin", label: "مدير" },
                { code: "employee", label: "موظف" },
                { code: "reviewer", label: "مراجع" },
              ].map((roleOption) => (
                <Pressable
                  key={roleOption.code || "all"}
                  onPress={() => setSelectedRole(roleOption.code)}
                  style={({ pressed }) => [
                    {
                      paddingHorizontal: 12,
                      paddingVertical: 6,
                      borderRadius: 20,
                      backgroundColor:
                        selectedRole === roleOption.code
                          ? colors.primary
                          : colors.surface,
                      borderWidth: 1,
                      borderColor:
                        selectedRole === roleOption.code
                          ? colors.primary
                          : colors.border,
                      opacity: pressed ? 0.8 : 1,
                    },
                  ]}
                >
                  <Text
                    style={{
                      fontSize: 12,
                      fontWeight: "600",
                      color:
                        selectedRole === roleOption.code
                          ? "#ffffff"
                          : colors.foreground,
                    }}
                  >
                    {roleOption.label}
                  </Text>
                </Pressable>
              ))}
            </View>
          </View>
        </View>

        {/* Users List */}
        <View style={{ paddingHorizontal: 16, paddingTop: 8, paddingBottom: 32 }}>
          {loading ? (
            <View
              style={{
                alignItems: "center",
                justifyContent: "center",
                paddingVertical: 40,
              }}
            >
              <Text style={{ color: colors.muted }}>جاري التحميل...</Text>
            </View>
          ) : filteredUsers.length === 0 ? (
            <View
              style={{
                alignItems: "center",
                justifyContent: "center",
                paddingVertical: 40,
              }}
            >
              <Text style={{ fontSize: 18, marginBottom: 8 }}>😕</Text>
              <Text
                style={{
                  fontSize: 14,
                  color: colors.muted,
                  textAlign: "center",
                }}
              >
                لم يتم العثور على مستخدمين
              </Text>
            </View>
          ) : (
            <>
              <Text
                style={{
                  fontSize: 12,
                  color: colors.muted,
                  marginBottom: 12,
                }}
              >
                {filteredUsers.length} مستخدم
              </Text>
              <FlatList
                data={filteredUsers}
                renderItem={renderUserItem}
                keyExtractor={(item) => item.id.toString()}
                scrollEnabled={false}
                nestedScrollEnabled={false}
              />
            </>
          )}
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}

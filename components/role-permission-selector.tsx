import { View, Text, Pressable, ScrollView, FlatList } from "react-native";
import { useColors } from "@/hooks/use-colors";
import * as Haptics from "expo-haptics";
import { useState } from "react";

export interface RoleOption {
  id: number;
  code: string;
  name: string;
  description?: string;
}

export interface PermissionOption {
  id: number;
  code: string;
  name: string;
  category: string;
  action: string;
}

interface RoleSelectorProps {
  roles: RoleOption[];
  selectedRoles: number[];
  onRolesChange: (roleIds: number[]) => void;
  multiSelect?: boolean;
}

/**
 * Role Selector Component
 * 
 * Allows selecting one or multiple roles for a user
 */
export function RoleSelector({
  roles,
  selectedRoles,
  onRolesChange,
  multiSelect = true,
}: RoleSelectorProps) {
  const colors = useColors();

  const handleRolePress = (roleId: number) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    if (multiSelect) {
      if (selectedRoles.includes(roleId)) {
        onRolesChange(selectedRoles.filter((id) => id !== roleId));
      } else {
        onRolesChange([...selectedRoles, roleId]);
      }
    } else {
      onRolesChange([roleId]);
    }
  };

  return (
    <View
      style={{
        backgroundColor: colors.surface,
        borderRadius: 12,
        padding: 12,
        marginBottom: 12,
      }}
    >
      <Text
        style={{
          fontSize: 14,
          fontWeight: "600",
          color: colors.foreground,
          marginBottom: 12,
        }}
      >
        الأدوار
      </Text>

      <View style={{ gap: 8 }}>
        {roles.map((role) => {
          const isSelected = selectedRoles.includes(role.id);
          return (
            <Pressable
              key={role.id}
              onPress={() => handleRolePress(role.id)}
              style={({ pressed }) => [
                {
                  flexDirection: "row",
                  alignItems: "center",
                  padding: 12,
                  borderRadius: 8,
                  backgroundColor: isSelected ? colors.primary : colors.background,
                  borderWidth: 1,
                  borderColor: isSelected ? colors.primary : colors.border,
                  opacity: pressed ? 0.8 : 1,
                },
              ]}
            >
              {/* Checkbox */}
              <View
                style={{
                  width: 20,
                  height: 20,
                  borderRadius: 4,
                  borderWidth: 2,
                  borderColor: isSelected ? "#ffffff" : colors.border,
                  backgroundColor: isSelected ? colors.primary : "transparent",
                  alignItems: "center",
                  justifyContent: "center",
                  marginRight: 12,
                }}
              >
                {isSelected && (
                  <Text style={{ color: "#ffffff", fontSize: 12, fontWeight: "bold" }}>
                    ✓
                  </Text>
                )}
              </View>

              {/* Role Info */}
              <View style={{ flex: 1 }}>
                <Text
                  style={{
                    fontSize: 13,
                    fontWeight: "600",
                    color: isSelected ? "#ffffff" : colors.foreground,
                    marginBottom: 2,
                  }}
                >
                  {role.name}
                </Text>
                {role.description && (
                  <Text
                    style={{
                      fontSize: 11,
                      color: isSelected ? "rgba(255, 255, 255, 0.8)" : colors.muted,
                    }}
                  >
                    {role.description}
                  </Text>
                )}
              </View>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

interface PermissionSelectorProps {
  permissions: PermissionOption[];
  selectedPermissions: number[];
  onPermissionsChange: (permissionIds: number[]) => void;
  groupByCategory?: boolean;
}

/**
 * Permission Selector Component
 * 
 * Allows selecting multiple permissions with optional grouping by category
 */
export function PermissionSelector({
  permissions,
  selectedPermissions,
  onPermissionsChange,
  groupByCategory = true,
}: PermissionSelectorProps) {
  const colors = useColors();

  const handlePermissionPress = (permissionId: number) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    if (selectedPermissions.includes(permissionId)) {
      onPermissionsChange(
        selectedPermissions.filter((id) => id !== permissionId)
      );
    } else {
      onPermissionsChange([...selectedPermissions, permissionId]);
    }
  };

  const handleSelectCategory = (categoryPermissions: PermissionOption[]) => {
    const categoryIds = categoryPermissions.map((p) => p.id);
    const allSelected = categoryIds.every((id) =>
      selectedPermissions.includes(id)
    );

    if (allSelected) {
      onPermissionsChange(
        selectedPermissions.filter((id) => !categoryIds.includes(id))
      );
    } else {
      const newPermissions = new Set(selectedPermissions);
      categoryIds.forEach((id) => newPermissions.add(id));
      onPermissionsChange(Array.from(newPermissions));
    }
  };

  if (groupByCategory) {
    const grouped = permissions.reduce(
      (acc, perm) => {
        if (!acc[perm.category]) {
          acc[perm.category] = [];
        }
        acc[perm.category].push(perm);
        return acc;
      },
      {} as Record<string, PermissionOption[]>
    );

    return (
      <View
        style={{
          backgroundColor: colors.surface,
          borderRadius: 12,
          padding: 12,
          marginBottom: 12,
        }}
      >
        <Text
          style={{
            fontSize: 14,
            fontWeight: "600",
            color: colors.foreground,
            marginBottom: 12,
          }}
        >
          الصلاحيات
        </Text>

        {Object.entries(grouped).map(([category, categoryPermissions]) => {
          const categorySelected = categoryPermissions.every((p) =>
            selectedPermissions.includes(p.id)
          );

          return (
            <View key={category} style={{ marginBottom: 12 }}>
              {/* Category Header */}
              <Pressable
                onPress={() => handleSelectCategory(categoryPermissions)}
                style={({ pressed }) => [
                  {
                    flexDirection: "row",
                    alignItems: "center",
                    paddingVertical: 8,
                    paddingHorizontal: 8,
                    borderRadius: 6,
                    backgroundColor: pressed ? colors.border : "transparent",
                    marginBottom: 8,
                  },
                ]}
              >
                <View
                  style={{
                    width: 18,
                    height: 18,
                    borderRadius: 3,
                    borderWidth: 2,
                    borderColor: categorySelected ? colors.primary : colors.border,
                    backgroundColor: categorySelected ? colors.primary : "transparent",
                    alignItems: "center",
                    justifyContent: "center",
                    marginRight: 10,
                  }}
                >
                  {categorySelected && (
                    <Text style={{ color: "#ffffff", fontSize: 11, fontWeight: "bold" }}>
                      ✓
                    </Text>
                  )}
                </View>
                <Text
                  style={{
                    fontSize: 13,
                    fontWeight: "600",
                    color: colors.foreground,
                    flex: 1,
                  }}
                >
                  {category}
                </Text>
                <Text
                  style={{
                    fontSize: 11,
                    color: colors.muted,
                  }}
                >
                  {categoryPermissions.filter((p) =>
                    selectedPermissions.includes(p.id)
                  ).length}/{categoryPermissions.length}
                </Text>
              </Pressable>

              {/* Permissions in Category */}
              <View style={{ marginLeft: 28, gap: 6 }}>
                {categoryPermissions.map((permission) => {
                  const isSelected = selectedPermissions.includes(permission.id);
                  return (
                    <Pressable
                      key={permission.id}
                      onPress={() => handlePermissionPress(permission.id)}
                      style={({ pressed }) => [
                        {
                          flexDirection: "row",
                          alignItems: "center",
                          padding: 10,
                          borderRadius: 6,
                          backgroundColor: isSelected
                            ? `${colors.primary}20`
                            : "transparent",
                          borderWidth: 1,
                          borderColor: isSelected ? colors.primary : colors.border,
                          opacity: pressed ? 0.7 : 1,
                        },
                      ]}
                    >
                      <View
                        style={{
                          width: 16,
                          height: 16,
                          borderRadius: 3,
                          borderWidth: 1.5,
                          borderColor: isSelected ? colors.primary : colors.border,
                          backgroundColor: isSelected ? colors.primary : "transparent",
                          alignItems: "center",
                          justifyContent: "center",
                          marginRight: 8,
                        }}
                      >
                        {isSelected && (
                          <Text
                            style={{
                              color: "#ffffff",
                              fontSize: 10,
                              fontWeight: "bold",
                            }}
                          >
                            ✓
                          </Text>
                        )}
                      </View>

                      <View style={{ flex: 1 }}>
                        <Text
                          style={{
                            fontSize: 12,
                            fontWeight: "500",
                            color: colors.foreground,
                          }}
                        >
                          {permission.name}
                        </Text>
                        <Text
                          style={{
                            fontSize: 10,
                            color: colors.muted,
                            marginTop: 2,
                          }}
                        >
                          {permission.action}
                        </Text>
                      </View>
                    </Pressable>
                  );
                })}
              </View>
            </View>
          );
        })}
      </View>
    );
  }

  // Flat list without grouping
  return (
    <View
      style={{
        backgroundColor: colors.surface,
        borderRadius: 12,
        padding: 12,
        marginBottom: 12,
      }}
    >
      <Text
        style={{
          fontSize: 14,
          fontWeight: "600",
          color: colors.foreground,
          marginBottom: 12,
        }}
      >
        الصلاحيات
      </Text>

      <View style={{ gap: 8 }}>
        {permissions.map((permission) => {
          const isSelected = selectedPermissions.includes(permission.id);
          return (
            <Pressable
              key={permission.id}
              onPress={() => handlePermissionPress(permission.id)}
              style={({ pressed }) => [
                {
                  flexDirection: "row",
                  alignItems: "center",
                  padding: 10,
                  borderRadius: 8,
                  backgroundColor: isSelected ? colors.primary : colors.background,
                  borderWidth: 1,
                  borderColor: isSelected ? colors.primary : colors.border,
                  opacity: pressed ? 0.8 : 1,
                },
              ]}
            >
              <View
                style={{
                  width: 18,
                  height: 18,
                  borderRadius: 4,
                  borderWidth: 2,
                  borderColor: isSelected ? "#ffffff" : colors.border,
                  backgroundColor: isSelected ? colors.primary : "transparent",
                  alignItems: "center",
                  justifyContent: "center",
                  marginRight: 10,
                }}
              >
                {isSelected && (
                  <Text style={{ color: "#ffffff", fontSize: 12, fontWeight: "bold" }}>
                    ✓
                  </Text>
                )}
              </View>

              <View style={{ flex: 1 }}>
                <Text
                  style={{
                    fontSize: 12,
                    fontWeight: "600",
                    color: isSelected ? "#ffffff" : colors.foreground,
                  }}
                >
                  {permission.name}
                </Text>
                <Text
                  style={{
                    fontSize: 10,
                    color: isSelected ? "rgba(255, 255, 255, 0.8)" : colors.muted,
                    marginTop: 2,
                  }}
                >
                  {permission.category} - {permission.action}
                </Text>
              </View>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

/**
 * Role Badge Component
 * 
 * Displays a role as a small badge
 */
export function RoleBadge({
  role,
  onRemove,
}: {
  role: RoleOption;
  onRemove?: () => void;
}) {
  const colors = useColors();

  return (
    <View
      style={{
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: colors.primary,
        borderRadius: 16,
        paddingHorizontal: 12,
        paddingVertical: 6,
        marginRight: 8,
        marginBottom: 8,
      }}
    >
      <Text
        style={{
          fontSize: 12,
          fontWeight: "600",
          color: "#ffffff",
        }}
      >
        {role.name}
      </Text>
      {onRemove && (
        <Pressable
          onPress={onRemove}
          style={({ pressed }) => [
            {
              marginLeft: 8,
              opacity: pressed ? 0.7 : 1,
            },
          ]}
        >
          <Text style={{ color: "#ffffff", fontSize: 14, fontWeight: "bold" }}>
            ✕
          </Text>
        </Pressable>
      )}
    </View>
  );
}

/**
 * Permission Badge Component
 * 
 * Displays a permission as a small badge
 */
export function PermissionBadge({
  permission,
  onRemove,
}: {
  permission: PermissionOption;
  onRemove?: () => void;
}) {
  const colors = useColors();

  return (
    <View
      style={{
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: colors.success,
        borderRadius: 16,
        paddingHorizontal: 10,
        paddingVertical: 4,
        marginRight: 6,
        marginBottom: 6,
      }}
    >
      <Text
        style={{
          fontSize: 11,
          fontWeight: "500",
          color: "#ffffff",
        }}
      >
        {permission.action}
      </Text>
      {onRemove && (
        <Pressable
          onPress={onRemove}
          style={({ pressed }) => [
            {
              marginLeft: 6,
              opacity: pressed ? 0.7 : 1,
            },
          ]}
        >
          <Text style={{ color: "#ffffff", fontSize: 12, fontWeight: "bold" }}>
            ✕
          </Text>
        </Pressable>
      )}
    </View>
  );
}

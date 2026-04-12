import { ScrollView, Text, View, TouchableOpacity, FlatList, Alert } from "react-native";
import { ScreenContainer } from "@/components/screen-container";
import { useColors } from "@/hooks/use-colors";
import * as Haptics from "expo-haptics";
import * as FileSystem from "expo-file-system/legacy";
import { useState, useEffect } from "react";
import { backupService } from "@/lib/backup-service";

interface BackupFile {
  filename: string;
  timestamp: number;
}

export default function BackupScreen() {
  const colors = useColors();
  const [backups, setBackups] = useState<BackupFile[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadBackups();
  }, []);

  const loadBackups = async () => {
    try {
      const files = await backupService.listBackups();
      const backupFiles = files.map((f) => ({
        filename: f,
        timestamp: parseInt(f.match(/\d+/)?.[0] || "0"),
      }));
      setBackups(backupFiles);
    } catch (error) {
      console.error("Failed to load backups:", error);
    }
  };

  const handleCreateBackup = async () => {
    setLoading(true);
    try {
      const filepath = await backupService.createBackup();
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      Alert.alert("نجح", "تم إنشاء النسخة الاحتياطية بنجاح");
      loadBackups();
    } catch (error) {
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      Alert.alert("خطأ", "فشل إنشاء النسخة الاحتياطية");
    } finally {
      setLoading(false);
    }
  };

  const handleExportBackup = async (filename: string) => {
    try {
      const filepath = FileSystem.documentDirectory + "backups/" + filename;
      await backupService.exportBackup(filepath);
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch (error) {
      Alert.alert("خطأ", "فشل تصدير النسخة الاحتياطية");
    }
  };

  const handleExportExcel = async () => {
    setLoading(true);
    try {
      const filepath = await backupService.exportToExcel();
      await backupService.exportBackup(filepath);
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      Alert.alert("نجح", "تم تصدير البيانات إلى Excel بنجاح");
    } catch (error) {
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      Alert.alert("خطأ", "فشل تصدير البيانات");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteBackup = async (filename: string) => {
    Alert.alert("تأكيد", "هل تريد حذف هذه النسخة الاحتياطية؟", [
      { text: "إلغاء", style: "cancel" },
      {
        text: "حذف",
        style: "destructive",
        onPress: async () => {
          try {
            await backupService.deleteBackup(filename);
            await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            loadBackups();
          } catch (error) {
            Alert.alert("خطأ", "فشل حذف النسخة الاحتياطية");
          }
        },
      },
    ]);
  };

  return (
    <ScreenContainer className="p-4">
      <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
        <View className="gap-4">
          {/* Header */}
          <View className="gap-2">
            <Text className="text-2xl font-bold text-foreground">النسخ الاحتياطي</Text>
            <Text className="text-sm text-muted">إدارة النسخ الاحتياطية والتصدير</Text>
          </View>

          {/* Action Buttons */}
          <View className="gap-3">
            <TouchableOpacity
              disabled={loading}
              onPress={handleCreateBackup}
              className="rounded-lg p-4"
              style={{ backgroundColor: colors.primary }}
            >
              <Text className="text-center font-semibold text-white">
                {loading ? "جاري الإنشاء..." : "إنشاء نسخة احتياطية"}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              disabled={loading}
              onPress={handleExportExcel}
              className="rounded-lg p-4"
              style={{ backgroundColor: colors.success }}
            >
              <Text className="text-center font-semibold text-white">
                تصدير إلى Excel
              </Text>
            </TouchableOpacity>
          </View>

          {/* Backups List */}
          <View className="gap-2">
            <Text className="text-lg font-semibold text-foreground">النسخ المتاحة</Text>

            {backups.length === 0 ? (
              <View className="rounded-lg border border-border bg-surface p-4">
                <Text className="text-center text-muted">لا توجد نسخ احتياطية</Text>
              </View>
            ) : (
              <FlatList
                scrollEnabled={false}
                data={backups}
                keyExtractor={(item) => item.filename}
                renderItem={({ item }) => (
                  <View className="mb-3 rounded-lg border border-border bg-surface p-4">
                    <View className="mb-3 flex-row items-center justify-between">
                      <Text className="font-semibold text-foreground">
                        {new Date(item.timestamp).toLocaleDateString("ar-SA")}
                      </Text>
                      <Text className="text-xs text-muted">
                        {new Date(item.timestamp).toLocaleTimeString("ar-SA")}
                      </Text>
                    </View>

                    <View className="flex-row gap-2">
                      <TouchableOpacity
                        onPress={() => handleExportBackup(item.filename)}
                        className="flex-1 rounded bg-primary p-2"
                      >
                        <Text className="text-center text-xs font-semibold text-white">
                          تصدير
                        </Text>
                      </TouchableOpacity>

                      <TouchableOpacity
                        onPress={() => handleDeleteBackup(item.filename)}
                        className="flex-1 rounded bg-error p-2"
                      >
                        <Text className="text-center text-xs font-semibold text-white">
                          حذف
                        </Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                )}
              />
            )}
          </View>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}

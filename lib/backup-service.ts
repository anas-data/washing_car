import * as FileSystem from "expo-file-system/legacy";
import * as Sharing from "expo-sharing";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { trpc } from "./trpc";

/**
 * Backup Service - Handle data export, import, and restoration
 */

export interface BackupData {
  version: string;
  timestamp: number;
  data: {
    parts: any[];
    vehicles: any[];
    operations: any[];
    approvals: any[];
    messages: any[];
    notes: any[];
    alerts: any[];
  };
}

class BackupService {
  private backupDir = FileSystem.documentDirectory + "backups/";

  /**
   * Initialize backup directory
   */
  async initialize() {
    try {
      const dirInfo = await FileSystem.getInfoAsync(this.backupDir);
      if (!dirInfo.exists) {
        await FileSystem.makeDirectoryAsync(this.backupDir, { intermediates: true });
      }
    } catch (error) {
      console.error("Failed to initialize backup directory:", error);
    }
  }

  /**
   * Create full backup of all data
   */
  async createBackup(): Promise<string> {
    try {
      const backupData: BackupData = {
        version: "1.0.0",
        timestamp: Date.now(),
        data: {
          parts: await (trpc.parts.list as any).query(),
          vehicles: await (trpc.vehicles.list as any).query(),
          operations: await (trpc.operations.list as any).query(),
          approvals: await (trpc.approvals.getPending as any).query(),
          messages: await (trpc.messages.getConversations as any).query(),
          notes: await (trpc.notes.list as any).query(),
          alerts: await (trpc.alerts.getAll as any).query(),
        },
      };

      const filename = `backup_${Date.now()}.json`;
      const filepath = this.backupDir + filename;

      await FileSystem.writeAsStringAsync(filepath, JSON.stringify(backupData, null, 2));

      // Save backup metadata
      await this.saveBackupMetadata(filename);

      return filepath;
    } catch (error) {
      console.error("Failed to create backup:", error);
      throw error;
    }
  }

  /**
   * Export backup to external storage
   */
  async exportBackup(filepath: string): Promise<void> {
    try {
      if (!(await Sharing.isAvailableAsync())) {
        throw new Error("Sharing is not available on this device");
      }

      await Sharing.shareAsync(filepath, {
        mimeType: "application/json",
        dialogTitle: "Export Backup",
      });
    } catch (error) {
      console.error("Failed to export backup:", error);
      throw error;
    }
  }

  /**
   * Export data to Excel format (CSV)
   */
  async exportToExcel(): Promise<string> {
    try {
      const parts = await (trpc.parts.list as any).query();
      const operations = await (trpc.operations.list as any).query();

      // Create CSV for parts
      let csv = "الكود,الاسم,الفئة,الوحدة,الكمية المتاحة,الكمية المطلوبة,التكلفة\n";
      for (const part of parts) {
        csv += `${part.code},"${part.name}","${part.category}","${part.unit}",${part.quantityAvailable},${part.quantityRequired},"${part.cost}"\n`;
      }

      // Create CSV for operations
      csv += "\n\nنوع العملية,المركبة,القطعة,الكمية,اسم السائق,التاريخ\n";
      for (const op of operations) {
        const operationType = op.operationType === "addition" ? "إضافة" : "استهلاك";
        csv += `${operationType},"${op.vehicleId}","${op.partId}",${op.quantity},"${op.driverName}","${new Date(op.operationDate).toLocaleDateString("ar-SA")}"\n`;
      }

      const filename = `export_${Date.now()}.csv`;
      const filepath = this.backupDir + filename;

      await FileSystem.writeAsStringAsync(filepath, csv);

      return filepath;
    } catch (error) {
      console.error("Failed to export to Excel:", error);
      throw error;
    }
  }

  /**
   * Restore backup from file
   */
  async restoreBackup(filepath: string): Promise<void> {
    try {
      const content = await FileSystem.readAsStringAsync(filepath);
      const backupData: BackupData = JSON.parse(content);

      // Validate backup version
      if (backupData.version !== "1.0.0") {
        throw new Error("Unsupported backup version");
      }

      // Restore data
      await this.restoreData(backupData.data);

      // Save restore metadata
      await AsyncStorage.setItem("last_restore_time", Date.now().toString());
    } catch (error) {
      console.error("Failed to restore backup:", error);
      throw error;
    }
  }

  /**
   * Restore data from backup
   */
  private async restoreData(data: BackupData["data"]): Promise<void> {
    try {
      // Restore parts
      for (const part of data.parts) {
        await (trpc.parts.create as any).mutate(part);
      }

      // Restore vehicles
      for (const vehicle of data.vehicles) {
        await (trpc.vehicles.create as any).mutate(vehicle);
      }

      // Restore operations
      for (const operation of data.operations) {
        await (trpc.operations.create as any).mutate(operation);
      }

      console.log("Backup restored successfully");
    } catch (error) {
      console.error("Failed to restore data:", error);
      throw error;
    }
  }

  /**
   * List all backups
   */
  async listBackups(): Promise<string[]> {
    try {
      const files = await FileSystem.readDirectoryAsync(this.backupDir);
      return files.filter((f) => f.endsWith(".json")).sort().reverse();
    } catch (error) {
      console.error("Failed to list backups:", error);
      return [];
    }
  }

  /**
   * Delete backup
   */
  async deleteBackup(filename: string): Promise<void> {
    try {
      const filepath = this.backupDir + filename;
      await FileSystem.deleteAsync(filepath);
    } catch (error) {
      console.error("Failed to delete backup:", error);
      throw error;
    }
  }

  /**
   * Save backup metadata
   */
  private async saveBackupMetadata(filename: string): Promise<void> {
    try {
      const metadata = await AsyncStorage.getItem("backup_metadata");
      const backups = metadata ? JSON.parse(metadata) : [];
      backups.push({
        filename,
        timestamp: Date.now(),
      });
      await AsyncStorage.setItem("backup_metadata", JSON.stringify(backups));
    } catch (error) {
      console.error("Failed to save backup metadata:", error);
    }
  }
}

export const backupService = new BackupService();

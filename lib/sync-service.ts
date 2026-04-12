import { trpc } from "./trpc";
import AsyncStorage from "@react-native-async-storage/async-storage";

/**
 * Real-time synchronization service for multi-device support
 * Handles data sync between manager and employee devices
 */

export interface SyncState {
  lastSyncTime: number;
  pendingChanges: Array<{
    type: "inventory" | "operation" | "message" | "note";
    action: "create" | "update" | "delete";
    id: number;
    data?: any;
    timestamp: number;
  }>;
  syncInProgress: boolean;
  lastError?: string;
}

const SYNC_INTERVAL = 5000; // 5 seconds
const SYNC_STORAGE_KEY = "sync_state";

class SyncService {
  private syncInterval: any = null;
  private syncState: SyncState = {
    lastSyncTime: 0,
    pendingChanges: [],
    syncInProgress: false,
  };

  /**
   * Initialize sync service
   */
  async initialize() {
    try {
      const stored = await AsyncStorage.getItem(SYNC_STORAGE_KEY);
      if (stored) {
        this.syncState = JSON.parse(stored);
      }
    } catch (error) {
      console.error("Failed to load sync state:", error);
    }

    // Start periodic sync
    this.startSync();
  }

  /**
   * Start periodic synchronization
   */
  private startSync() {
    if (this.syncInterval) {
      clearInterval(this.syncInterval);
    }

    this.syncInterval = setInterval(() => {
      this.performSync();
    }, SYNC_INTERVAL);

    // Also sync immediately
    this.performSync();
  }

  /**
   * Perform synchronization
   */
  private async performSync() {
    if (this.syncState.syncInProgress) {
      return;
    }

    this.syncState.syncInProgress = true;

    try {
      // Sync pending changes
      if (this.syncState.pendingChanges.length > 0) {
        await this.syncPendingChanges();
      }

      // Fetch latest data
      await this.fetchLatestData();

      this.syncState.lastSyncTime = Date.now();
      this.syncState.lastError = undefined;
    } catch (error) {
      console.error("Sync error:", error);
      this.syncState.lastError = String(error);
    } finally {
      this.syncState.syncInProgress = false;
      await this.saveSyncState();
    }
  }

  /**
   * Sync pending changes to server
   */
  private async syncPendingChanges() {
    const changes = [...this.syncState.pendingChanges];

    for (const change of changes) {
      try {
        switch (change.type) {
          case "inventory":
            if (change.action === "update") {
              // Update part quantity
              await (trpc.parts.update as any).mutate({
                id: change.id,
                data: change.data,
              });
            }
            break;

          case "operation":
            if (change.action === "update") {
              // Update operation status
              await (trpc.operations.updateStatus as any).mutate({
                id: change.id,
                status: change.data.status,
              });
            }
            break;

          case "message":
            if (change.action === "create") {
              // Message already sent, just remove from pending
            }
            break;

          case "note":
            if (change.action === "update") {
              // Update note
              await (trpc.notes.update as any).mutate({
                id: change.id,
                data: change.data,
              });
            }
            break;
        }

        // Remove from pending changes
        this.syncState.pendingChanges = this.syncState.pendingChanges.filter(
          (c) => !(c.type === change.type && c.id === change.id && c.timestamp === change.timestamp)
        );
      } catch (error) {
        console.error(`Failed to sync ${change.type} change:`, error);
      }
    }
  }

  /**
   * Fetch latest data from server
   */
  private async fetchLatestData() {
    try {
      // Fetch inventory updates
      const parts = await (trpc.parts.list as any).query();
      await AsyncStorage.setItem("parts_cache", JSON.stringify(parts));

      // Fetch operation updates
      const operations = await (trpc.operations.list as any).query();
      await AsyncStorage.setItem("operations_cache", JSON.stringify(operations));

      // Fetch message updates
      const conversations = await (trpc.messages.getConversations as any).query();
      await AsyncStorage.setItem("conversations_cache", JSON.stringify(conversations));

      // Fetch note updates
      const notes = await (trpc.notes.list as any).query();
      await AsyncStorage.setItem("notes_cache", JSON.stringify(notes));
    } catch (error) {
      console.error("Failed to fetch latest data:", error);
      throw error;
    }
  }

  /**
   * Add pending change
   */
  addPendingChange(
    type: "inventory" | "operation" | "message" | "note",
    action: "create" | "update" | "delete",
    id: number,
    data?: any
  ) {
    this.syncState.pendingChanges.push({
      type,
      action,
      id,
      data,
      timestamp: Date.now(),
    });

    // Trigger immediate sync
    this.performSync();
  }

  /**
   * Get sync state
   */
  getSyncState(): SyncState {
    return { ...this.syncState };
  }

  /**
   * Save sync state to storage
   */
  private async saveSyncState() {
    try {
      await AsyncStorage.setItem(SYNC_STORAGE_KEY, JSON.stringify(this.syncState));
    } catch (error) {
      console.error("Failed to save sync state:", error);
    }
  }

  /**
   * Cleanup
   */
  destroy() {
    if (this.syncInterval) {
      clearInterval(this.syncInterval);
      this.syncInterval = null;
    }
  }
}

export const syncService = new SyncService();

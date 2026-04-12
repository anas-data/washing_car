import { trpc } from "./trpc";
import AsyncStorage from "@react-native-async-storage/async-storage";

/**
 * Advanced Search Service - Handle complex search queries across all data
 */

export interface SearchResult {
  type: "part" | "vehicle" | "operation" | "message" | "note";
  id: number;
  title: string;
  subtitle?: string;
  description?: string;
  metadata?: Record<string, any>;
}

export interface SearchFilters {
  query?: string;
  type?: "part" | "vehicle" | "operation" | "message" | "note" | "all";
  dateFrom?: Date;
  dateTo?: Date;
  status?: string;
  category?: string;
  priority?: "low" | "medium" | "high";
  limit?: number;
  offset?: number;
}

class SearchService {
  /**
   * Perform advanced search
   */
  async search(filters: SearchFilters): Promise<SearchResult[]> {
    const results: SearchResult[] = [];
    const query = filters.query?.toLowerCase() || "";
    const limit = filters.limit || 50;
    const offset = filters.offset || 0;

    try {
      // Search parts
      if (filters.type === "part" || filters.type === "all") {
        const parts = await (trpc.parts.list as any).query();
        const partResults = parts
          .filter((p: any) =>
            query === "" ||
            p.code.toLowerCase().includes(query) ||
            p.name.toLowerCase().includes(query) ||
            p.description?.toLowerCase().includes(query)
          )
          .filter((p: any) => !filters.category || p.category === filters.category)
          .map((p: any) => ({
            type: "part" as const,
            id: p.id,
            title: p.name,
            subtitle: p.code,
            description: p.description,
            metadata: {
              quantity: p.quantityAvailable,
              category: p.category,
              unit: p.unit,
            },
          }));
        results.push(...partResults);
      }

      // Search vehicles
      if (filters.type === "vehicle" || filters.type === "all") {
        const vehicles = await (trpc.vehicles.list as any).query();
        const vehicleResults = vehicles
          .filter((v: any) =>
            query === "" ||
            v.plateNumber.toLowerCase().includes(query) ||
            v.model.toLowerCase().includes(query) ||
            v.brand.toLowerCase().includes(query)
          )
          .map((v: any) => ({
            type: "vehicle" as const,
            id: v.id,
            title: `${v.brand} ${v.model}`,
            subtitle: v.plateNumber,
            description: v.description,
            metadata: {
              year: v.year,
              status: v.status,
            },
          }));
        results.push(...vehicleResults);
      }

      // Search operations
      if (filters.type === "operation" || filters.type === "all") {
        const operations = await (trpc.operations.list as any).query();
        const operationResults = operations
          .filter((o: any) => {
            const matchesQuery =
              query === "" ||
              o.driverName.toLowerCase().includes(query) ||
              o.notes?.toLowerCase().includes(query);

            const matchesDate =
              (!filters.dateFrom || new Date(o.operationDate) >= filters.dateFrom) &&
              (!filters.dateTo || new Date(o.operationDate) <= filters.dateTo);

            return matchesQuery && matchesDate;
          })
          .map((o: any) => ({
            type: "operation" as const,
            id: o.id,
            title: o.driverName,
            subtitle: o.operationType === "addition" ? "إضافة" : "استهلاك",
            description: o.notes,
            metadata: {
              quantity: o.quantity,
              date: o.operationDate,
              status: o.status,
            },
          }));
        results.push(...operationResults);
      }

      // Search messages
      if (filters.type === "message" || filters.type === "all") {
        const conversations = await (trpc.messages.getConversations as any).query();
        const messageResults = conversations
          .filter((c: any) =>
            query === "" ||
            c.subject?.toLowerCase().includes(query)
          )
          .map((c: any) => ({
            type: "message" as const,
            id: c.id,
            title: c.subject || "محادثة",
            subtitle: `آخر رسالة: ${new Date(c.lastMessageDate).toLocaleDateString("ar-SA")}`,
            metadata: {
              isActive: c.isActive,
              participants: [c.participantOneId, c.participantTwoId],
            },
          }));
        results.push(...messageResults);
      }

      // Search notes
      if (filters.type === "note" || filters.type === "all") {
        const notes = await (trpc.notes.list as any).query();
        const noteResults = notes
          .filter((n: any) =>
            query === "" ||
            n.title.toLowerCase().includes(query) ||
            n.content.toLowerCase().includes(query)
          )
          .filter((n: any) => !filters.category || n.category === filters.category)
          .filter((n: any) => !filters.priority || n.priority === filters.priority)
          .map((n: any) => ({
            type: "note" as const,
            id: n.id,
            title: n.title,
            subtitle: n.category,
            description: n.content,
            metadata: {
              priority: n.priority,
              dueDate: n.dueDate,
              isCompleted: n.isCompleted,
            },
          }));
        results.push(...noteResults);
      }

      // Apply pagination
      return results.slice(offset, offset + limit);
    } catch (error) {
      console.error("Search error:", error);
      return [];
    }
  }

  /**
   * Get search suggestions
   */
  async getSuggestions(query: string, type?: string): Promise<string[]> {
    const suggestions = new Set<string>();

    try {
      if (type === "part" || !type) {
        const parts = await (trpc.parts.list as any).query();
        parts
          .filter((p: any) => p.name.toLowerCase().includes(query.toLowerCase()))
          .slice(0, 5)
          .forEach((p: any) => suggestions.add(p.name));
      }

      if (type === "vehicle" || !type) {
        const vehicles = await (trpc.vehicles.list as any).query();
        vehicles
          .filter((v: any) =>
            v.plateNumber.toLowerCase().includes(query.toLowerCase()) ||
            v.model.toLowerCase().includes(query.toLowerCase())
          )
          .slice(0, 5)
          .forEach((v: any) => suggestions.add(v.plateNumber));
      }

      return Array.from(suggestions);
    } catch (error) {
      console.error("Failed to get suggestions:", error);
      return [];
    }
  }

  /**
   * Get recent searches
   */
  async getRecentSearches(): Promise<string[]> {
    try {
      const stored = await AsyncStorage.getItem("recent_searches");
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.error("Failed to get recent searches:", error);
      return [];
    }
  }

  /**
   * Save search to history
   */
  async saveSearch(query: string): Promise<void> {
    try {
      const recent = await AsyncStorage.getItem("recent_searches");
      const searches = recent ? JSON.parse(recent) : [];

      // Remove duplicate and add to front
      const filtered = searches.filter((s: string) => s !== query);
      filtered.unshift(query);

      // Keep only last 20
      await AsyncStorage.setItem("recent_searches", JSON.stringify(filtered.slice(0, 20)));
    } catch (error) {
      console.error("Failed to save search:", error);
    }
  }
}

// Fix for module import
const searchServiceInstance = new SearchService();
export { searchServiceInstance as searchService };



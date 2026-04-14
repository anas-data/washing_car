import { z } from "zod";
import { router, publicProcedure } from "../trpc";

// Validation schemas
const createOperationSchema = z.object({
  vehicleId: z.string().min(1, "Vehicle ID is required"),
  partId: z.string().min(1, "Part ID is required"),
  operationType: z.enum(["add", "consume", "repair", "maintenance"]),
  quantity: z.number().positive("Quantity must be positive"),
  driverName: z.string().min(1, "Driver name is required"),
  notes: z.string().optional(),
  date: z.string().datetime().optional(),
});

const updateOperationSchema = createOperationSchema.extend({
  id: z.string().min(1, "Operation ID is required"),
});

// Mock data storage (in production, use database)
const operations: any[] = [];

export const newOperationRouter = router({
  // Create new operation
  create: publicProcedure
    .input(createOperationSchema)
    .mutation(async ({ input }) => {
      try {
        const operation = {
          id: `op_${Date.now()}`,
          ...input,
          createdAt: new Date(),
          status: "pending",
          approvedBy: null,
          approvedAt: null,
        };

        operations.push(operation);

        return {
          success: true,
          message: "تم إنشاء العملية بنجاح",
          operation,
        };
      } catch (error) {
        throw new Error("Failed to create operation");
      }
    }),

  // Get all operations
  getAll: publicProcedure.query(async () => {
    try {
      return {
        success: true,
        operations: operations.sort(
          (a, b) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        ),
        total: operations.length,
      };
    } catch (error) {
      throw new Error("Failed to fetch operations");
    }
  }),

  // Get operation by ID
  getById: publicProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ input }) => {
      try {
        const operation = operations.find((op) => op.id === input.id);

        if (!operation) {
          throw new Error("Operation not found");
        }

        return {
          success: true,
          operation,
        };
      } catch (error) {
        throw new Error("Failed to fetch operation");
      }
    }),

  // Update operation
  update: publicProcedure
    .input(updateOperationSchema)
    .mutation(async ({ input }) => {
      try {
        const index = operations.findIndex((op) => op.id === input.id);

        if (index === -1) {
          throw new Error("Operation not found");
        }

        const updatedOperation = {
          ...operations[index],
          ...input,
          updatedAt: new Date(),
        };

        operations[index] = updatedOperation;

        return {
          success: true,
          message: "تم تحديث العملية بنجاح",
          operation: updatedOperation,
        };
      } catch (error) {
        throw new Error("Failed to update operation");
      }
    }),

  // Delete operation
  delete: publicProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ input }) => {
      try {
        const index = operations.findIndex((op) => op.id === input.id);

        if (index === -1) {
          throw new Error("Operation not found");
        }

        const deletedOperation = operations.splice(index, 1)[0];

        return {
          success: true,
          message: "تم حذف العملية بنجاح",
          operation: deletedOperation,
        };
      } catch (error) {
        throw new Error("Failed to delete operation");
      }
    }),

  // Approve operation
  approve: publicProcedure
    .input(
      z.object({
        id: z.string(),
        approvedBy: z.string(),
        notes: z.string().optional(),
      })
    )
    .mutation(async ({ input }) => {
      try {
        const operation = operations.find((op) => op.id === input.id);

        if (!operation) {
          throw new Error("Operation not found");
        }

        operation.status = "approved";
        operation.approvedBy = input.approvedBy;
        operation.approvedAt = new Date();
        operation.approvalNotes = input.notes;

        return {
          success: true,
          message: "تم الموافقة على العملية بنجاح",
          operation,
        };
      } catch (error) {
        throw new Error("Failed to approve operation");
      }
    }),

  // Reject operation
  reject: publicProcedure
    .input(
      z.object({
        id: z.string(),
        rejectedBy: z.string(),
        reason: z.string(),
      })
    )
    .mutation(async ({ input }) => {
      try {
        const operation = operations.find((op) => op.id === input.id);

        if (!operation) {
          throw new Error("Operation not found");
        }

        operation.status = "rejected";
        operation.rejectedBy = input.rejectedBy;
        operation.rejectedAt = new Date();
        operation.rejectionReason = input.reason;

        return {
          success: true,
          message: "تم رفض العملية",
          operation,
        };
      } catch (error) {
        throw new Error("Failed to reject operation");
      }
    }),

  // Get pending operations
  getPending: publicProcedure.query(async () => {
    try {
      const pending = operations.filter((op) => op.status === "pending");

      return {
        success: true,
        operations: pending,
        total: pending.length,
      };
    } catch (error) {
      throw new Error("Failed to fetch pending operations");
    }
  }),

  // Get operations by vehicle
  getByVehicle: publicProcedure
    .input(z.object({ vehicleId: z.string() }))
    .query(async ({ input }) => {
      try {
        const vehicleOps = operations.filter(
          (op) => op.vehicleId === input.vehicleId
        );

        return {
          success: true,
          operations: vehicleOps,
          total: vehicleOps.length,
        };
      } catch (error) {
        throw new Error("Failed to fetch vehicle operations");
      }
    }),

  // Get operations by date range
  getByDateRange: publicProcedure
    .input(
      z.object({
        startDate: z.string().datetime(),
        endDate: z.string().datetime(),
      })
    )
    .query(async ({ input }) => {
      try {
        const start = new Date(input.startDate);
        const end = new Date(input.endDate);

        const filtered = operations.filter((op) => {
          const opDate = new Date(op.createdAt);
          return opDate >= start && opDate <= end;
        });

        return {
          success: true,
          operations: filtered,
          total: filtered.length,
        };
      } catch (error) {
        throw new Error("Failed to fetch operations by date range");
      }
    }),

  // Get operation statistics
  getStatistics: publicProcedure.query(async () => {
    try {
      const total = operations.length;
      const pending = operations.filter((op) => op.status === "pending").length;
      const approved = operations.filter(
        (op) => op.status === "approved"
      ).length;
      const rejected = operations.filter(
        (op) => op.status === "rejected"
      ).length;

      const byType = {
        add: operations.filter((op) => op.operationType === "add").length,
        consume: operations.filter((op) => op.operationType === "consume")
          .length,
        repair: operations.filter((op) => op.operationType === "repair").length,
        maintenance: operations.filter((op) => op.operationType === "maintenance")
          .length,
      };

      return {
        success: true,
        statistics: {
          total,
          pending,
          approved,
          rejected,
          byType,
          approvalRate:
            total > 0 ? ((approved / total) * 100).toFixed(2) + "%" : "0%",
        },
      };
    } catch (error) {
      throw new Error("Failed to fetch operation statistics");
    }
  }),
});

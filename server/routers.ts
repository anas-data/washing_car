import { z } from "zod";
import { COOKIE_NAME } from "../shared/const.js";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, protectedProcedure, router } from "./_core/trpc";
import * as db from "./db";

export const appRouter = router({
  // if you need to use socket.io, read and register route in server/_core/index.ts, all api should start with '/api/' so that the gateway can route correctly
  system: systemRouter,
  auth: router({
    me: publicProcedure.query((opts) => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return {
        success: true,
      } as const;
    }),
  }),

  // ============================================================================
  // PUBLIC TEST ENDPOINTS (For development/testing without authentication)
  // ============================================================================

  test: router({
    vehicles: publicProcedure.query(() => db.getAllVehicles()),
    parts: publicProcedure.query(() => db.getAllParts()),
    lowStockParts: publicProcedure.query(() => db.getLowStockParts()),
    operations: publicProcedure.query(() => db.getAllOperations()),
    pendingOperations: publicProcedure.query(() => db.getPendingOperations()),
  }),

  // ============================================================================
  // VEHICLES
  // ============================================================================

  vehicles: router({
    list: protectedProcedure.query(() => db.getAllVehicles()),

    search: protectedProcedure
      .input(z.object({ query: z.string() }))
      .query(({ input }) => db.searchVehicles(input.query)),

    getById: protectedProcedure
      .input(z.object({ id: z.number() }))
      .query(({ input }) => db.getVehicleById(input.id)),

    create: protectedProcedure
      .input(
        z.object({
          code: z.string().min(1),
          name: z.string().min(1),
          plateNumber: z.string().min(1),
          driverName: z.string().min(1),
          status: z.enum(["active", "inactive", "maintenance"]).default("active"),
          lastMaintenanceDate: z.date().optional(),
        })
      )
      .mutation(({ input, ctx }) => {
        if (ctx.user.role !== "admin") {
          throw new Error("غير مصرح لك بإنشاء مركبات جديدة");
        }
        return db.createVehicle(input);
      }),

    update: protectedProcedure
      .input(
        z.object({
          id: z.number(),
          data: z.object({
            code: z.string().optional(),
            name: z.string().optional(),
            plateNumber: z.string().optional(),
            driverName: z.string().optional(),
            status: z.enum(["active", "inactive", "maintenance"]).optional(),
            lastMaintenanceDate: z.date().optional(),
          }),
        })
      )
      .mutation(({ input, ctx }) => {
        if (ctx.user.role !== "admin") {
          throw new Error("غير مصرح لك بتحديث المركبات");
        }
        return db.updateVehicle(input.id, input.data);
      }),

    delete: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(({ input, ctx }) => {
        if (ctx.user.role !== "admin") {
          throw new Error("غير مصرح لك بحذف المركبات");
        }
        return db.deleteVehicle(input.id);
      }),
  }),

  // ============================================================================
  // PARTS (INVENTORY)
  // ============================================================================

  parts: router({
    list: protectedProcedure.query(() => db.getAllParts()),

    search: protectedProcedure
      .input(z.object({ query: z.string() }))
      .query(({ input }) => db.searchParts(input.query)),

    getById: protectedProcedure
      .input(z.object({ id: z.number() }))
      .query(({ input }) => db.getPartById(input.id)),

    getByCategory: protectedProcedure
      .input(z.object({ category: z.string() }))
      .query(({ input }) => db.getPartsByCategory(input.category)),

    getLowStock: protectedProcedure.query(() => db.getLowStockParts()),

    create: protectedProcedure
      .input(
        z.object({
          code: z.string().min(1),
          name: z.string().min(1),
          description: z.string().optional(),
          category: z.string().min(1),
          unit: z.string().min(1),
          quantityAvailable: z.number().int().min(0),
          quantityRequired: z.number().int().min(0),
          alertThreshold: z.number().int().min(0),
          cost: z.string(),
        })
      )
      .mutation(({ input, ctx }) => {
        if (ctx.user.role !== "admin") {
          throw new Error("غير مصرح لك بإنشاء قطع جديدة");
        }
        return db.createPart(input);
      }),

    update: protectedProcedure
      .input(
        z.object({
          id: z.number(),
          data: z.object({
            code: z.string().optional(),
            name: z.string().optional(),
            description: z.string().optional(),
            category: z.string().optional(),
            unit: z.string().optional(),
            quantityAvailable: z.number().int().optional(),
            quantityRequired: z.number().int().optional(),
            alertThreshold: z.number().int().optional(),
            cost: z.string().optional(),
          }),
        })
      )
      .mutation(({ input, ctx }) => {
        if (ctx.user.role !== "admin") {
          throw new Error("غير مصرح لك بتحديث القطع");
        }
        return db.updatePart(input.id, input.data);
      }),

    delete: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(({ input, ctx }) => {
        if (ctx.user.role !== "admin") {
          throw new Error("غير مصرح لك بحذف القطع");
        }
        return db.deletePart(input.id);
      }),
  }),

  // ============================================================================
  // OPERATIONS
  // ============================================================================

  operations: router({
    list: protectedProcedure.query(() => db.getAllOperations()),

    getPending: protectedProcedure.query(() => db.getPendingOperations()),

    getById: protectedProcedure
      .input(z.object({ id: z.number() }))
      .query(({ input }) => db.getOperationById(input.id)),

    getByVehicle: protectedProcedure
      .input(z.object({ vehicleId: z.number() }))
      .query(({ input }) => db.getOperationsByVehicle(input.vehicleId)),

    getByPart: protectedProcedure
      .input(z.object({ partId: z.number() }))
      .query(({ input }) => db.getOperationsByPart(input.partId)),

    create: protectedProcedure
      .input(
        z.object({
          operationType: z.enum(["addition", "consumption"]),
          vehicleId: z.number().int().positive(),
          partId: z.number().int().positive(),
          quantity: z.number().int().positive(),
          driverName: z.string().min(1),
          notes: z.string().optional(),
        })
      )
      .mutation(async ({ input, ctx }) => {
        const code = `OP-${Date.now()}`;
        const operationId = await db.createOperation({
          ...input,
          code,
          operationDate: new Date(),
          status: "pending",
          createdById: ctx.user.id,
        });

        await db.createApproval({
          operationId,
          requestedById: ctx.user.id,
          firstLevelStatus: "pending",
          secondLevelStatus: "pending",
        });

        return operationId;
      }),

    updateStatus: protectedProcedure
      .input(
        z.object({
          id: z.number(),
          status: z.enum(["pending", "approved", "rejected"]),
        })
      )
      .mutation(({ input, ctx }) => {
        return db.updateOperationStatus(input.id, input.status, ctx.user.id, new Date());
      }),
  }),

  // ============================================================================
  // APPROVALS
  // ============================================================================

  approvals: router({
    getPending: protectedProcedure.query(({ ctx }) =>
      db.getPendingApprovalsForUser(ctx.user.id)
    ),

    getByOperation: protectedProcedure
      .input(z.object({ operationId: z.number() }))
      .query(({ input }) => db.getApprovalByOperationId(input.operationId)),

    approveFirstLevel: protectedProcedure
      .input(z.object({ approvalId: z.number() }))
      .mutation(({ input }) => {
        return db.updateApprovalFirstLevel(input.approvalId, "approved", new Date());
      }),

    rejectFirstLevel: protectedProcedure
      .input(z.object({ approvalId: z.number(), reason: z.string() }))
      .mutation(({ input }) => {
        return db.updateApprovalFirstLevel(
          input.approvalId,
          "rejected",
          new Date(),
          input.reason
        );
      }),

    approveSecondLevel: protectedProcedure
      .input(z.object({ approvalId: z.number() }))
      .mutation(({ input, ctx }) => {
        if (ctx.user.role !== "admin") {
          throw new Error("غير مصرح لك بالموافقة على المستوى الثاني");
        }
        return db.updateApprovalSecondLevel(input.approvalId, "approved", new Date());
      }),

    rejectSecondLevel: protectedProcedure
      .input(z.object({ approvalId: z.number(), reason: z.string() }))
      .mutation(({ input, ctx }) => {
        if (ctx.user.role !== "admin") {
          throw new Error("غير مصرح لك برفض الموافقة على المستوى الثاني");
        }
        return db.updateApprovalSecondLevel(
          input.approvalId,
          "rejected",
          new Date(),
          input.reason
        );
      }),
  }),

  // ============================================================================
  // ALERTS
  // ============================================================================

  alerts: router({
    getUnread: protectedProcedure.query(() => db.getUnreadAlerts()),

    getAll: protectedProcedure.query(() => db.getAllAlerts()),

    markAsRead: protectedProcedure
      .input(z.object({ alertId: z.number() }))
      .mutation(({ input, ctx }) => {
        return db.markAlertAsRead(input.alertId, ctx.user.id);
      }),
  }),

  // ============================================================================
  // REPORTS
  // ============================================================================

  reports: router({
    getDailyReport: protectedProcedure
      .input(z.object({ date: z.date() }))
      .query(({ input }) => db.getDailyReport(input.date)),

    getDailyReports: protectedProcedure
      .input(z.object({ startDate: z.date(), endDate: z.date() }))
      .query(({ input }) => db.getDailyReports(input.startDate, input.endDate)),

    getMonthlyReport: protectedProcedure
      .input(z.object({ year: z.number(), month: z.number() }))
      .query(({ input }) => db.getMonthlyReport(input.year, input.month)),

    getMonthlyReports: protectedProcedure
      .input(z.object({ year: z.number() }))
      .query(({ input }) => db.getMonthlyReports(input.year)),
  }),

  // ============================================================================
  // USERS (ADMIN ONLY)
  // ============================================================================

  users: router({
    list: protectedProcedure.query(({ ctx }) => {
      if (ctx.user.role !== "admin") {
        throw new Error("غير مصرح لك بعرض قائمة المستخدمين");
      }
      return db.getAllUsers();
    }),

    getById: protectedProcedure
      .input(z.object({ id: z.number() }))
      .query(({ input, ctx }) => {
        if (ctx.user.role !== "admin") {
          throw new Error("غير مصرح لك بعرض بيانات المستخدم");
        }
        return db.getUserById(input.id);
      }),

    updateRole: protectedProcedure
      .input(z.object({ userId: z.number(), role: z.enum(["admin", "user"]) }))
      .mutation(({ input, ctx }) => {
        if (ctx.user.role !== "admin") {
          throw new Error("غير مصرح لك بتغيير أدوار المستخدمين");
        }
        return db.updateUserRole(input.userId, input.role);
      }),
  }),

  // ============================================================================
  // MESSAGES (CONVERSATIONS)
  // ============================================================================

  messages: router({
    getConversations: protectedProcedure.query(({ ctx }) => {
      return db.getUserConversations(ctx.user.id);
    }),

    getConversationMessages: protectedProcedure
      .input(z.object({ conversationId: z.number() }))
      .query(({ input }) => {
        return db.getConversationMessages(input.conversationId);
      }),

    createConversation: protectedProcedure
      .input(
        z.object({
          participantTwoId: z.number(),
          subject: z.string().optional(),
        })
      )
      .mutation(({ input, ctx }) => {
        return db.createConversation({
          participantOneId: ctx.user.id,
          participantTwoId: input.participantTwoId,
          subject: input.subject,
        });
      }),

    sendMessage: protectedProcedure
      .input(
        z.object({
          conversationId: z.number(),
          content: z.string().min(1),
          attachmentUrl: z.string().optional(),
          attachmentType: z.string().optional(),
        })
      )
      .mutation(({ input, ctx }) => {
        return db.createMessage({
          conversationId: input.conversationId,
          senderId: ctx.user.id,
          content: input.content,
          attachmentUrl: input.attachmentUrl,
          attachmentType: input.attachmentType,
        });
      }),

    markAsRead: protectedProcedure
      .input(z.object({ messageId: z.number() }))
      .mutation(({ input }) => {
        return db.markMessageAsRead(input.messageId);
      }),

    getUnreadCount: protectedProcedure.query(({ ctx }) => {
      return db.getUnreadMessageCount(ctx.user.id);
    }),
  }),

  // ============================================================================
  // NOTES (MANAGER NOTES)
  // ============================================================================

  notes: router({
    list: protectedProcedure.query(({ ctx }) => {
      if (ctx.user.role !== "admin") {
        return db.getUserAssignedNotes(ctx.user.id);
      }
      return db.getAllNotes();
    }),

    getById: protectedProcedure
      .input(z.object({ id: z.number() }))
      .query(({ input }) => {
        return db.getNoteById(input.id);
      }),

    create: protectedProcedure
      .input(
        z.object({
          title: z.string().min(1),
          content: z.string().min(1),
          category: z.enum(["general", "warning", "important", "todo"]).default("general"),
          priority: z.enum(["low", "medium", "high"]).default("medium"),
          dueDate: z.date().optional(),
          relatedEntityType: z.string().optional(),
          relatedEntityId: z.number().optional(),
        })
      )
      .mutation(({ input, ctx }) => {
        if (ctx.user.role !== "admin") {
          throw new Error("غير مصرح لك بإنشاء ملاحظات");
        }
        return db.createNote({
          ...input,
          createdById: ctx.user.id,
        });
      }),

    update: protectedProcedure
      .input(
        z.object({
          id: z.number(),
          data: z.object({
            title: z.string().optional(),
            content: z.string().optional(),
            category: z.enum(["general", "warning", "important", "todo"]).optional(),
            priority: z.enum(["low", "medium", "high"]).optional(),
            dueDate: z.date().optional().nullable(),
            isCompleted: z.boolean().optional(),
            completedAt: z.date().optional().nullable(),
          }),
        })
      )
      .mutation(({ input, ctx }) => {
        if (ctx.user.role !== "admin") {
          throw new Error("غير مصرح لك بتحديث الملاحظات");
        }
        return db.updateNote(input.id, input.data);
      }),

    delete: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(({ input, ctx }) => {
        if (ctx.user.role !== "admin") {
          throw new Error("غير مصرح لك بحذف الملاحظات");
        }
        return db.deleteNote(input.id);
      }),

    assignToUser: protectedProcedure
      .input(z.object({ noteId: z.number(), userId: z.number() }))
      .mutation(({ input, ctx }) => {
        if (ctx.user.role !== "admin") {
          throw new Error("غير مصرح لك بتعيين الملاحظات");
        }
        return db.assignNoteToUser(input.noteId, input.userId, ctx.user.id);
      }),

    getAssignees: protectedProcedure
      .input(z.object({ noteId: z.number() }))
      .query(({ input }) => {
        return db.getNoteAssignees(input.noteId);
      }),
  }),
});

export type AppRouter = typeof appRouter;

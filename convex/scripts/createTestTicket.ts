/**
 * Script to create a test ticket for superadmin to see the issue
 * Run with: npx convex run scripts/createTestTicket.ts
 */

import { internalMutation } from "../_generated/server";
import { v } from "convex/values";

export default internalMutation({
  args: {},
  handler: async (ctx) => {
    // Find superadmin user
    const superadmin = await ctx.db
      .query("users")
      .filter((q) => q.eq(q.field("role"), "superadmin"))
      .first();

    if (!superadmin) {
      throw new Error("No superadmin user found");
    }

    // Create a test ticket
    const ticketId = await ctx.db.insert("helpTickets", {
      userId: superadmin._id,
      organizationId: superadmin.organizationId,
      title: "Тестовый тикет - Проблема с автоматизацией",
      description: "Это тестовый тикет для проверки работы системы тикетов.\n\nПроблема: Суперадмин хочет увидеть как выглядит тикет в системе.\n\nОжидаемое поведение: Тикет должен отображаться в списке тикетов суперадмина.",
      priority: "medium",
      category: "technical",
      status: "open",
      type: "bug",
      createdAt: Date.now(),
      updatedAt: Date.now(),
      isRead: false,
      assignedTo: undefined,
      resolvedAt: undefined,
      resolvedBy: undefined,
    });

    // Create initial comment
    await ctx.db.insert("helpTicketComments", {
      ticketId: ticketId as any,
      userId: superadmin._id,
      content: "Это первый комментарий в тестовом тикете. Создан автоматически для тестирования.",
      createdAt: Date.now(),
      isInternal: false,
    });

    return { 
      success: true, 
      ticketId,
      message: "Тестовый тикет создан!",
      superadminEmail: superadmin.email
    };
  },
});

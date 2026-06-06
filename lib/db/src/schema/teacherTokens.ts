import { pgTable, text, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const teacherTokensTable = pgTable("teacher_tokens", {
  token: text("token").primaryKey(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const insertTeacherTokenSchema = createInsertSchema(teacherTokensTable).omit({
  createdAt: true,
});
export type InsertTeacherToken = z.infer<typeof insertTeacherTokenSchema>;
export type TeacherToken = typeof teacherTokensTable.$inferSelect;

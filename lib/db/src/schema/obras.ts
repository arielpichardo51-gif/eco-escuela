import { pgTable, text, real, timestamp, pgEnum } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const obraStatusEnum = pgEnum("obra_status", ["pending", "approved", "rejected"]);

export const obrasTable = pgTable("obras", {
  id: text("id").primaryKey(),
  localId: text("local_id").notNull().unique(),
  studentName: text("student_name").notNull(),
  title: text("title").notNull(),
  description: text("description").notNull().default(""),
  category: text("category").notNull(),
  hours: real("hours").notNull(),
  date: text("date").notNull(),
  photo: text("photo"),
  status: obraStatusEnum("status").notNull().default("pending"),
  teacherComment: text("teacher_comment"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  reviewedAt: timestamp("reviewed_at", { withTimezone: true }),
});

export const insertObraSchema = createInsertSchema(obrasTable).omit({
  createdAt: true,
  reviewedAt: true,
});
export type InsertObra = z.infer<typeof insertObraSchema>;
export type Obra = typeof obrasTable.$inferSelect;

import { pgTable, text, serial, integer, boolean, jsonb, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  email: text("email").notNull().unique(),
  password: text("password").notNull(),
  isAdmin: boolean("is_admin").notNull().default(false),
  lastLogin: timestamp("last_login", { mode: 'string' }),
});

export const tatContent = pgTable("tat_content", {
  id: serial("id").primaryKey(),
  imageUrl: text("image_url").notNull(),
  active: boolean("active").notNull().default(true),
});

export const watContent = pgTable("wat_content", {
  id: serial("id").primaryKey(),
  word: text("word").notNull(),
  active: boolean("active").notNull().default(true),
});

export const srtContent = pgTable("srt_content", {
  id: serial("id").primaryKey(),
  scenario: text("scenario").notNull(),
  active: boolean("active").notNull().default(true),
});

export const studentSDTQuestions = pgTable("student_sdt_questions", {
  id: serial("id").primaryKey(),
  question: text("question").notNull(),
  active: boolean("active").notNull().default(true),
});

export const professionalSDTQuestions = pgTable("professional_sdt_questions", {
  id: serial("id").primaryKey(),
  question: text("question").notNull(),
  active: boolean("active").notNull().default(true),
});

// Insert schemas
export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  email: true,
  password: true,
  isAdmin: true,
  lastLogin: true,
});

export const insertTATContentSchema = createInsertSchema(tatContent).pick({
  imageUrl: true,
  active: true,
});

export const insertWATContentSchema = createInsertSchema(watContent).pick({
  word: true,
  active: true,
});

export const insertSRTContentSchema = createInsertSchema(srtContent).pick({
  scenario: true,
  active: true,
});

export const insertStudentSDTQuestionSchema = createInsertSchema(studentSDTQuestions).pick({
  question: true,
  active: true,
});

export const insertProfessionalSDTQuestionSchema = createInsertSchema(professionalSDTQuestions).pick({
  question: true,
  active: true,
});

// Types
export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

export type InsertTATContent = z.infer<typeof insertTATContentSchema>;
export type TATContent = typeof tatContent.$inferSelect;

export type InsertWATContent = z.infer<typeof insertWATContentSchema>;
export type WATContent = typeof watContent.$inferSelect;

export type InsertSRTContent = z.infer<typeof insertSRTContentSchema>;
export type SRTContent = typeof srtContent.$inferSelect;

export type InsertStudentSDTQuestion = z.infer<typeof insertStudentSDTQuestionSchema>;
export type StudentSDTQuestion = typeof studentSDTQuestions.$inferSelect;

export type InsertProfessionalSDTQuestion = z.infer<typeof insertProfessionalSDTQuestionSchema>;
export type ProfessionalSDTQuestion = typeof professionalSDTQuestions.$inferSelect;

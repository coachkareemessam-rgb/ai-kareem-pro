import { sql } from "drizzle-orm";
import { pgTable, text, varchar, integer, timestamp, boolean, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  name: text("name").notNull(),
  role: text("role").notNull().default("sdr"),
  email: text("email"),
});

export const insertUserSchema = createInsertSchema(users).omit({ id: true });
export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

export const deals = pgTable("deals", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  clientName: text("client_name").notNull(),
  clientType: text("client_type").notNull().default("trainer"),
  stage: text("stage").notNull().default("lead"),
  value: text("value"),
  owner: text("owner").notNull(),
  status: text("status").notNull().default("new"),
  awarenessLevel: text("awareness_level"),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertDealSchema = createInsertSchema(deals).omit({ id: true, createdAt: true });
export type InsertDeal = z.infer<typeof insertDealSchema>;
export type Deal = typeof deals.$inferSelect;

export const messages = pgTable("messages", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  conversationId: varchar("conversation_id").notNull(),
  role: text("role").notNull(),
  content: text("content").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertMessageSchema = createInsertSchema(messages).omit({ id: true, createdAt: true });
export type InsertMessage = z.infer<typeof insertMessageSchema>;
export type Message = typeof messages.$inferSelect;

export const conversations = pgTable("conversations", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  title: text("title").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertConversationSchema = createInsertSchema(conversations).omit({ id: true, createdAt: true });
export type InsertConversation = z.infer<typeof insertConversationSchema>;
export type Conversation = typeof conversations.$inferSelect;

export const knowledgeFiles = pgTable("knowledge_files", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  type: text("type").notNull(),
  size: text("size").notNull(),
  tag: text("tag").notNull().default("general"),
  content: text("content"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertKnowledgeFileSchema = createInsertSchema(knowledgeFiles).omit({ id: true, createdAt: true });
export type InsertKnowledgeFile = z.infer<typeof insertKnowledgeFileSchema>;
export type KnowledgeFile = typeof knowledgeFiles.$inferSelect;

export const sopSteps = pgTable("sop_steps", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  stepNumber: integer("step_number").notNull(),
  title: text("title").notNull(),
  objective: text("objective").notNull(),
  responsibleRole: text("responsible_role").notNull(),
  actions: text("actions").notNull(),
  successCriteria: text("success_criteria").notNull(),
  commonMistakes: text("common_mistakes"),
  nextStepYes: text("next_step_yes"),
  nextStepNo: text("next_step_no"),
});

export const insertSopStepSchema = createInsertSchema(sopSteps).omit({ id: true });
export type InsertSopStep = z.infer<typeof insertSopStepSchema>;
export type SopStep = typeof sopSteps.$inferSelect;

export const tasks = pgTable("tasks", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  title: text("title").notNull(),
  description: text("description"),
  priority: text("priority").notNull().default("medium"),
  status: text("status").notNull().default("pending"),
  category: text("category").notNull().default("general"),
  dueDate: text("due_date"),
  completedAt: timestamp("completed_at"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertTaskSchema = createInsertSchema(tasks).omit({ id: true, createdAt: true, completedAt: true });
export type InsertTask = z.infer<typeof insertTaskSchema>;
export type Task = typeof tasks.$inferSelect;

export const dailyReflections = pgTable("daily_reflections", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  date: text("date").notNull(),
  learned: text("learned").notNull(),
  shortcomings: text("shortcomings"),
  wins: text("wins"),
  goals: text("goals"),
  mood: integer("mood").default(3),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertDailyReflectionSchema = createInsertSchema(dailyReflections).omit({ id: true, createdAt: true });
export type InsertDailyReflection = z.infer<typeof insertDailyReflectionSchema>;
export type DailyReflection = typeof dailyReflections.$inferSelect;

export const clientQualifications = pgTable("client_qualifications", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  clientName: text("client_name").notNull(),
  clientType: text("client_type").notNull().default("trainer"),
  clientIndustry: text("client_industry"),
  clientDescription: text("client_description"),
  aiPainPoints: text("ai_pain_points"),
  dealId: varchar("deal_id"),
  budget: text("budget"),
  needLevel: integer("need_level").default(0),
  authorityLevel: integer("authority_level").default(0),
  timelineLevel: integer("timeline_level").default(0),
  fitLevel: integer("fit_level").default(0),
  totalScore: integer("total_score").default(0),
  qualificationResult: text("qualification_result").default("pending"),
  notes: text("notes"),
  actionPlan: text("action_plan"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertClientQualificationSchema = createInsertSchema(clientQualifications).omit({ id: true, createdAt: true });
export type InsertClientQualification = z.infer<typeof insertClientQualificationSchema>;
export type ClientQualification = typeof clientQualifications.$inferSelect;

export const referrals = pgTable("referrals", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  referrerName: text("referrer_name").notNull(),
  referrerDealId: varchar("referrer_deal_id"),
  referredName: text("referred_name").notNull(),
  referredPhone: text("referred_phone"),
  referredEmail: text("referred_email"),
  referredType: text("referred_type").default("trainer"),
  status: text("status").notNull().default("pending"),
  notes: text("notes"),
  followUpDate: text("follow_up_date"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertReferralSchema = createInsertSchema(referrals).omit({ id: true, createdAt: true });
export type InsertReferral = z.infer<typeof insertReferralSchema>;
export type Referral = typeof referrals.$inferSelect;

export const clientAnalyses = pgTable("client_analyses", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  clientName: text("client_name").notNull(),
  clientType: text("client_type").notNull().default("trainer"),
  field: text("field").notNull(),
  currentMethod: text("current_method"),
  targetAudience: text("target_audience"),
  experience: text("experience"),
  challenges: text("challenges"),
  goals: text("goals"),
  additionalInfo: text("additional_info"),
  aiAnalysis: text("ai_analysis"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertClientAnalysisSchema = createInsertSchema(clientAnalyses).omit({ id: true, createdAt: true });
export type InsertClientAnalysis = z.infer<typeof insertClientAnalysisSchema>;
export type ClientAnalysis = typeof clientAnalyses.$inferSelect;

export const csConversations = pgTable("cs_conversations", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  title: text("title").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertCSConversationSchema = createInsertSchema(csConversations).omit({ id: true, createdAt: true });
export type InsertCSConversation = z.infer<typeof insertCSConversationSchema>;
export type CSConversation = typeof csConversations.$inferSelect;

export const csMessages = pgTable("cs_messages", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  conversationId: varchar("conversation_id").notNull(),
  role: text("role").notNull(),
  content: text("content").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertCSMessageSchema = createInsertSchema(csMessages).omit({ id: true, createdAt: true });
export type InsertCSMessage = z.infer<typeof insertCSMessageSchema>;
export type CSMessage = typeof csMessages.$inferSelect;

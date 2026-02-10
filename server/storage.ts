import { db } from "./db";
import { eq, desc, ilike, sql } from "drizzle-orm";
import {
  users, deals, conversations, messages, knowledgeFiles, sopSteps, tasks, dailyReflections, clientQualifications, referrals, clientAnalyses, csConversations, csMessages,
  type User, type InsertUser,
  type Deal, type InsertDeal,
  type Conversation, type InsertConversation,
  type Message, type InsertMessage,
  type KnowledgeFile, type InsertKnowledgeFile,
  type SopStep, type InsertSopStep,
  type Task, type InsertTask,
  type DailyReflection, type InsertDailyReflection,
  type ClientQualification, type InsertClientQualification,
  type Referral, type InsertReferral,
  type ClientAnalysis, type InsertClientAnalysis,
  type CSConversation, type InsertCSConversation,
  type CSMessage, type InsertCSMessage,
} from "@shared/schema";

export interface IStorage {
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;

  getDeals(): Promise<Deal[]>;
  getDeal(id: string): Promise<Deal | undefined>;
  createDeal(deal: InsertDeal): Promise<Deal>;
  updateDeal(id: string, deal: Partial<InsertDeal>): Promise<Deal | undefined>;
  deleteDeal(id: string): Promise<void>;

  getConversations(): Promise<Conversation[]>;
  getConversation(id: string): Promise<Conversation | undefined>;
  createConversation(conv: InsertConversation): Promise<Conversation>;
  deleteConversation(id: string): Promise<void>;

  getMessages(conversationId: string): Promise<Message[]>;
  createMessage(msg: InsertMessage): Promise<Message>;

  getKnowledgeFiles(): Promise<KnowledgeFile[]>;
  getKnowledgeFile(id: string): Promise<KnowledgeFile | undefined>;
  createKnowledgeFile(file: InsertKnowledgeFile): Promise<KnowledgeFile>;
  deleteKnowledgeFile(id: string): Promise<void>;

  getSopSteps(): Promise<SopStep[]>;
  getSopStep(id: string): Promise<SopStep | undefined>;
  createSopStep(step: InsertSopStep): Promise<SopStep>;
  updateSopStep(id: string, step: Partial<InsertSopStep>): Promise<SopStep | undefined>;

  getTasks(): Promise<Task[]>;
  getTask(id: string): Promise<Task | undefined>;
  createTask(task: InsertTask): Promise<Task>;
  updateTask(id: string, task: Partial<InsertTask & { completedAt: Date | null }>): Promise<Task | undefined>;
  deleteTask(id: string): Promise<void>;

  getDailyReflections(): Promise<DailyReflection[]>;
  getDailyReflection(id: string): Promise<DailyReflection | undefined>;
  getDailyReflectionByDate(date: string): Promise<DailyReflection | undefined>;
  createDailyReflection(reflection: InsertDailyReflection): Promise<DailyReflection>;
  updateDailyReflection(id: string, reflection: Partial<InsertDailyReflection>): Promise<DailyReflection | undefined>;
  deleteDailyReflection(id: string): Promise<void>;

  getClientQualifications(): Promise<ClientQualification[]>;
  getClientQualification(id: string): Promise<ClientQualification | undefined>;
  createClientQualification(q: InsertClientQualification): Promise<ClientQualification>;
  updateClientQualification(id: string, q: Partial<InsertClientQualification>): Promise<ClientQualification | undefined>;
  deleteClientQualification(id: string): Promise<void>;

  getReferrals(): Promise<Referral[]>;
  getReferral(id: string): Promise<Referral | undefined>;
  createReferral(r: InsertReferral): Promise<Referral>;
  updateReferral(id: string, r: Partial<InsertReferral>): Promise<Referral | undefined>;
  deleteReferral(id: string): Promise<void>;

  getClientAnalyses(): Promise<ClientAnalysis[]>;
  getClientAnalysis(id: string): Promise<ClientAnalysis | undefined>;
  createClientAnalysis(a: InsertClientAnalysis): Promise<ClientAnalysis>;
  updateClientAnalysis(id: string, a: Partial<InsertClientAnalysis>): Promise<ClientAnalysis | undefined>;
  deleteClientAnalysis(id: string): Promise<void>;

  getCSConversations(): Promise<CSConversation[]>;
  createCSConversation(conv: InsertCSConversation): Promise<CSConversation>;
  deleteCSConversation(id: string): Promise<void>;
  getCSMessages(conversationId: string): Promise<CSMessage[]>;
  createCSMessage(msg: InsertCSMessage): Promise<CSMessage>;
}

export class DatabaseStorage implements IStorage {
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user;
  }

  async createUser(user: InsertUser): Promise<User> {
    const [created] = await db.insert(users).values(user).returning();
    return created;
  }

  async getDeals(): Promise<Deal[]> {
    return db.select().from(deals).orderBy(desc(deals.createdAt));
  }

  async getDeal(id: string): Promise<Deal | undefined> {
    const [deal] = await db.select().from(deals).where(eq(deals.id, id));
    return deal;
  }

  async createDeal(deal: InsertDeal): Promise<Deal> {
    const [created] = await db.insert(deals).values(deal).returning();
    return created;
  }

  async updateDeal(id: string, deal: Partial<InsertDeal>): Promise<Deal | undefined> {
    const [updated] = await db.update(deals).set(deal).where(eq(deals.id, id)).returning();
    return updated;
  }

  async deleteDeal(id: string): Promise<void> {
    await db.delete(deals).where(eq(deals.id, id));
  }

  async getConversations(): Promise<Conversation[]> {
    return db.select().from(conversations).orderBy(desc(conversations.createdAt));
  }

  async getConversation(id: string): Promise<Conversation | undefined> {
    const [conv] = await db.select().from(conversations).where(eq(conversations.id, id));
    return conv;
  }

  async createConversation(conv: InsertConversation): Promise<Conversation> {
    const [created] = await db.insert(conversations).values(conv).returning();
    return created;
  }

  async deleteConversation(id: string): Promise<void> {
    await db.delete(messages).where(eq(messages.conversationId, id));
    await db.delete(conversations).where(eq(conversations.id, id));
  }

  async getMessages(conversationId: string): Promise<Message[]> {
    return db.select().from(messages).where(eq(messages.conversationId, conversationId)).orderBy(messages.createdAt);
  }

  async createMessage(msg: InsertMessage): Promise<Message> {
    const [created] = await db.insert(messages).values(msg).returning();
    return created;
  }

  async getKnowledgeFiles(): Promise<KnowledgeFile[]> {
    return db.select().from(knowledgeFiles).orderBy(desc(knowledgeFiles.createdAt));
  }

  async getKnowledgeFile(id: string): Promise<KnowledgeFile | undefined> {
    const [file] = await db.select().from(knowledgeFiles).where(eq(knowledgeFiles.id, id));
    return file;
  }

  async createKnowledgeFile(file: InsertKnowledgeFile): Promise<KnowledgeFile> {
    const [created] = await db.insert(knowledgeFiles).values(file).returning();
    return created;
  }

  async deleteKnowledgeFile(id: string): Promise<void> {
    await db.delete(knowledgeFiles).where(eq(knowledgeFiles.id, id));
  }

  async getSopSteps(): Promise<SopStep[]> {
    return db.select().from(sopSteps).orderBy(sopSteps.stepNumber);
  }

  async getSopStep(id: string): Promise<SopStep | undefined> {
    const [step] = await db.select().from(sopSteps).where(eq(sopSteps.id, id));
    return step;
  }

  async createSopStep(step: InsertSopStep): Promise<SopStep> {
    const [created] = await db.insert(sopSteps).values(step).returning();
    return created;
  }

  async updateSopStep(id: string, step: Partial<InsertSopStep>): Promise<SopStep | undefined> {
    const [updated] = await db.update(sopSteps).set(step).where(eq(sopSteps.id, id)).returning();
    return updated;
  }

  async getTasks(): Promise<Task[]> {
    return db.select().from(tasks).orderBy(desc(tasks.createdAt));
  }

  async getTask(id: string): Promise<Task | undefined> {
    const [task] = await db.select().from(tasks).where(eq(tasks.id, id));
    return task;
  }

  async createTask(task: InsertTask): Promise<Task> {
    const [created] = await db.insert(tasks).values(task).returning();
    return created;
  }

  async updateTask(id: string, task: Partial<InsertTask & { completedAt: Date | null }>): Promise<Task | undefined> {
    const [updated] = await db.update(tasks).set(task).where(eq(tasks.id, id)).returning();
    return updated;
  }

  async deleteTask(id: string): Promise<void> {
    await db.delete(tasks).where(eq(tasks.id, id));
  }

  async getDailyReflections(): Promise<DailyReflection[]> {
    return db.select().from(dailyReflections).orderBy(desc(dailyReflections.createdAt));
  }

  async getDailyReflection(id: string): Promise<DailyReflection | undefined> {
    const [r] = await db.select().from(dailyReflections).where(eq(dailyReflections.id, id));
    return r;
  }

  async getDailyReflectionByDate(date: string): Promise<DailyReflection | undefined> {
    const [r] = await db.select().from(dailyReflections).where(eq(dailyReflections.date, date));
    return r;
  }

  async createDailyReflection(reflection: InsertDailyReflection): Promise<DailyReflection> {
    const [created] = await db.insert(dailyReflections).values(reflection).returning();
    return created;
  }

  async updateDailyReflection(id: string, reflection: Partial<InsertDailyReflection>): Promise<DailyReflection | undefined> {
    const [updated] = await db.update(dailyReflections).set(reflection).where(eq(dailyReflections.id, id)).returning();
    return updated;
  }

  async deleteDailyReflection(id: string): Promise<void> {
    await db.delete(dailyReflections).where(eq(dailyReflections.id, id));
  }

  async getClientQualifications(): Promise<ClientQualification[]> {
    return db.select().from(clientQualifications).orderBy(desc(clientQualifications.createdAt));
  }

  async getClientQualification(id: string): Promise<ClientQualification | undefined> {
    const [q] = await db.select().from(clientQualifications).where(eq(clientQualifications.id, id));
    return q;
  }

  async createClientQualification(q: InsertClientQualification): Promise<ClientQualification> {
    const [created] = await db.insert(clientQualifications).values(q).returning();
    return created;
  }

  async updateClientQualification(id: string, q: Partial<InsertClientQualification>): Promise<ClientQualification | undefined> {
    const [updated] = await db.update(clientQualifications).set(q).where(eq(clientQualifications.id, id)).returning();
    return updated;
  }

  async deleteClientQualification(id: string): Promise<void> {
    await db.delete(clientQualifications).where(eq(clientQualifications.id, id));
  }

  async getReferrals(): Promise<Referral[]> {
    return db.select().from(referrals).orderBy(desc(referrals.createdAt));
  }

  async getReferral(id: string): Promise<Referral | undefined> {
    const [r] = await db.select().from(referrals).where(eq(referrals.id, id));
    return r;
  }

  async createReferral(r: InsertReferral): Promise<Referral> {
    const [created] = await db.insert(referrals).values(r).returning();
    return created;
  }

  async updateReferral(id: string, r: Partial<InsertReferral>): Promise<Referral | undefined> {
    const [updated] = await db.update(referrals).set(r).where(eq(referrals.id, id)).returning();
    return updated;
  }

  async deleteReferral(id: string): Promise<void> {
    await db.delete(referrals).where(eq(referrals.id, id));
  }

  async getClientAnalyses(): Promise<ClientAnalysis[]> {
    return db.select().from(clientAnalyses).orderBy(desc(clientAnalyses.createdAt));
  }

  async getClientAnalysis(id: string): Promise<ClientAnalysis | undefined> {
    const [a] = await db.select().from(clientAnalyses).where(eq(clientAnalyses.id, id));
    return a;
  }

  async createClientAnalysis(a: InsertClientAnalysis): Promise<ClientAnalysis> {
    const [created] = await db.insert(clientAnalyses).values(a).returning();
    return created;
  }

  async updateClientAnalysis(id: string, a: Partial<InsertClientAnalysis>): Promise<ClientAnalysis | undefined> {
    const [updated] = await db.update(clientAnalyses).set(a).where(eq(clientAnalyses.id, id)).returning();
    return updated;
  }

  async deleteClientAnalysis(id: string): Promise<void> {
    await db.delete(clientAnalyses).where(eq(clientAnalyses.id, id));
  }

  async getCSConversations(): Promise<CSConversation[]> {
    return db.select().from(csConversations).orderBy(desc(csConversations.createdAt));
  }

  async createCSConversation(conv: InsertCSConversation): Promise<CSConversation> {
    const [created] = await db.insert(csConversations).values(conv).returning();
    return created;
  }

  async deleteCSConversation(id: string): Promise<void> {
    await db.delete(csMessages).where(eq(csMessages.conversationId, id));
    await db.delete(csConversations).where(eq(csConversations.id, id));
  }

  async getCSMessages(conversationId: string): Promise<CSMessage[]> {
    return db.select().from(csMessages).where(eq(csMessages.conversationId, conversationId)).orderBy(csMessages.createdAt);
  }

  async createCSMessage(msg: InsertCSMessage): Promise<CSMessage> {
    const [created] = await db.insert(csMessages).values(msg).returning();
    return created;
  }
}

export const storage = new DatabaseStorage();

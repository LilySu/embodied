import { sql } from "drizzle-orm";
import { pgTable, varchar, jsonb, timestamp, text, real, integer, boolean } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { users } from "./auth";

export const profiles = pgTable("profiles", {
  userId: varchar("user_id").primaryKey().references(() => users.id),
  displayName: varchar("display_name"),
  city: varchar("city"),
  latitude: real("latitude"),
  longitude: real("longitude"),
  sessionData: jsonb("session_data"),
  bio: text("bio"),
  goals: text("goals"),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const matches = pgTable("matches", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId1: varchar("user_id_1").notNull().references(() => users.id),
  userId2: varchar("user_id_2").notNull().references(() => users.id),
  similarityScore: real("similarity_score").notNull(),
  status: varchar("status").notNull().default("pending"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const messages = pgTable("messages", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  matchId: varchar("match_id").notNull().references(() => matches.id),
  senderId: varchar("sender_id").notNull().references(() => users.id),
  content: text("content").notNull(),
  messageType: varchar("message_type").notNull().default("text"),
  createdAt: timestamp("created_at").defaultNow(),
  read: boolean("read").default(false),
});

export const profilesRelations = relations(profiles, ({ one }) => ({
  user: one(users, { fields: [profiles.userId], references: [users.id] }),
}));

export const matchesRelations = relations(matches, ({ one, many }) => ({
  user1: one(users, { fields: [matches.userId1], references: [users.id], relationName: "matchUser1" }),
  user2: one(users, { fields: [matches.userId2], references: [users.id], relationName: "matchUser2" }),
  messages: many(messages),
}));

export const messagesRelations = relations(messages, ({ one }) => ({
  match: one(matches, { fields: [messages.matchId], references: [matches.id] }),
  sender: one(users, { fields: [messages.senderId], references: [users.id] }),
}));

export type Profile = typeof profiles.$inferSelect;
export type InsertProfile = typeof profiles.$inferInsert;
export type Match = typeof matches.$inferSelect;
export type Message = typeof messages.$inferSelect;

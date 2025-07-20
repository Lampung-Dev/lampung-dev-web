import { pgTable, text, timestamp, index, uuid, varchar } from "drizzle-orm/pg-core";
import { relations, type InferSelectModel } from "drizzle-orm";

export const userTable = pgTable("user", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: varchar("name", { length: 50 }).notNull(),
  email: text("email").notNull().unique(),
  picture: text("picture").notNull(),
  title: varchar("title", { length: 100 }),
  passwordHash: text("password_hash"),
  role: text("role", { enum: ['ADMIN', 'MODERATOR', 'USER'] })
    .default("USER")
    .notNull(),
  status: text("status", { enum: ['ACTIVE', 'INACTIVE', 'BANNED'] })
    .default("ACTIVE")
    .notNull(),
  createdAt: timestamp("created_at", {
    withTimezone: true,
    mode: "date"
  }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", {
    withTimezone: true,
    mode: "date"
  }).defaultNow().notNull(),
}, (table) => [
  index('user_email_idx').on(table.email),
  index('user_status_idx').on(table.status),
]);

export const sessionTable = pgTable("session", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id")
    .notNull()
    .references(() => userTable.id),
  expiresAt: timestamp("expires_at", {
    withTimezone: true,
    mode: "date",
  }).notNull(),
}, (table) => [
  index("session_user_id_idx").on(table.userId),
  index("session_expires_at_idx").on(table.expiresAt),
])

export const socialMediaTable = pgTable("social_media", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id")
    .notNull()
    .references(() => userTable.id),
  platform: text("platform").notNull(),
  link: text("link").notNull(),
}, (table) => [
  index("social_media_user_id_idx").on(table.userId)
]);

// Define relations for the user table
export const userRelations = relations(userTable, ({ many }) => ({
  socialMedia: many(socialMediaTable),
}));

// Define relations for the social media table
export const socialMediaRelations = relations(socialMediaTable, ({ one }) => ({
  user: one(userTable, {
    fields: [socialMediaTable.userId],
    references: [userTable.id],
  }),
}));

export type TUser = InferSelectModel<typeof userTable>;
export type TSession = InferSelectModel<typeof sessionTable>;
export type TSocialMedia = InferSelectModel<typeof socialMediaTable>;
import { pgTable, text, timestamp, index, uuid, varchar, integer, boolean } from "drizzle-orm/pg-core";
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

// Event Type Master table
export const eventTypeTable = pgTable("event_type", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: varchar("name", { length: 100 }).notNull().unique(),
  description: text("description"),
  color: varchar("color", { length: 7 }), // hex color for badge, e.g., #3B82F6
  createdAt: timestamp("created_at", {
    withTimezone: true,
    mode: "date"
  }).defaultNow().notNull(),
}, (table) => [
  index("event_type_name_idx").on(table.name),
]);

// Event table
export const eventTable = pgTable("event", {
  id: uuid("id").primaryKey().defaultRandom(),
  title: varchar("title", { length: 200 }).notNull(),
  slug: varchar("slug", { length: 250 }).notNull().unique(),
  description: text("description").notNull(), // HTML content from rich text editor
  eventTypeId: uuid("event_type_id").references(() => eventTypeTable.id),
  location: varchar("location", { length: 300 }).notNull(),
  locationMapUrl: text("location_map_url"),
  imageUrl: text("image_url").notNull(),
  instagramUrl: text("instagram_url"),
  eventDate: timestamp("event_date", {
    withTimezone: true,
    mode: "date"
  }).notNull(),
  maxCapacity: integer("max_capacity"), // null = unlimited
  registrationStatus: text("registration_status", { enum: ['OPEN', 'CLOSED'] })
    .default("OPEN")
    .notNull(),
  createdBy: uuid("created_by").references(() => userTable.id),
  createdAt: timestamp("created_at", {
    withTimezone: true,
    mode: "date"
  }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", {
    withTimezone: true,
    mode: "date"
  }).defaultNow().notNull(),
}, (table) => [
  index("event_slug_idx").on(table.slug),
  index("event_date_idx").on(table.eventDate),
  index("event_reg_status_idx").on(table.registrationStatus),
]);

// Event Registration table (user joins + attendance + waiting list)
export const eventRegistrationTable = pgTable("event_registration", {
  id: uuid("id").primaryKey().defaultRandom(),
  eventId: uuid("event_id")
    .notNull()
    .references(() => eventTable.id, { onDelete: "cascade" }),
  userId: uuid("user_id")
    .notNull()
    .references(() => userTable.id, { onDelete: "cascade" }),
  status: text("status", { enum: ['REGISTERED', 'WAITING_LIST', 'CANCELLED'] })
    .default("REGISTERED")
    .notNull(),
  registeredAt: timestamp("registered_at", {
    withTimezone: true,
    mode: "date"
  }).defaultNow().notNull(),
  attended: boolean("attended").default(false).notNull(),
  attendedAt: timestamp("attended_at", {
    withTimezone: true,
    mode: "date"
  }),
}, (table) => [
  index("event_registration_event_idx").on(table.eventId),
  index("event_registration_user_idx").on(table.userId),
  index("event_registration_status_idx").on(table.status),
]);

// Define relations for the user table
export const userRelations = relations(userTable, ({ many }) => ({
  socialMedia: many(socialMediaTable),
  eventsCreated: many(eventTable),
  eventRegistrations: many(eventRegistrationTable),
}));

// Define relations for the social media table
export const socialMediaRelations = relations(socialMediaTable, ({ one }) => ({
  user: one(userTable, {
    fields: [socialMediaTable.userId],
    references: [userTable.id],
  }),
}));

// Define relations for the event type table
export const eventTypeRelations = relations(eventTypeTable, ({ many }) => ({
  events: many(eventTable),
}));

// Define relations for the event table
export const eventRelations = relations(eventTable, ({ one, many }) => ({
  eventType: one(eventTypeTable, {
    fields: [eventTable.eventTypeId],
    references: [eventTypeTable.id],
  }),
  createdByUser: one(userTable, {
    fields: [eventTable.createdBy],
    references: [userTable.id],
  }),
  registrations: many(eventRegistrationTable),
}));

// Define relations for the event registration table
export const eventRegistrationRelations = relations(eventRegistrationTable, ({ one }) => ({
  event: one(eventTable, {
    fields: [eventRegistrationTable.eventId],
    references: [eventTable.id],
  }),
  user: one(userTable, {
    fields: [eventRegistrationTable.userId],
    references: [userTable.id],
  }),
}));

export type TUser = InferSelectModel<typeof userTable>;
export type TSession = InferSelectModel<typeof sessionTable>;
export type TSocialMedia = InferSelectModel<typeof socialMediaTable>;
export type TEventType = InferSelectModel<typeof eventTypeTable>;
export type TEvent = InferSelectModel<typeof eventTable>;
export type TEventRegistration = InferSelectModel<typeof eventRegistrationTable>;
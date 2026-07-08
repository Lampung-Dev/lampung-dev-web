import { pgTable, text, timestamp, index, uuid, varchar, integer, boolean, jsonb, doublePrecision } from "drizzle-orm/pg-core";
import { relations, type InferSelectModel } from "drizzle-orm";

export const companyTable = pgTable("company", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: varchar("name", { length: 200 }).notNull(),
  slug: varchar("slug", { length: 250 }).notNull().unique(),
  description: text("description"),
  logoUrl: text("logo_url"),
  website: text("website"),
  address: text("address"),
  latitude: doublePrecision("latitude"),
  longitude: doublePrecision("longitude"),
  mapsUrl: text("maps_url"),
  createdAt: timestamp("created_at", { withTimezone: true, mode: "date" }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true, mode: "date" }).defaultNow().notNull(),
}, (table) => [
  index("company_slug_idx").on(table.slug),
]);

export const userTable = pgTable("user", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: varchar("name", { length: 250 }).notNull(),
  email: text("email").notNull().unique(),
  picture: text("picture").notNull(),
  title: varchar("title", { length: 100 }),
  passwordHash: text("password_hash"),
  role: text("role", { enum: ['ADMIN', 'MODERATOR', 'USER', 'MITRA'] })
    .default("USER")
    .notNull(),
  status: text("status", { enum: ['ACTIVE', 'INACTIVE', 'BANNED'] })
    .default("ACTIVE")
    .notNull(),
  companyId: uuid("company_id").references(() => companyTable.id, { onDelete: "set null" }),
  latitude: text("latitude"),
  longitude: text("longitude"),
  locationName: text("location_name"),
  employmentStatus: text("employment_status"),
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
  index('user_company_idx').on(table.companyId),
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
  entryFee: integer("entry_fee").default(0).notNull(), // in IDR, 0 = free
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

export const eventTransactionTable = pgTable("event_transaction", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id")
    .notNull()
    .references(() => userTable.id, { onDelete: "cascade" }),
  eventId: uuid("event_id")
    .notNull()
    .references(() => eventTable.id, { onDelete: "cascade" }),
  amount: integer("amount").notNull(),
  status: text("status", {
    enum: ["PENDING", "SUCCESS", "FAILED", "EXPIRED"],
  })
    .default("PENDING")
    .notNull(),
  provider: text("provider").default("XENITH").notNull(),
  externalId: text("external_id"),
  referenceCode: text("reference_code").unique(),
  isProcessed: boolean("is_processed").default(false).notNull(),
  payinId: varchar("payin_id", { length: 100 }),
  paymentMethod: text("payment_method"),
  paymentChannel: text("payment_channel"),
  paymentAmount: integer("payment_amount"),
  feeAmount: integer("fee_amount"),
  paidAt: timestamp("paid_at"),
  paymentCode: text("payment_code"),
  rawCallback: jsonb("raw_callback"),
  createdAt: timestamp("created_at", {
    withTimezone: true,
    mode: "date",
  })
    .defaultNow()
    .notNull(),
  updatedAt: timestamp("updated_at", {
    withTimezone: true,
    mode: "date",
  })
    .defaultNow()
    .notNull(),
}, (table) => [
  index("event_trx_user_idx").on(table.userId),
  index("event_trx_event_idx").on(table.eventId),
  index("event_trx_status_idx").on(table.status),
]);

// Define relations for the user table
export const userRelations = relations(userTable, ({ one, many }) => ({
  socialMedia: many(socialMediaTable),
  eventsCreated: many(eventTable),
  eventRegistrations: many(eventRegistrationTable),
  company: one(companyTable, {
    fields: [userTable.companyId],
    references: [companyTable.id],
  }),
  jobApplications: many(jobApplicationTable),
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

export const eventTransactionRelations = relations(
  eventTransactionTable,
  ({ one }) => ({
    user: one(userTable, {
      fields: [eventTransactionTable.userId],
      references: [userTable.id],
    }),
    event: one(eventTable, {
      fields: [eventTransactionTable.eventId],
      references: [eventTable.id],
    }),
  })
);

// Sponsor table
export const sponsorTable = pgTable("sponsor", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: varchar("name", { length: 200 }).notNull(),
  logoUrl: text("logo_url").notNull(),
  websiteUrl: text("website_url"),
  category: text("category", {
    enum: ['HIGH_PRIORITY', 'GOLD', 'SILVER', 'COMMUNITY_PARTNER']
  }).notNull(),
  description: text("description"),
  isActive: boolean("is_active").default(true).notNull(),
  displayOrder: integer("display_order").default(0).notNull(),
  createdAt: timestamp("created_at", {
    withTimezone: true,
    mode: "date"
  }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", {
    withTimezone: true,
    mode: "date"
  }).defaultNow().notNull(),
}, (table) => [
  index("sponsor_category_idx").on(table.category),
  index("sponsor_active_idx").on(table.isActive),
  index("sponsor_order_idx").on(table.displayOrder),
]);

export const jobCategoryTable = pgTable("job_category", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: varchar("name", { length: 100 }).notNull().unique(),
  slug: varchar("slug", { length: 100 }).notNull().unique(),
  createdAt: timestamp("created_at", { withTimezone: true, mode: "date" }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true, mode: "date" }).defaultNow().notNull(),
});

// Job table
export const jobTable = pgTable("job", {
  id: uuid("id").primaryKey().defaultRandom(),
  title: varchar("title", { length: 200 }).notNull(),
  slug: varchar("slug", { length: 250 }).notNull().unique(),
  company: varchar("company", { length: 200 }).notNull(),
  companyInitial: varchar("company_initial", { length: 5 }).notNull(),
  location: varchar("location", { length: 200 }).notNull(),
  category: text("category"),
  type: text("type", {
    enum: ["Penuh Waktu", "Paruh Waktu", "Magang", "Remote"],
  }).notNull(),
  salary: varchar("salary", { length: 100 }).notNull(),
  experience: varchar("experience", { length: 100 }).notNull(),
  education: varchar("education", { length: 100 }).notNull(),
  skills: jsonb("skills").$type<string[]>().notNull().default([]),
  isPremium: boolean("is_premium").default(false).notNull(),
  isFeatured: boolean("is_featured").default(false).notNull(),
  isActive: boolean("is_active").default(true).notNull(),
  description: text("description").notNull(),
  responsibilities: jsonb("responsibilities").$type<string[]>().notNull().default([]),
  requirements: jsonb("requirements").$type<string[]>().notNull().default([]),
  benefits: jsonb("benefits").$type<string[]>().notNull().default([]),
  createdBy: uuid("created_by").references(() => userTable.id, { onDelete: "set null" }),
  companyId: uuid("company_id").references(() => companyTable.id, { onDelete: "set null" }),
  createdAt: timestamp("created_at", { withTimezone: true, mode: "date" }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true, mode: "date" }).defaultNow().notNull(),
}, (table) => [
  index("job_category_idx").on(table.category),
  index("job_is_active_idx").on(table.isActive),
  index("job_created_at_idx").on(table.createdAt),
  index("job_company_idx").on(table.companyId),
  index("job_slug_idx").on(table.slug),
]);

export const jobApplicationTable = pgTable("job_application", {
  id: uuid("id").primaryKey().defaultRandom(),
  jobId: uuid("job_id").notNull().references(() => jobTable.id, { onDelete: "cascade" }),
  userId: uuid("user_id").notNull().references(() => userTable.id, { onDelete: "cascade" }),
  fullName: varchar("full_name", { length: 250 }).notNull(),
  email: text("email").notNull(),
  phone: varchar("phone", { length: 50 }).notNull(),
  linkedin: text("linkedin"),
  portfolio: text("portfolio"),
  resumeUrl: text("resume_url").notNull(),
  expectedSalary: varchar("expected_salary", { length: 100 }),
  availability: varchar("availability", { length: 100 }).notNull(),
  coverLetter: text("cover_letter").notNull(),
  employmentStatus: varchar("employment_status", { length: 100 }),
  status: varchar("status", { length: 50 }).default("PENDING").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true, mode: "date" }).defaultNow().notNull(),
});

export const companyRelations = relations(companyTable, ({ many }) => ({
  users: many(userTable),
  jobs: many(jobTable),
}));

export const jobRelations = relations(jobTable, ({ one, many }) => ({
  createdByUser: one(userTable, {
    fields: [jobTable.createdBy],
    references: [userTable.id],
  }),
  companyRelation: one(companyTable, {
    fields: [jobTable.companyId],
    references: [companyTable.id],
  }),
  applications: many(jobApplicationTable),
}));

export const jobApplicationRelations = relations(jobApplicationTable, ({ one }) => ({
  job: one(jobTable, {
    fields: [jobApplicationTable.jobId],
    references: [jobTable.id],
  }),
  user: one(userTable, {
    fields: [jobApplicationTable.userId],
    references: [userTable.id],
  }),
}));

export type TUser = InferSelectModel<typeof userTable>;
export type TSession = InferSelectModel<typeof sessionTable>;
export type TSocialMedia = InferSelectModel<typeof socialMediaTable>;
export type TEventType = InferSelectModel<typeof eventTypeTable>;
export type TEvent = InferSelectModel<typeof eventTable>;
export type TEventRegistration = InferSelectModel<typeof eventRegistrationTable>;
export type TSponsor = InferSelectModel<typeof sponsorTable>;
export type TEventTransaction = InferSelectModel<typeof eventTransactionTable>;
export type TJob = InferSelectModel<typeof jobTable>;
export type TCompany = InferSelectModel<typeof companyTable>;
export type TJobApplication = InferSelectModel<typeof jobApplicationTable>;
export type TJobCategory = InferSelectModel<typeof jobCategoryTable>;
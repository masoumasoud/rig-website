import { sql } from "drizzle-orm";
import { index, integer, sqliteTable, text } from "drizzle-orm/sqlite-core";
import type { L } from "@/i18n/config";

const now = sql`(unixepoch() * 1000)`;
const timestamps = {
  createdAt: integer("created_at", { mode: "timestamp_ms" }).notNull().default(now),
  updatedAt: integer("updated_at", { mode: "timestamp_ms" }).notNull().default(now),
};

export type Seo = { metaTitle?: string; metaDescription?: string };

/* ---------------------------------- content --------------------------------- */

export type ServiceText = Seo & {
  title: string;
  summary: string;
  /** Sanitized HTML. */
  body: string;
  bullets?: string[];
};

export const services = sqliteTable("services", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  slug: text("slug").notNull().unique(),
  icon: text("icon").notNull().default("mill"),
  imageId: integer("image_id"),
  sort: integer("sort").notNull().default(0),
  published: integer("published", { mode: "boolean" }).notNull().default(true),
  text: text("text", { mode: "json" }).$type<L<ServiceText>>().notNull(),
  ...timestamps,
});

export type Spec = { label: L<string>; value: L<string> };
export type EquipmentText = { name: string; description: string };

export const equipment = sqliteTable("equipment", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  kind: text("kind", { enum: ["machine", "measure"] }).notNull().default("machine"),
  drawing: text("drawing").notNull().default("mill"),
  imageId: integer("image_id"),
  sort: integer("sort").notNull().default(0),
  published: integer("published", { mode: "boolean" }).notNull().default(true),
  /** Headline figure such as "0.01 mm". */
  precision: text("precision"),
  specs: text("specs", { mode: "json" }).$type<Spec[]>().notNull().default([]),
  text: text("text", { mode: "json" }).$type<L<EquipmentText>>().notNull(),
  ...timestamps,
});

export type ProjectText = Seo & {
  title: string;
  summary: string;
  body: string;
  material?: string;
  industry?: string;
};

export const projects = sqliteTable("projects", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  slug: text("slug").notNull().unique(),
  imageIds: text("image_ids", { mode: "json" }).$type<number[]>().notNull().default([]),
  serviceSlugs: text("service_slugs", { mode: "json" }).$type<string[]>().notNull().default([]),
  sort: integer("sort").notNull().default(0),
  published: integer("published", { mode: "boolean" }).notNull().default(true),
  text: text("text", { mode: "json" }).$type<L<ProjectText>>().notNull(),
  ...timestamps,
});

export type FaqText = { q: string; a: string };

export const faqs = sqliteTable("faqs", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  sort: integer("sort").notNull().default(0),
  published: integer("published", { mode: "boolean" }).notNull().default(true),
  text: text("text", { mode: "json" }).$type<L<FaqText>>().notNull(),
  ...timestamps,
});

/** Free-form localized page blocks (home hero, about, process...), keyed by page. */
export const pages = sqliteTable("pages", {
  key: text("key").primaryKey(),
  data: text("data", { mode: "json" }).$type<L<Record<string, string>>>().notNull(),
  ...timestamps,
});

export const media = sqliteTable("media", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  file: text("file").notNull(),
  width: integer("width").notNull(),
  height: integer("height").notNull(),
  alt: text("alt", { mode: "json" }).$type<L<string>>().notNull().default({}),
  ...timestamps,
});

/** Key/value site settings (contact info, analytics IDs, verification codes...). */
export const settings = sqliteTable("settings", {
  key: text("key").primaryKey(),
  value: text("value", { mode: "json" }).$type<unknown>().notNull(),
});

/* ---------------------------------- inbox ----------------------------------- */

export type InquiryDetails = {
  company?: string;
  quantity?: string;
  material?: string;
  deadline?: string;
  service?: string;
};

export const conversations = sqliteTable(
  "conversations",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    subject: text("subject").notNull(),
    name: text("name").notNull(),
    email: text("email"),
    phone: text("phone"),
    locale: text("locale").notNull().default("fa"),
    source: text("source", { enum: ["form", "email"] }).notNull(),
    status: text("status", { enum: ["new", "open", "answered", "closed"] })
      .notNull()
      .default("new"),
    details: text("details", { mode: "json" }).$type<InquiryDetails>().notNull().default({}),
    unread: integer("unread", { mode: "boolean" }).notNull().default(true),
    lastMessageAt: integer("last_message_at", { mode: "timestamp_ms" }).notNull().default(now),
    ...timestamps,
  },
  (t) => [index("conv_status_idx").on(t.status), index("conv_email_idx").on(t.email)],
);

export type Attachment = { file: string; name: string; size: number; type: string };

export const messages = sqliteTable(
  "messages",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    conversationId: integer("conversation_id")
      .notNull()
      .references(() => conversations.id, { onDelete: "cascade" }),
    direction: text("direction", { enum: ["in", "out"] }).notNull(),
    body: text("body").notNull(),
    /** RFC 5322 Message-ID, used to thread email replies. */
    messageId: text("message_id"),
    attachments: text("attachments", { mode: "json" }).$type<Attachment[]>().notNull().default([]),
    authorId: integer("author_id"),
    deliveryError: text("delivery_error"),
    createdAt: integer("created_at", { mode: "timestamp_ms" }).notNull().default(now),
  },
  (t) => [index("msg_conv_idx").on(t.conversationId), index("msg_mid_idx").on(t.messageId)],
);

/* ---------------------------------- auth ------------------------------------ */

export const users = sqliteTable("users", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  ...timestamps,
});

export const sessions = sqliteTable("sessions", {
  id: text("id").primaryKey(),
  userId: integer("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  expiresAt: integer("expires_at", { mode: "timestamp_ms" }).notNull(),
});

/** Sliding-window rate limit counters (form submissions, logins). */
export const rateLimits = sqliteTable("rate_limits", {
  key: text("key").primaryKey(),
  count: integer("count").notNull(),
  resetAt: integer("reset_at").notNull(),
});

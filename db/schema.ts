import { pgTable, text, serial, integer, boolean, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";

export const notes = pgTable("notes", {
  id: serial("id").primaryKey(),
  text: text("text").notNull(),
  audioUrl: text("audio_url"),
  timestamp: integer("timestamp").notNull(),
  transcribed: boolean("transcribed").default(false).notNull(),
  synced: boolean("synced").default(false).notNull(),
});

export const tasks = pgTable("tasks", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  status: text("status").default('not_started').notNull(),
  priority: text("priority").default('medium').notNull(),
  scheduledStart: integer("scheduled_start"),
  scheduledEnd: integer("scheduled_end"),
  estimatedHours: integer("estimated_hours"),
  actualHours: integer("actual_hours"),
  labels: jsonb("labels").default('[]'),
  metadata: jsonb("metadata"),
  createdAt: integer("created_at").notNull(),
  updatedAt: integer("updated_at").notNull(),
});

export const insertNoteSchema = createInsertSchema(notes);
export const selectNoteSchema = createSelectSchema(notes);
export const insertTaskSchema = createInsertSchema(tasks);
export const selectTaskSchema = createSelectSchema(tasks);

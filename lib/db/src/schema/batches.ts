import { pgTable, serial, integer, text, timestamp, real } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const batchesTable = pgTable("batches", {
  id: serial("id").primaryKey(),
  quantity: integer("quantity").notNull(),
  discountType: text("discount_type").notNull(),
  discountValue: real("discount_value"),
  freeItemName: text("free_item_name"),
  displayTitle: text("display_title").notNull(),
  displaySubtitle: text("display_subtitle"),
  language: text("language").default("en"),
  backgroundColor: text("background_color").default("#4a2c2a"),
  logoUrl: text("logo_url"),
  footerText: text("footer_text"),
  expiresAt: timestamp("expires_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertBatchSchema = createInsertSchema(batchesTable).omit({ id: true, createdAt: true });
export type InsertBatch = z.infer<typeof insertBatchSchema>;
export type Batch = typeof batchesTable.$inferSelect;

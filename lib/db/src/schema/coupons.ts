import { pgTable, serial, integer, text, timestamp, boolean, real } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { batchesTable } from "./batches";

export const couponsTable = pgTable("coupons", {
  id: serial("id").primaryKey(),
  batchId: integer("batch_id").notNull().references(() => batchesTable.id),
  code: text("code").notNull().unique(),
  discountType: text("discount_type").notNull(),
  discountValue: real("discount_value"),
  freeItemName: text("free_item_name"),
  displayTitle: text("display_title").notNull(),
  displaySubtitle: text("display_subtitle"),
  language: text("language").default("en"),
  backgroundColor: text("background_color").default("#4a2c2a"),
  logoUrl: text("logo_url"),
  footerText: text("footer_text"),
  isUsed: boolean("is_used").default(false).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  redeemedAt: timestamp("redeemed_at"),
  expiresAt: timestamp("expires_at"),
});

export const insertCouponSchema = createInsertSchema(couponsTable).omit({ id: true, createdAt: true });
export type InsertCoupon = z.infer<typeof insertCouponSchema>;
export type Coupon = typeof couponsTable.$inferSelect;

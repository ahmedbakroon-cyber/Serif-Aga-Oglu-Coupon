import { Router } from "express";
import { db } from "@workspace/db";
import { batchesTable, couponsTable } from "@workspace/db/schema";
import { CreateBatchBody } from "@workspace/api-zod";
import { eq, sql, and, isNull, or, gt } from "drizzle-orm";
import crypto from "crypto";

const router = Router();

function generateCode(): string {
  return crypto.randomBytes(4).toString("hex").toUpperCase();
}

router.get("/batches", async (req, res) => {
  try {
    const batches = await db.select().from(batchesTable).orderBy(sql`${batchesTable.createdAt} DESC`);

    const now = new Date();
    const result = await Promise.all(
      batches.map(async (batch) => {
        const coupons = await db
          .select()
          .from(couponsTable)
          .where(eq(couponsTable.batchId, batch.id));

        let activeCount = 0;
        let usedCount = 0;
        let expiredCount = 0;

        for (const c of coupons) {
          if (c.isUsed) {
            usedCount++;
          } else if (c.expiresAt && c.expiresAt < now) {
            expiredCount++;
          } else {
            activeCount++;
          }
        }

        return {
          ...batch,
          activeCount,
          usedCount,
          expiredCount,
        };
      })
    );

    res.json(result);
  } catch (err) {
    req.log.error({ err }, "Failed to list batches");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/batches", async (req, res) => {
  try {
    const parsed = CreateBatchBody.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: "Invalid request body", details: parsed.error.issues });
      return;
    }

    const data = parsed.data;

    const [batch] = await db
      .insert(batchesTable)
      .values({
        quantity: data.quantity,
        discountType: data.discountType,
        discountValue: data.discountValue ?? null,
        freeItemName: data.freeItemName ?? null,
        displayTitle: data.displayTitle,
        displaySubtitle: data.displaySubtitle ?? null,
        language: data.language ?? "en",
        backgroundColor: data.backgroundColor ?? "#4a2c2a",
        logoUrl: data.logoUrl ?? null,
        footerText: data.footerText ?? null,
        expiresAt: data.expiresAt ? new Date(data.expiresAt) : null,
      })
      .returning();

    const couponValues = [];
    for (let i = 0; i < data.quantity; i++) {
      couponValues.push({
        batchId: batch.id,
        code: generateCode(),
        discountType: data.discountType,
        discountValue: data.discountValue ?? null,
        freeItemName: data.freeItemName ?? null,
        displayTitle: data.displayTitle,
        displaySubtitle: data.displaySubtitle ?? null,
        language: data.language ?? "en",
        backgroundColor: data.backgroundColor ?? "#4a2c2a",
        logoUrl: data.logoUrl ?? null,
        footerText: data.footerText ?? null,
        isUsed: false,
        expiresAt: data.expiresAt ? new Date(data.expiresAt) : null,
      });
    }

    await db.insert(couponsTable).values(couponValues);

    res.status(201).json({
      ...batch,
      activeCount: data.quantity,
      usedCount: 0,
      expiredCount: 0,
    });
  } catch (err) {
    req.log.error({ err }, "Failed to create batch");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/batches/:batchId", async (req, res) => {
  try {
    const batchId = parseInt(req.params.batchId, 10);
    if (isNaN(batchId)) {
      res.status(400).json({ error: "Invalid batch ID" });
      return;
    }

    const [batch] = await db
      .select()
      .from(batchesTable)
      .where(eq(batchesTable.id, batchId));

    if (!batch) {
      res.status(404).json({ error: "Batch not found" });
      return;
    }

    const now = new Date();
    const coupons = await db
      .select()
      .from(couponsTable)
      .where(eq(couponsTable.batchId, batchId))
      .orderBy(couponsTable.id);

    const couponsWithStatus = coupons.map((c) => ({
      ...c,
      status: c.isUsed ? "used" : (c.expiresAt && c.expiresAt < now ? "expired" : "active"),
    }));

    res.json({
      ...batch,
      coupons: couponsWithStatus,
    });
  } catch (err) {
    req.log.error({ err }, "Failed to get batch");
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;

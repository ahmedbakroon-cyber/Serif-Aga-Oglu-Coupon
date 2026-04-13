import { Router } from "express";
import { db } from "@workspace/db";
import { couponsTable, batchesTable } from "@workspace/db/schema";
import { eq, and, sql } from "drizzle-orm";

const router = Router();

router.get("/coupons", async (req, res) => {
  try {
    const { batchId, status } = req.query;
    const now = new Date();

    let query = db.select().from(couponsTable).orderBy(sql`${couponsTable.createdAt} DESC`);

    let coupons = await query;

    if (batchId) {
      coupons = coupons.filter((c) => c.batchId === parseInt(batchId as string, 10));
    }

    const couponsWithStatus = coupons.map((c) => ({
      ...c,
      status: c.isUsed ? "used" : (c.expiresAt && c.expiresAt < now ? "expired" : "active"),
    }));

    if (status) {
      const filtered = couponsWithStatus.filter((c) => c.status === status);
      res.json(filtered);
      return;
    }

    res.json(couponsWithStatus);
  } catch (err) {
    req.log.error({ err }, "Failed to list coupons");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/coupons/:code", async (req, res) => {
  try {
    const { code } = req.params;
    const [coupon] = await db
      .select()
      .from(couponsTable)
      .where(eq(couponsTable.code, code));

    if (!coupon) {
      res.status(404).json({ error: "Coupon not found" });
      return;
    }

    const now = new Date();
    const status = coupon.isUsed ? "used" : (coupon.expiresAt && coupon.expiresAt < now ? "expired" : "active");

    res.json({
      code: coupon.code,
      discountType: coupon.discountType,
      discountValue: coupon.discountValue,
      freeItemName: coupon.freeItemName,
      displayTitle: coupon.displayTitle,
      displaySubtitle: coupon.displaySubtitle,
      language: coupon.language,
      backgroundColor: coupon.backgroundColor,
      logoUrl: coupon.logoUrl,
      footerText: coupon.footerText,
      status,
      expiresAt: coupon.expiresAt,
    });
  } catch (err) {
    req.log.error({ err }, "Failed to get coupon");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/coupons/:code/validate", async (req, res) => {
  try {
    const { code } = req.params;
    const [coupon] = await db
      .select()
      .from(couponsTable)
      .where(eq(couponsTable.code, code));

    if (!coupon) {
      res.json({ valid: false, message: "Coupon not found", coupon: null });
      return;
    }

    const now = new Date();
    const status = coupon.isUsed ? "used" : (coupon.expiresAt && coupon.expiresAt < now ? "expired" : "active");

    if (coupon.isUsed) {
      res.json({
        valid: false,
        message: "This coupon has already been redeemed",
        coupon: { ...coupon, status },
      });
      return;
    }

    if (coupon.expiresAt && coupon.expiresAt < now) {
      res.json({
        valid: false,
        message: "This coupon has expired",
        coupon: { ...coupon, status },
      });
      return;
    }

    res.json({
      valid: true,
      message: "Coupon is valid and ready to redeem",
      coupon: { ...coupon, status },
    });
  } catch (err) {
    req.log.error({ err }, "Failed to validate coupon");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/coupons/:code/redeem", async (req, res) => {
  try {
    const { code } = req.params;
    const [coupon] = await db
      .select()
      .from(couponsTable)
      .where(eq(couponsTable.code, code));

    if (!coupon) {
      res.status(404).json({ error: "Coupon not found" });
      return;
    }

    if (coupon.isUsed) {
      res.status(400).json({ error: "Coupon has already been redeemed" });
      return;
    }

    const now = new Date();
    if (coupon.expiresAt && coupon.expiresAt < now) {
      res.status(400).json({ error: "Coupon has expired" });
      return;
    }

    const [updated] = await db
      .update(couponsTable)
      .set({ isUsed: true, redeemedAt: now })
      .where(eq(couponsTable.code, code))
      .returning();

    res.json({ ...updated, status: "used" });
  } catch (err) {
    req.log.error({ err }, "Failed to redeem coupon");
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;

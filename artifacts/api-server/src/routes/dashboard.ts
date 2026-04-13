import { Router } from "express";
import { db } from "@workspace/db";
import { batchesTable, couponsTable } from "@workspace/db/schema";
import { sql, eq } from "drizzle-orm";

const router = Router();

router.get("/dashboard/summary", async (req, res) => {
  try {
    const batches = await db.select().from(batchesTable);
    const coupons = await db.select().from(couponsTable);
    const now = new Date();

    let activeCoupons = 0;
    let usedCoupons = 0;
    let expiredCoupons = 0;

    for (const c of coupons) {
      if (c.isUsed) {
        usedCoupons++;
      } else if (c.expiresAt && c.expiresAt < now) {
        expiredCoupons++;
      } else {
        activeCoupons++;
      }
    }

    const totalCoupons = coupons.length;
    const redemptionRate = totalCoupons > 0 ? Math.round((usedCoupons / totalCoupons) * 100) / 100 : 0;

    res.json({
      totalBatches: batches.length,
      totalCoupons,
      activeCoupons,
      usedCoupons,
      expiredCoupons,
      redemptionRate,
    });
  } catch (err) {
    req.log.error({ err }, "Failed to get dashboard summary");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/dashboard/recent-activity", async (req, res) => {
  try {
    const recentRedeemed = await db
      .select()
      .from(couponsTable)
      .where(sql`${couponsTable.redeemedAt} IS NOT NULL`)
      .orderBy(sql`${couponsTable.redeemedAt} DESC`)
      .limit(10);

    const recentCreated = await db
      .select()
      .from(couponsTable)
      .orderBy(sql`${couponsTable.createdAt} DESC`)
      .limit(10);

    const activities: Array<{
      id: number;
      type: string;
      couponCode: string;
      batchTitle: string;
      timestamp: Date;
    }> = [];

    for (const c of recentRedeemed) {
      activities.push({
        id: c.id * 1000 + 1,
        type: "redeemed",
        couponCode: c.code,
        batchTitle: c.displayTitle,
        timestamp: c.redeemedAt!,
      });
    }

    for (const c of recentCreated) {
      activities.push({
        id: c.id * 1000 + 2,
        type: "created",
        couponCode: c.code,
        batchTitle: c.displayTitle,
        timestamp: c.createdAt,
      });
    }

    activities.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
    res.json(activities.slice(0, 20));
  } catch (err) {
    req.log.error({ err }, "Failed to get recent activity");
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;

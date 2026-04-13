import { Router, type IRouter } from "express";
import healthRouter from "./health";
import batchesRouter from "./batches";
import couponsRouter from "./coupons";
import dashboardRouter from "./dashboard";

const router: IRouter = Router();

router.use(healthRouter);
router.use(batchesRouter);
router.use(couponsRouter);
router.use(dashboardRouter);

export default router;

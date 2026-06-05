import { Router, type IRouter } from "express";
import healthRouter from "./health";
import obrasRouter from "./obras";

const router: IRouter = Router();

router.use(healthRouter);
router.use(obrasRouter);

export default router;

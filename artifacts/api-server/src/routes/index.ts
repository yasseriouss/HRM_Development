import { Router, type IRouter } from "express";
import healthRouter from "./health";
import authRouter from "./auth";
import dashboardRouter from "./dashboard";
import departmentsRouter from "./departments";
import employeesRouter from "./employees";
import skillsRouter from "./skills";
import campaignsRouter from "./campaigns";
import evaluationsRouter from "./evaluations";
import trainingRouter from "./training";
import workflowsRouter from "./workflows";
import notificationsRouter from "./notifications";

const router: IRouter = Router();

router.use(healthRouter);
router.use("/auth", authRouter);
router.use("/dashboard", dashboardRouter);
router.use("/departments", departmentsRouter);
router.use("/employees", employeesRouter);
router.use("/skills", skillsRouter);
router.use("/campaigns", campaignsRouter);
router.use("/evaluations", evaluationsRouter);
router.use("/training", trainingRouter);
router.use("/workflows", workflowsRouter);
router.use("/notifications", notificationsRouter);

export default router;

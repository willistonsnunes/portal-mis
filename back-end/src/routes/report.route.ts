import { Router } from "express";
import { createReport, listReports, getReportById, updateReport, deactivateReport } from "../controllers/report.controller.js";
import { requireAdminOrSuper } from '../middlewares/role.middleware.js'

const reportRoutes = Router();

reportRoutes.post("/reports", requireAdminOrSuper, createReport);
reportRoutes.get("/reports", listReports);
reportRoutes.get("/reports/:id", getReportById);
reportRoutes.put("/reports/:id", requireAdminOrSuper, updateReport);
reportRoutes.delete("/reports/:id", requireAdminOrSuper, deactivateReport);

export default reportRoutes;

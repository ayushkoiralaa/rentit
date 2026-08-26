import { Router } from "express";
import {
  getAnalytics,
  listUsers,
  setUserStatus,
  listAllItems,
  moderateItem,
  listAllBookings,
  listReports,
  updateReportStatus,
  deleteReview,
  listAuditLogs,
} from "../controllers/adminController.js";
import { requireAuth, requireAdmin } from "../middleware/auth.js";

const router = Router();
router.use(requireAuth, requireAdmin);

router.get("/analytics", getAnalytics);

router.get("/users", listUsers);
router.patch("/users/:id/status", setUserStatus);

router.get("/listings", listAllItems);
router.patch("/listings/:id/moderate", moderateItem);

router.get("/bookings", listAllBookings);

router.get("/reports", listReports);
router.patch("/reports/:id", updateReportStatus);

router.delete("/reviews/:id", deleteReview);

router.get("/audit-logs", listAuditLogs);

export default router;

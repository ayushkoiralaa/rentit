import { Router } from "express";
import {
  listNotifications,
  markNotificationRead,
  markAllNotificationsRead,
} from "../controllers/notificationController.js";
import { requireAuth } from "../middleware/auth.js";

const router = Router();
router.use(requireAuth);

router.get("/", listNotifications);
router.patch("/:id/read", markNotificationRead);
router.patch("/read-all", markAllNotificationsRead);

export default router;

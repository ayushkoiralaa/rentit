import { Router } from "express";
import { body } from "express-validator";
import { listThreads, getConversation, sendMessage } from "../controllers/messageController.js";
import { requireAuth } from "../middleware/auth.js";
import { validate } from "../middleware/validate.js";

const router = Router();
router.use(requireAuth);

router.get("/threads", listThreads);
router.get("/with/:userId", getConversation);

router.post(
  "/",
  [
    body("receiverId").notEmpty().withMessage("receiverId is required."),
    body("body").trim().notEmpty().withMessage("Message cannot be empty.").isLength({ max: 2000 }),
  ],
  validate,
  sendMessage
);

export default router;

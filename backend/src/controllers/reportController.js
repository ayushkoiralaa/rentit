import asyncHandler from "express-async-handler";
import Report from "../models/Report.js";

export const createReport = asyncHandler(async (req, res) => {
  const { reportedUserId, itemId, reason, description } = req.body;
  const report = await Report.create({
    reporter: req.user._id,
    reportedUser: reportedUserId || null,
    item: itemId || null,
    reason,
    description,
  });
  res.status(201).json({ success: true, report });
});

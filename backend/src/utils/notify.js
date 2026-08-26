import Notification from "../models/Notification.js";

// MVP notifications are in-app only. Swap/extend this function later to
// also dispatch email/SMS/push without touching call sites.
export async function notify(userId, { type, title, message, link = "" }) {
  try {
    await Notification.create({ user: userId, type, title, message, link });
  } catch (err) {
    // A failed notification should never break the primary action (e.g.
    // accepting a booking) that triggered it.
    console.error("[notify] failed to create notification:", err.message);
  }
}

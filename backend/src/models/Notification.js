import mongoose from "mongoose";

const notificationSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    type: {
      type: String,
      enum: [
        "BOOKING_REQUEST_RECEIVED",
        "BOOKING_ACCEPTED",
        "BOOKING_REJECTED",
        "BOOKING_CANCELLED",
        "BOOKING_STARTING",
        "BOOKING_COMPLETED",
        "NEW_MESSAGE",
        "REVIEW_RECEIVED",
        "REPORT_UPDATE",
        "LISTING_STATUS_CHANGED",
      ],
      required: true,
    },
    title: { type: String, required: true },
    message: { type: String, required: true },
    link: { type: String, default: "" },
    read: { type: Boolean, default: false },
  },
  { timestamps: true }
);

notificationSchema.index({ user: 1, read: 1, createdAt: -1 });

export default mongoose.model("Notification", notificationSchema);

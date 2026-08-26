import mongoose from "mongoose";

// Bookings that "hold" a date range: overlap checks only consider these.
export const ACTIVE_HOLD_STATUSES = ["PENDING", "ACCEPTED", "ACTIVE"];

const bookingSchema = new mongoose.Schema(
  {
    item: { type: mongoose.Schema.Types.ObjectId, ref: "Item", required: true, index: true },
    renter: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    owner: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },

    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    numberOfDays: { type: Number, required: true },

    rentalAmount: { type: Number, required: true },
    platformFee: { type: Number, required: true },
    securityDeposit: { type: Number, default: 0 },
    totalAmount: { type: Number, required: true },
    currency: { type: String, default: "NPR" },

    status: {
      type: String,
      enum: ["PENDING", "ACCEPTED", "ACTIVE", "COMPLETED", "REJECTED", "CANCELLED", "DISPUTED"],
      default: "PENDING",
      index: true,
    },

    paymentStatus: {
      type: String,
      enum: ["UNPAID", "DEMO_PAID", "REFUNDED"],
      default: "UNPAID",
    },
    paymentReference: { type: String, default: "" },

    cancelReason: { type: String, default: "" },
    rejectReason: { type: String, default: "" },
  },
  { timestamps: true }
);

bookingSchema.index({ item: 1, status: 1, startDate: 1, endDate: 1 });

// Centralized, server-enforced state machine. Nothing outside this map
// is a legal transition — clients can never set status directly.
export const VALID_TRANSITIONS = {
  PENDING: ["ACCEPTED", "REJECTED", "CANCELLED"],
  ACCEPTED: ["ACTIVE", "CANCELLED"],
  ACTIVE: ["COMPLETED", "DISPUTED"],
  COMPLETED: [],
  REJECTED: [],
  CANCELLED: [],
  DISPUTED: [],
};

export default mongoose.model("Booking", bookingSchema);

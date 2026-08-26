import mongoose from "mongoose";

const reviewSchema = new mongoose.Schema(
  {
    booking: { type: mongoose.Schema.Types.ObjectId, ref: "Booking", required: true },
    item: { type: mongoose.Schema.Types.ObjectId, ref: "Item", required: true, index: true },
    reviewer: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    reviewee: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    rating: { type: Number, required: true, min: 1, max: 5 },
    comment: { type: String, trim: true, maxlength: 1000, default: "" },
  },
  { timestamps: true }
);

// One review per booking per reviewer — prevents duplicate reviews.
reviewSchema.index({ booking: 1, reviewer: 1 }, { unique: true });

export default mongoose.model("Review", reviewSchema);

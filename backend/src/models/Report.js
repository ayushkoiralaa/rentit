import mongoose from "mongoose";

const reportSchema = new mongoose.Schema(
  {
    reporter: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    reportedUser: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
    item: { type: mongoose.Schema.Types.ObjectId, ref: "Item", default: null },
    reason: {
      type: String,
      enum: ["SCAM", "FAKE_LISTING", "INCORRECT_INFORMATION", "INAPPROPRIATE_CONTENT", "UNSAFE_BEHAVIOR", "OTHER"],
      required: true,
    },
    description: { type: String, trim: true, maxlength: 1000, default: "" },
    status: { type: String, enum: ["OPEN", "REVIEWING", "RESOLVED", "DISMISSED"], default: "OPEN" },
  },
  { timestamps: true }
);

export default mongoose.model("Report", reportSchema);

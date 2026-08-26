import mongoose from "mongoose";

const auditLogSchema = new mongoose.Schema(
  {
    actor: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    action: { type: String, required: true },
    targetType: { type: String, required: true },
    targetId: { type: mongoose.Schema.Types.ObjectId, required: true },
    metadata: { type: mongoose.Schema.Types.Mixed, default: {} },
  },
  { timestamps: true }
);

export default mongoose.model("AuditLog", auditLogSchema);

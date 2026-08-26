import mongoose from "mongoose";

// Contextual messaging tied to an item/booking — not an open social network.
const messageSchema = new mongoose.Schema(
  {
    sender: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    receiver: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    item: { type: mongoose.Schema.Types.ObjectId, ref: "Item", default: null },
    booking: { type: mongoose.Schema.Types.ObjectId, ref: "Booking", default: null },
    body: { type: String, required: true, trim: true, maxlength: 2000 },
    read: { type: Boolean, default: false },
  },
  { timestamps: true }
);

messageSchema.index({ sender: 1, receiver: 1, createdAt: -1 });

export default mongoose.model("Message", messageSchema);

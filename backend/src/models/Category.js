import mongoose from "mongoose";

const categorySchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, lowercase: true, index: true },
    icon: { type: String, default: "Tag" }, // lucide-react icon name
    parent: { type: mongoose.Schema.Types.ObjectId, ref: "Category", default: null },
    // Set when a regular user creates their own category while posting an
    // item (as opposed to the built-in categories, which are seeded/admin
    // created and leave this null).
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
  },
  { timestamps: true }
);

categorySchema.index({ parent: 1 });

export default mongoose.model("Category", categorySchema);

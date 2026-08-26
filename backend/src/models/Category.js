import mongoose from "mongoose";

const categorySchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, lowercase: true, index: true },
    icon: { type: String, default: "Tag" }, // lucide-react icon name
    parent: { type: mongoose.Schema.Types.ObjectId, ref: "Category", default: null },
  },
  { timestamps: true }
);

categorySchema.index({ parent: 1 });

export default mongoose.model("Category", categorySchema);

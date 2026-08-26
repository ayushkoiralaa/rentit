import mongoose from "mongoose";

const itemSchema = new mongoose.Schema(
  {
    owner: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    category: { type: mongoose.Schema.Types.ObjectId, ref: "Category", required: true, index: true },

    title: { type: String, required: true, trim: true, maxlength: 120 },
    slug: { type: String, required: true, unique: true, index: true },
    description: { type: String, required: true, trim: true, maxlength: 3000 },

    condition: {
      type: String,
      enum: ["NEW", "LIKE_NEW", "GOOD", "FAIR"],
      default: "GOOD",
    },

    pricePerDay: { type: Number, required: true, min: 1 },
    securityDeposit: { type: Number, default: 0, min: 0 },

    images: [
      {
        url: { type: String, required: true },
        publicId: { type: String, default: "" },
      },
    ],

    location: { type: String, required: true, trim: true },
    city: { type: String, required: true, trim: true, index: true },

    rules: [{ type: String, trim: true }],

    // Extensible category-specific attributes (make/model, brand, etc.)
    // without needing a new table per category.
    attributes: { type: Map, of: String, default: {} },

    status: {
      type: String,
      enum: ["DRAFT", "PENDING_REVIEW", "PUBLISHED", "PAUSED", "REJECTED", "REMOVED"],
      default: "PUBLISHED",
      index: true,
    },
    rejectionReason: { type: String, default: "" },

    ratingAverage: { type: Number, default: 0 },
    ratingCount: { type: Number, default: 0 },
    favoriteCount: { type: Number, default: 0 },
    viewCount: { type: Number, default: 0 },
  },
  { timestamps: true }
);

itemSchema.index({ title: "text", description: "text" });
itemSchema.index({ status: 1, city: 1, category: 1 });
itemSchema.index({ pricePerDay: 1 });

export default mongoose.model("Item", itemSchema);

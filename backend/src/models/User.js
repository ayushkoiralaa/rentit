import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, maxlength: 80 },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, "Enter a valid email address."],
    },
    password: { type: String, required: true, minlength: 6, select: false },
    phone: { type: String, trim: true, default: "" },
    location: { type: String, trim: true, default: "" },
    bio: { type: String, trim: true, maxlength: 500, default: "" },
    avatarUrl: { type: String, default: "" },
    role: { type: String, enum: ["user", "admin"], default: "user" },
    status: { type: String, enum: ["active", "suspended"], default: "active" },
    ratingAverage: { type: Number, default: 0 },
    ratingCount: { type: Number, default: 0 },
  },
  { timestamps: true }
);

userSchema.pre("save", async function hashPassword(next) {
  if (!this.isModified("password")) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

userSchema.methods.comparePassword = function comparePassword(candidate) {
  return bcrypt.compare(candidate, this.password);
};

// Never leak password/internal fields even if a document slips through
// without an explicit projection.
userSchema.set("toJSON", {
  transform: (_doc, ret) => {
    delete ret.password;
    delete ret.__v;
    return ret;
  },
});

export default mongoose.model("User", userSchema);

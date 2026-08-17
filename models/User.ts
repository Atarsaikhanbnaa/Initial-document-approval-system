import mongoose, { Schema, models } from "mongoose";

const UserSchema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    username: { type: String, required: true, unique: true, trim: true, lowercase: true },
    passwordHash: { type: String, required: true },
    department: { type: String, required: true },
    position: { type: String, required: true },
    role: {
      type: String,
      enum: ["EMPLOYEE", "REVIEWER", "DIRECTOR", "ADMIN"],
      default: "EMPLOYEE",
    },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export default models.User || mongoose.model("User", UserSchema);

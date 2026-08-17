import mongoose, { Schema, models } from "mongoose";

const DocumentLogSchema = new Schema(
  {
    documentId: { type: Schema.Types.ObjectId, ref: "Document", required: true },
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    userName: { type: String, required: true },
    department: { type: String, required: true },
    position: { type: String, required: true },
    action: {
      type: String,
      enum: ["UPLOADED", "VIEWED", "DOWNLOADED", "EDITED", "SUBMITTED", "REVIEWED", "APPROVED", "REJECTED", "RETURNED", "COMMENTED"],
      required: true,
    },
    description: { type: String, default: "" },
  },
  { timestamps: true }
);

export default models.DocumentLog || mongoose.model("DocumentLog", DocumentLogSchema);

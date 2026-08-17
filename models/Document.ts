import mongoose, { Schema, models } from "mongoose";

const DocumentSchema = new Schema(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, default: "" },
    originalFileName: { type: String, required: true },
    currentFileName: { type: String, required: true },
    currentFileUrl: { type: String, required: true },
    uploadedBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
    uploadedByName: { type: String, required: true },
    currentReviewer: { type: Schema.Types.ObjectId, ref: "User", default: null },
    currentReviewerName: { type: String, default: "" },
    status: {
      type: String,
      enum: ["DRAFT", "SUBMITTED", "UNDER_REVIEW", "REVISION", "REVIEWED", "APPROVED", "REJECTED"],
      default: "SUBMITTED",
    },
    version: { type: Number, default: 1 },
  },
  { timestamps: true }
);

export default models.Document || mongoose.model("Document", DocumentSchema);

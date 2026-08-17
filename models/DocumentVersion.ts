import mongoose, { Schema, models } from "mongoose";

const DocumentVersionSchema = new Schema(
  {
    documentId: { type: Schema.Types.ObjectId, ref: "Document", required: true },
    version: { type: Number, required: true },
    fileName: { type: String, required: true },
    fileUrl: { type: String, required: true },
    uploadedBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
    uploadedByName: { type: String, required: true },
    position: { type: String, required: true },
    note: { type: String, default: "" },
  },
  { timestamps: true }
);

export default models.DocumentVersion || mongoose.model("DocumentVersion", DocumentVersionSchema);

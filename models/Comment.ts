import mongoose, { Schema, models } from "mongoose";

const CommentSchema = new Schema(
  {
    documentId: { type: Schema.Types.ObjectId, ref: "Document", required: true },
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    userName: { type: String, required: true },
    position: { type: String, required: true },
    text: { type: String, required: true, trim: true },
  },
  { timestamps: true }
);

export default models.Comment || mongoose.model("Comment", CommentSchema);

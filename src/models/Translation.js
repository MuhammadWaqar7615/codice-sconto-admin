import mongoose from "mongoose";

const translationSchema = new mongoose.Schema(
  {
    key: { type: String, required: true, unique: true, trim: true },
    source: { type: String, required: true, trim: true },
    value: { type: String, default: "", trim: true },
  },
  { timestamps: true }
);

const Translation = mongoose.models.Translation || mongoose.model("Translation", translationSchema);

export default Translation;

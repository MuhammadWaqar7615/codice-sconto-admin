import mongoose from "mongoose";

const emailTemplateSchema = new mongoose.Schema(
  {
    templateKey: { type: String, required: true, unique: true, trim: true },
    title: { type: String, required: true, trim: true, maxlength: 160 },
    fromName: { type: String, default: "CodiceSconto", trim: true, maxlength: 120 },
    sendAsPlainText: { type: Boolean, default: false },
    status: { type: String, enum: ["enabled", "disabled"], default: "enabled" },
    subject: { type: String, required: true, trim: true, maxlength: 240 },
    message: { type: String, required: true, maxlength: 20000 },
  },
  { timestamps: true }
);

const EmailTemplate = mongoose.models.EmailTemplate || mongoose.model("EmailTemplate", emailTemplateSchema);

export default EmailTemplate;

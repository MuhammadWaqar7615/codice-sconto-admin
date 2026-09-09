import mongoose from "mongoose";

const seoPageSchema = new mongoose.Schema(
  {
    pageName: {
      type: String,
      required: [true, "Page name is required"],
      trim: true,
      maxlength: 120,
    },
    path: {
      type: String,
      required: [true, "Page path is required"],
      trim: true,
      unique: true,
      lowercase: true,
      maxlength: 200,
    },
    title: {
      type: String,
      trim: true,
      maxlength: 160,
      default: "",
    },
    description: {
      type: String,
      trim: true,
      maxlength: 320,
      default: "",
    },
    keywords: {
      type: [String],
      default: [],
    },
    canonicalUrl: {
      type: String,
      trim: true,
      default: "",
    },
    robots: {
      index: { type: Boolean, default: true },
      follow: { type: Boolean, default: true },
      noarchive: { type: Boolean, default: false },
      nosnippet: { type: Boolean, default: false },
      noimageindex: { type: Boolean, default: false },
    },
    openGraph: {
      title: { type: String, trim: true, default: "" },
      description: { type: String, trim: true, default: "" },
      image: { type: String, trim: true, default: "" },
      type: { type: String, trim: true, default: "website" },
    },
    twitter: {
      card: { type: String, trim: true, default: "summary_large_image" },
      title: { type: String, trim: true, default: "" },
      description: { type: String, trim: true, default: "" },
      image: { type: String, trim: true, default: "" },
    },
    schema: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

seoPageSchema.index({ path: 1 }, { unique: true });
seoPageSchema.index({ isActive: 1, path: 1 });

const SeoPage = mongoose.models.SeoPage || mongoose.model("SeoPage", seoPageSchema);

export default SeoPage;

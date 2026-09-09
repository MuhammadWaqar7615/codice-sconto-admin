import mongoose from "mongoose";

const globalSeoSchema = new mongoose.Schema(
  {
    siteName: {
      type: String,
      trim: true,
      maxlength: 120,
      default: "",
    },
    siteUrl: {
      type: String,
      trim: true,
      default: "",
    },
    defaultTitle: {
      type: String,
      trim: true,
      maxlength: 160,
      default: "",
    },
    titleTemplate: {
      type: String,
      trim: true,
      maxlength: 160,
      default: "%s",
    },
    defaultDescription: {
      type: String,
      trim: true,
      maxlength: 320,
      default: "",
    },
    defaultKeywords: {
      type: [String],
      default: [],
    },
    defaultOgImage: {
      type: String,
      trim: true,
      default: "",
    },
    twitterHandle: {
      type: String,
      trim: true,
      default: "",
    },
    favicon: {
      type: String,
      trim: true,
      default: "",
    },
    socialLinks: {
      facebook: { type: String, trim: true, default: "" },
      instagram: { type: String, trim: true, default: "" },
      linkedin: { type: String, trim: true, default: "" },
      youtube: { type: String, trim: true, default: "" },
      twitter: { type: String, trim: true, default: "" },
    },
  },
  { timestamps: true }
);

const GlobalSeo = mongoose.models.GlobalSeo || mongoose.model("GlobalSeo", globalSeoSchema);

export default GlobalSeo;

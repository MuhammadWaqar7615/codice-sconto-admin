import mongoose from "mongoose";

const sitemapConfigSchema = new mongoose.Schema(
  {
    siteUrl: {
      type: String,
      required: [true, "Site URL is required"],
      trim: true,
      default: "https://www.codicesconto.com",
    },
    includeHome: {
      type: Boolean,
      default: true,
    },
    includeStores: {
      type: Boolean,
      default: true,
    },
    includeCategories: {
      type: Boolean,
      default: true,
    },
    includeSubcategories: {
      type: Boolean,
      default: true,
    },
    includeBlog: {
      type: Boolean,
      default: true,
    },
    includeSeoPages: {
      type: Boolean,
      default: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

const SitemapConfig = mongoose.models.SitemapConfig || mongoose.model("SitemapConfig", sitemapConfigSchema);

export default SitemapConfig;

import mongoose from "mongoose";

const robotsConfigSchema = new mongoose.Schema(
  {
    allowCrawlers: {
      type: Boolean,
      default: true,
    },
    sitemapUrl: {
      type: String,
      trim: true,
      default: "https://www.codicesconto.com/sitemap.xml",
    },
    disallowPaths: {
      type: [String],
      default: ["/api/", "/dashboard/", "/account/"],
    },
    additionalRules: {
      type: String,
      trim: true,
      default: "",
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

const RobotsConfig = mongoose.models.RobotsConfig || mongoose.model("RobotsConfig", robotsConfigSchema);

export default RobotsConfig;

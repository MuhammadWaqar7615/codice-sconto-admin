import mongoose from "mongoose";

const themeSchema = new mongoose.Schema(
  {
    primaryColor: { type: String, default: "#1B2A4A", match: /^#[0-9A-Fa-f]{6}$/ },
    secondaryColor: { type: String, default: "#243B6A", match: /^#[0-9A-Fa-f]{6}$/ },
    layoutHeader: { type: String, enum: ["style-1", "style-2"], default: "style-1" },
    mobileHeader: { type: String, enum: ["style-1", "style-2"], default: "style-1" },
    headerStyle: { type: String, enum: ["style-1", "style-2", "style-3"], default: "style-1" },
    homeStyle: { type: String, enum: ["home-1", "home-2", "home-3"], default: "home-1" },
    logo: { type: String, default: "" },
    transparentLogo: { type: String, default: "" },
    favicon: { type: String, default: "" },
    homeBackgroundImage: { type: String, default: "" },
  },
  { timestamps: true }
);

const Theme = mongoose.models.Theme || mongoose.model("Theme", themeSchema);

export default Theme;

import mongoose from "mongoose";

const siteSettingsSchema = new mongoose.Schema(
  {
    maintenanceMode: { type: Boolean, default: false },
    languageDirection: { type: String, enum: ["ltr", "rtl"], default: "ltr" },
    currencySymbol: { type: String, default: "€", trim: true, maxlength: 8 },
    currencyPosition: { type: String, enum: ["before", "after", "before-space", "after-space"], default: "before" },
    decimalSeparator: { type: String, enum: [".", ","], default: "." },
    decimalNumber: { type: Number, min: 0, max: 6, default: 2 },
    dateFormat: { type: String, default: "DD/MM/YYYY" },
    timeZone: { type: String, default: "Europe/Rome" },
    defaultPages: {
      search: { type: String, default: "" },
      privacyPolicy: { type: String, default: "" },
      termsConditions: { type: String, default: "" },
      categories: { type: String, default: "" },
      stores: { type: String, default: "" },
      locations: { type: String, default: "" },
    },
    companyInfo: {
      facebook: { type: String, default: "" }, twitter: { type: String, default: "" }, youtube: { type: String, default: "" }, instagram: { type: String, default: "" }, linkedin: { type: String, default: "" }, whatsapp: { type: String, default: "" },
    },
    smtp: {
      recipientEmail: { type: String, default: "" }, host: { type: String, default: "" }, email: { type: String, default: "" }, password: { type: String, default: "" }, encryption: { type: String, enum: ["none", "ssl", "tls"], default: "tls" }, port: { type: Number, min: 1, max: 65535, default: 587 },
    },
    googleAnalyticsCode: { type: String, default: "" },
    googleRecaptchaKey: { type: String, default: "" },
    googleRecaptchaSecret: { type: String, default: "" },
  },
  { timestamps: true }
);

const SiteSettings = mongoose.models.SiteSettings || mongoose.model("SiteSettings", siteSettingsSchema);

export default SiteSettings;

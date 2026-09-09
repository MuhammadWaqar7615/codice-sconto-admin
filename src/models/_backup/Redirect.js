import mongoose from "mongoose";

const redirectSchema = new mongoose.Schema(
  {
    source: {
      type: String,
      required: [true, "Redirect source is required"],
      trim: true,
      unique: true,
      maxlength: 200,
    },
    target: {
      type: String,
      required: [true, "Redirect target is required"],
      trim: true,
      maxlength: 500,
    },
    statusCode: {
      type: Number,
      enum: [301, 302, 307, 308],
      default: 301,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    notes: {
      type: String,
      trim: true,
      maxlength: 500,
      default: "",
    },
  },
  { timestamps: true }
);

redirectSchema.index({ source: 1 }, { unique: true });
redirectSchema.index({ isActive: 1, source: 1 });

const Redirect = mongoose.models.Redirect || mongoose.model("Redirect", redirectSchema);

export default Redirect;

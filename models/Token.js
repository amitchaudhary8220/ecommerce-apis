const { types, required } = require("joi");
const mongoose = require("mongoose");

const TokenSchema = mongoose.Schema(
  {
    refreshToken: {
      type: String,
      required: [true, "Please provide refresh token"],
    },
    ip: {
      type: String,
      required: true,
    },
    userAgent: { type: String, required: true },
    isValid: {
      type: Boolean,
      default: true,
    },
    user: {
      type: mongoose.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Token", TokenSchema);

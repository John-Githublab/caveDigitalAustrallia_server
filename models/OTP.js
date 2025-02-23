let mongoose = require("mongoose");

let userOtpSchema = mongoose.Schema({
  otp: {
    type: String,
  },
  userId: {
    type: String,
    required: true,
  },
  createdAt: {
    type: Number,
    default: Math.floor(Date.now() / 1000),
  },
  expireAt: {
    type: Date,
    default: Date.now(),
    expires: 600,
  },
});
const collectionName = "userOtps";
module.exports = mongoose.model("UserOtp", userOtpSchema, collectionName);

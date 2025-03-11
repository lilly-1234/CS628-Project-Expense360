const mongoose = require("mongoose");
// define the schema for account
const AccountSchema = new mongoose.Schema({
  user_id: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  type: { type: String, enum: ["debit", "credit"], required: true },
  bankName: String,
  balance: Number,
  accountNumber: String,
  createdAt: { type: Date, default: Date.now },
});
module.exports = mongoose.model("Account", AccountSchema);

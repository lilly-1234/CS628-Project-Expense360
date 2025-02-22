const mongoose = require("mongoose");
const TransactionSchema = new mongoose.Schema({
  user_id: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  account_id: { type: mongoose.Schema.Types.ObjectId, ref: "Account" },
  date: { type: Date, required: true },
  name: String,
  category: String,
  amount: Number,
  createdAt: { type: Date, default: Date.now },
});
module.exports = mongoose.model("Transaction", TransactionSchema);

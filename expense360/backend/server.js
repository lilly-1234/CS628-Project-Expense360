const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();

const app = express();
app.use(cors());
app.use(express.json());

mongoose
  .connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log("Connected to MongoDB"))
  .catch((err) => console.error("MongoDB connection error:", err));

const User = require("./models/User");
const Account = require("./models/Account");
const Transaction = require("./models/Transaction");

// Used for dumping data
app.post("/register", async (req, res) => {
  try {
    const { name, email, password, role } = req.body;
    const newUser = new User({ name, email, password, role });
    await newUser.save();
    res.status(201).json({ message: "User registered successfully", user: newUser });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Used for dumping data
app.get("/users", async (req, res) => {
  try {
    const users = await User.find();
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post("/validateUser", async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email, password });
    if (user) {
      res.json({ valid: true, user });
    } else {
      res.status(401).json({ valid: false, message: "Invalid credentials" });
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Used for dumping data
app.post("/accounts", async (req, res) => {
  try {
    const { user_id, type, bankName, balance, accountNumber } = req.body;
    const newAccount = new Account({ user_id, type, bankName, balance, accountNumber });
    await newAccount.save();
    res.status(201).json({ message: "Account created successfully", account: newAccount });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

app.get("/accounts/:userId", async (req, res) => {
  try {
    const accounts = await Account.find({ user_id: req.params.userId });
    res.json(accounts);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Used for dumping data
app.post("/transactions", async (req, res) => {
  try {
    const { user_id, account_id, date, name, category, amount } = req.body;
    const newTransaction = new Transaction({ user_id, account_id, date, name, category, amount });
    await newTransaction.save();
    res.status(201).json({ message: "Transaction added successfully", transaction: newTransaction });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

app.put("/transactions/:transactionId", async (req, res) => {
  try {
    const { transactionId } = req.params;
    const { date, name, category, amount } = req.body;

    const updatedTransaction = await Transaction.findByIdAndUpdate(
      transactionId,
      { date, name, category, amount },
      { new: true, runValidators: true }
    );

    if (!updatedTransaction) {
      return res.status(400).json({ error: "Transaction not found" });
    }

    res.json({ message: "Transaction updated successfully", transaction: updatedTransaction });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});


app.get("/transactions/:userId", async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 50;
    const transactions = await Transaction.find({ user_id: req.params.userId })
      .sort({ date: -1 })
      .limit(limit);
      
    res.json(transactions);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Used for dumping data
app.get("/transactions/:userId/:category", async (req, res) => {
  try {
    const transactions = await Transaction.find({
      user_id: req.params.userId,
      category: req.params.category,
    });
    res.json(transactions);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

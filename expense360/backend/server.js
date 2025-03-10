const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const axios = require("axios");
require("dotenv").config();

const app = express();
app.use(cors());
app.use(express.json());

app.get("/test", (req, res) => {
  res.json({ message: "CORS is working!" });
});

mongoose
  .connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log("Connected to MongoDB"))
  .catch((err) => console.error("MongoDB connection error:", err));

const User = require("./models/User");
const Account = require("./models/Account");
const Transaction = require("./models/Transaction");

app.post("/api/chat", async (req, res) => {
  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");

  const userMessage = req.body.message || "Hello!";

  try {
    const accountResults = await Account.find({ $text: { $search: userMessage } }).limit(10).lean();
    const transactionResults = await Transaction.find({ $text: { $search: userMessage } }).limit(3).lean();
    const accountContext = accountResults
      .map((acc) =>
        `Bank Name: ${acc.bank_name || "N/A"}, Type: ${acc.type}, Balance: $${acc.balance || acc.outstanding_balance || "N/A"}`
      )
      .join("\n");
    const transactionContext = transactionResults
      .map((txn) => `Name: ${txn.name} eAmount: $${txn.amount}, Type: ${txn.category}, Date: ${txn.date}`)
      .join("\n");


    const context = `Accounts:\n${accountContext}\n\nTransactions:\n${transactionContext}`;
    const augmentedPrompt = `Context:\n${context}\n\nUser: ${userMessage}\nBot:`;

    console.log(augmentedPrompt)
    const response = await axios.post("http://127.0.0.1:11434/api/generate", {
      model: "gemma2:2b",
      prompt: augmentedPrompt,
      stream: true,
    }, { responseType: "stream" });

    response.data.on("data", (chunk) => {
      const decodedChunk = chunk.toString();
      console.log("Chunk received:", decodedChunk);

      // Modify to ensure it sends valid JSON
      try {
        const jsonResponse = JSON.parse(decodedChunk);
        res.write(`data: ${JSON.stringify(jsonResponse)}\n\n`);
      } catch (error) {
        console.error("Error parsing chunk:", error);
      }
    });

    response.data.on("end", () => {
      res.write("data: [DONE]\n\n");
      res.end();
    });

  } catch (error) {
    console.error("Error:", error.message);
    res.status(500).write("data: {\"error\": \"Failed to get response from Ollama.\"}\n\n");
    res.end();
  }
});

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

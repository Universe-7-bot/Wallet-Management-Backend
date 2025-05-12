const Wallet = require("../models/Wallet");
const Transaction = require("../models/Transaction");
const User = require("../models/User");
const mongoose = require("mongoose");

const transferMoney = async (req, res, next) => {
  const { amount, senderId, recipientId, notes } = req.body;
  try {
    if (amount <= 0)
      return res.status(400).json({ message: "Please provide valid amount" });

    const senderWallet = await Wallet.findOne({ user: req.user._id });
    if (!senderWallet || senderWallet.balance < amount) {
      return res.status(400).json({ message: "Insufficient funds" });
    }

    const recipientWallet = await Wallet.findById(recipientId);

    if (!recipientWallet) {
      return res.status(404).json({ message: "Recipient wallet not found" });
    }

    const recipientUserId = recipientWallet.user;
    const recipient = await User.findById(recipientUserId);
    const sender = req.user;

    const transaction = await Transaction.create({
      sender: req.user._id,
      recipient: recipient._id,
      amount,
      type: "transfer",
      status: "completed",
      notes,
    });

    senderWallet.balance -= Number(amount);
    recipientWallet.balance += Number(amount);

    await senderWallet.save();
    await recipientWallet.save();

    // also updating balance for user (not necessary)
    sender.balance -= Number(amount);
    recipient.balance += Number(amount);

    await sender.save();
    await recipient.save();

    await User.findByIdAndUpdate(
      sender._id,
      { $inc: { moneySend: 1 } },
      { new: true }
    );

    await User.findByIdAndUpdate(
      recipient._id,
      { $inc: { moneyReceived: 1 } },
      { new: true }
    );

    if (transaction) {
      return res.status(201).json({
        message: "Transfer completed successfully",
        data: transaction,
      });
    }

    return res.status(400).json({ message: "Transfer failed" });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const getTransactions = async (req, res) => {
  try {
    const transactions = await Transaction.find({
      $or: [{ sender: req.user._id }, { recipient: req.user._id }],
    })
      .sort({ createdAt: -1 })
      .populate("sender", "name email")
      .populate("recipient", "name email");

    if (transactions)
      return res.status(200).json({
        count: transactions.length,
        data: transactions,
      });

    return req.status(400).json({ message: "Transactions not found" });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

module.exports = { transferMoney, getTransactions };

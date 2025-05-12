const Wallet = require("../models/Wallet");
const Transaction = require("../models/Transaction");
const User = require("../models/User");

const requestMoney = async (req, res) => {
  try {
    const { receiverId, amount, notes } = req.body;

    if (!receiverId || !amount || !notes || amount <= 0) {
      return res
        .status(400)
        .json({ message: "please include all valid fields" });
    }

    const receiverWallet = await Wallet.findById(receiverId);
    if (req.user._id == receiverWallet.user || !receiverWallet)
      return res.status(400).json({ message: "Request not sent" });

    const transaction = await Transaction.create({
      sender: req.user._id,
      recipient: receiverWallet.user,
      amount,
      type: "request",
      status: "pending",
      notes,
    });

    await User.findByIdAndUpdate(
      receiverWallet.user.toString(),
      { $inc: { requestReceived: 1 } },
      { new: true }
    );

    res.status(200).json({
      success: true,
      data: transaction,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message,
    });
  }
};

const getAllRequests = async (req, res) => {
  try {
    const requests = await Transaction.find({
      recipient: req.user._id,
      type: "request",
      status: "pending",
    })
      .sort({ createdAt: -1 })
      .populate("sender", "name email")
      .populate("recipient", "name email");

    res.status(200).json({
      success: true,
      count: requests.length,
      data: requests,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message,
    });
  }
};

const acceptRequest = async (req, res) => {
  try {
    const transaction = await Transaction.findById(req.params.id);

    if (!transaction) {
      return res.status(404).json({
        success: false,
        error: "Transaction not found",
      });
    }

    // Verify this request was sent to the current user
    if (transaction.recipient.toString() !== req.user._id.toString()) {
      return res.status(401).json({
        success: false,
        error: "Not authorized to accept this request",
      });
    }

    // Check if already processed
    if (transaction.status !== "pending") {
      return res.status(400).json({
        success: false,
        error: "This request has already been processed",
      });
    }
    // Check if receiver has enough balance
    const recipientWallet = await Wallet.findOne({ user: req.user._id });

    if (!recipientWallet || recipientWallet.balance < transaction.amount) {
      return res.status(400).json({
        success: false,
        error: "Insufficient funds",
      });
    }

    const senderWallet = await Wallet.findOne({
      user: transaction.sender,
    });

    if (!senderWallet) {
      return res.status(404).json({
        success: false,
        error: "Sender wallet not found",
      });
    }

    transaction.status = "completed";
    await transaction.save();

    senderWallet.balance += Number(transaction.amount);
    recipientWallet.balance -= Number(transaction.amount);

    await senderWallet.save();
    await recipientWallet.save();

    //Not necessary
    await User.findByIdAndUpdate(transaction.sender.toString(), {
      $inc: { balance: Number(transaction.amount) },
    });

    await User.findByIdAndUpdate(transaction.recipient.toString(), {
      $inc: { balance: -Number(transaction.amount) },
    });

    res.status(200).json({
      success: true,
      data: transaction,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message,
    });
  }
};

const denyRequest = async (req, res) => {
  try {
    const transaction = await Transaction.findById(req.params.id);

    if (!transaction) {
      return res.status(404).json({
        success: false,
        error: "Transaction not found",
      });
    }

    // Verify this request was sent to the current user
    if (transaction.recipient.toString() !== req.user._id.toString()) {
      return res.status(401).json({
        success: false,
        error: "Not authorized to deny this request",
      });
    }

    // Check if already processed
    if (transaction.status !== "pending") {
      return res.status(400).json({
        success: false,
        error: "This request has already been processed",
      });
    }

    transaction.status = "rejected";
    await transaction.save();

    res.status(200).json({
      success: true,
      data: transaction,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message,
    });
  }
};

module.exports = { requestMoney, getAllRequests, acceptRequest, denyRequest };

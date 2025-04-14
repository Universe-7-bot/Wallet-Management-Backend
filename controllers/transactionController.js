const Wallet = require('../models/Wallet');
const Transaction = require('../models/Transaction');
const User = require('../models/Wallet');

const transferMoney = async (req, res, next) => {
    const { amount, senderId, receiverId, transactionType, notes } = req.body;
    try {
        const receiverUser = await User.findById(receiverId);
        if (!receiverUser)
            return res.status(400).json({ message: "Recipient not found" });

        if (req.user._id != senderId)
            return res.status(400).json({ message: "Sender not logged in" });

        if (amount <= 0)
            return res.status(400).json({ message: "Please provide valid amount" });

        const senderWallet = Wallet.findOne({ user: req.user._id });
        if (!senderWallet || senderWallet.balance < amount) {
            return res.status(400).json({ message: 'Insufficient funds' });
        }

        const recipientWallet = await Wallet.findOne({ user: receiverId });
        if (!recipientWallet) {
            return res.status(404).json({ message: 'Recipient wallet not found' });
        }

        const transaction = await Transaction.create({
            sender: req.user._id,
            recipient: receiverId,
            amount,
            type: transactionType,
            status: 'completed',
            notes
        });

        senderWallet.balance -= Number(amount);
        recipientWallet.balance += Number(amount);

        await senderWallet.save();
        await recipientWallet.save();

        // also updating balance for user (not necessary)
        await User.findByIdAndUpdate(senderId, {
            $inc: { balance: -amount },
        })

        await User.findByIdAndUpdate(receiverId, {
            $inc: { balance: amount },
        })

        await User.findByIdAndUpdate(
            senderId,
            { $inc: { moneySend: 1 } },
            { new: true }
        )

        await User.findByIdAndUpdate(
            receiverId,
            { $inc: { moneyReceived: 1 } },
            { new: true }
        )

        if (transaction) {
            return res.status(201).json({ message: "Transfer completed successfully", data: transaction });
        }

        return res.status(400).json({ message: "Transfer failed" });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

const getTransactions = async (req, res) => {
    try {
        const transactions = await Transaction.find({
            $or: [
                { sender: req.user._id },
                { recipient: req.user._id }
            ]
        })
            .sort({ createdAt: -1 })
            .populate('sender', 'name email')
            .populate('recipient', 'name email');

        if (transactions)
            return res.status(200).json({
                count: transactions.length,
                data: transactions
            });

        return req.status(400).json({ message: "Transactions not found" });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

module.exports = { transferMoney, getTransactions };
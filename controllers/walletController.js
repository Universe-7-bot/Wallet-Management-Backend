const Wallet = require('../models/Wallet');
const Transaction = require('../models/Transaction');
const User = require('../models/Wallet');

const getWallet = async (req, res, next) => {
    try {
        const wallet = await Wallet.findOne({ user: req.user._id });

        if (!wallet) {
            return res.status(404).json({ message: "Wallet not found" });
        }

        res.status(200).json({ data: wallet });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

const addMoney = async (req, res, next) => {
    try {
        const { amount } = req.body;

        if (!amount || amount <= 0) {
            return res.status(400).json({ message: 'Please add a valid amount' });
        }

        // both user and wallet balance are updated (not necessary)
        const user = await User.findById(req.user._id);
        const wallet = await Wallet.findOne({ user: req.user._id });

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        if (!wallet) {
            return res.status(404).json({ message: 'Wallet not found' });
        }

        await User.findByIdAndUpdate(
            user._id,
            { $inc: { balance: amount } },
            { new: true }
        )

        wallet.balance += Number(amount);
        await wallet.save();

        res.status(200).json({ message: `${amount} added to your account`, data: wallet });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

module.exports = { getWallet, addMoney };
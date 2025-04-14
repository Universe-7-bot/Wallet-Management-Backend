const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Please add a name'],
    },
    email: {
        type: String,
        required: [true, 'Please add an email'],
        unique: true,
    },
    phone: {
        type: String,
        required: [true, 'Please add a phone number'],
    },
    password: {
        type: String,
        required: [true, 'Please add a password'],
        min: [6, 'password must contain at least 6 numbers'],
        max: 12,
    },
    balance: {
        type: Number,
        default: 0,
    },
    moneySend: {
        type: Number,
        default: 0,
    },
    moneyReceived: {
        type: Number,
        default: 0,
    },
    requestReceived: {
        type: Number,
        default: 0,
    },
    transactionLimit: {
        type: Number,
        default: 5000, // Daily transaction limit in rupees
    },
    address: {
        type: String,
        required: true,
    },
    // image: {
    //     type: String,
    // },
    isVerified: {
        type: Boolean,
        default: false,
    },
    isAdmin: {
        type: Boolean,
        default: false,
    },
}, { timestamps: true });

module.exports = mongoose.model('User', UserSchema);
